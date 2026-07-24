<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'inventory':
        $equip = $db->find('equipment', [], ['sort' => ['name' => 1]]);
        $chems = $db->find('chemicals', [], ['sort' => ['name' => 1]]);
        foreach ($chems as &$c) { $c['stock'] = $c['quantity']; $c['minStock'] = $c['min_stock']; }
        echo json_encode(['equipment' => $equip, 'chemicals' => $chems]);
        break;
    case 'attendance':
        $att = $db->find('attendance', [], ['limit' => 100, 'sort' => ['date' => -1]]);
        foreach ($att as &$a) { $a['name'] = $a['student_name']; $a['rollNo'] = $a['roll_no']; $a['timeIn'] = $a['time_in']; $a['timeOut'] = $a['time_out']; }
        $tasks = $db->find('tasks', [], ['limit' => 50, 'sort' => ['due_date' => -1]]);
        echo json_encode(['attendance' => $att, 'tasks' => $tasks]);
        break;
    case 'maintenance':
        $maint = $db->find('equipment', [], ['sort' => ['next_maintenance' => 1]]);
        foreach ($maint as &$m) { $m['brand'] = $m['manufacturer']; }
        echo json_encode(['maintenance' => $maint]);
        break;
    case 'master':
        $totalLabs = $db->count('labs');
        $activeEquip = $db->count('equipment', ['status' => 'operational']);
        $maintEquip = $db->count('equipment', ['status' => 'maintenance']);
        
        $chemicals = $db->find('chemicals');
        $lowStock = 0;
        $critical = 0;
        $lowList = [];
        foreach ($chemicals as $c) {
            $qty = (float)($c['quantity'] ?? 0);
            $min = (float)($c['min_stock'] ?? 0);
            if ($qty <= 0) {
                $critical++;
                $lowStock++;
                $lowList[] = ['name' => $c['name'], 'stock' => $qty, 'unit' => $c['unit'], 'minStock' => $min];
            } elseif ($qty <= $min) {
                $lowStock++;
                $lowList[] = ['name' => $c['name'], 'stock' => $qty, 'unit' => $c['unit'], 'minStock' => $min];
            }
        }
        
        $expiring = $db->count('chemicals', [
            'expiry' => [
                '$ne' => null,
                '$lte' => date('Y-m-d', strtotime('+30 days'))
            ]
        ]);
        
        echo json_encode([
            'summary' => [
                'totalLabs' => $totalLabs, 'activeEquip' => $activeEquip, 'maintEquip' => $maintEquip, 'lowStock' => $lowStock, 'critical' => $critical, 'expiring' => $expiring,
                'total_labs' => $totalLabs, 'active_equipment' => $activeEquip, 'maintenance_equipment' => $maintEquip, 'low_stock_chemicals' => $lowStock, 'critical_chemicals' => $critical, 'expiring_chemicals' => $expiring
            ],
            'low_stock_list' => $lowList
        ]);
        break;
    case 'compliance':
        $labName = $_GET['lab'] ?? '';
        $equip = $db->find('equipment', ['lab' => $labName]);
        $chems = $db->find('chemicals', ['lab' => $labName]);
        
        $totalEq = count($equip);
        $opEq = count(array_filter($equip, fn($e) => ($e['status'] ?? '') === 'operational'));
        $eqScore = $totalEq > 0 ? round($opEq / $totalEq * 100) : 100;
        
        $totalCh = count($chems);
        $okCh = count(array_filter($chems, fn($c) => (float)($c['quantity'] ?? 0) > (float)($c['min_stock'] ?? 0)));
        $chScore = $totalCh > 0 ? round($okCh / $totalCh * 100) : 100;
        
        $overall = round(($eqScore + $chScore) / 2);
        
        $sections = [
            [
                'name' => 'Equipment Status',
                'score' => $eqScore,
                'items' => array_map(fn($e) => ['label' => $e['name'], 'status' => $e['status'], 'notes' => 'Last maintained: ' . ($e['last_maintenance'] ?? 'N/A')], $equip)
            ],
            [
                'name' => 'Stock Levels',
                'score' => $chScore,
                'items' => array_map(fn($c) => ['label' => $c['name'], 'status' => (float)($c['quantity'] ?? 0) > (float)($c['min_stock'] ?? 0) ? 'ok' : 'low', 'notes' => "Stock: {$c['quantity']} {$c['unit']}"], $chems)
            ]
        ];
        
        echo json_encode([
            'success' => true,
            'report' => [
                'lab' => $labName,
                'date' => date('Y-m-d'),
                'overall_score' => $overall,
                'sections' => $sections
            ]
        ]);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
