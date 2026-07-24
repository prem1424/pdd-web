<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$role = $_GET['role'] ?? '';
$userCode = $_GET['user_code'] ?? '';
$lab = $_GET['lab'] ?? '';

$u = $db->findOne('users', ['user_code' => $userCode]);
$nameParts = $u ? explode(' ', $u['full_name']) : [];
$avatar = implode('', array_map(fn($p) => strtoupper($p[0] ?? ''), $nameParts));
$userObj = $u ? [
    'id' => $u['id'],
    'name' => $u['full_name'],
    'email' => $u['email'],
    'role' => $u['role'],
    'lab' => $u['lab'] ?? null,
    'user_code' => $u['user_code'],
    'department' => $u['department'] ?? null,
    'avatar' => $avatar,
    'rollNo' => $u['roll_no'] ?? null,
    'roll_no' => $u['roll_no'] ?? null,
    'year' => $u['year'] ?? null
] : null;

if ($role === 'auditor') {
    $totalLabs = $db->count('labs');
    $totalEquip = $db->count('equipment');
    $totalChem = $db->count('chemicals');
    
    // Low stock items: where quantity <= min_stock
    // Since MongoDB can compare fields or values, we fetch and check
    $chemicals = $db->find('chemicals');
    $lowStock = 0;
    foreach ($chemicals as $c) {
        if ((float)($c['quantity'] ?? 0) <= (float)($c['min_stock'] ?? 0)) {
            $lowStock++;
        }
    }
    
    $expiring = $db->count('chemicals', [
        'expiry' => [
            '$ne' => null,
            '$lte' => date('Y-m-d', strtotime('+30 days'))
        ]
    ]);
    
    $maintDue = $db->count('equipment', [
        'next_maintenance' => [
            '$ne' => null,
            '$lte' => date('Y-m-d')
        ]
    ]);
    
    $acts = $db->find('activities', [], ['limit' => 10, 'sort' => ['date' => -1]]);
    $alerts = $db->find('notifications', [], ['limit' => 10, 'sort' => ['created_at' => -1]]);
    
    $labSummaries = [];
    $labs = $db->find('labs');
    foreach ($labs as $l) {
        $ln = $l['name'];
        $ec = $db->count('equipment', ['lab' => $ln]);
        $cc = $db->count('chemicals', ['lab' => $ln]);
        $sc = $db->count('users', ['role' => 'student', 'lab' => $ln]);
        $labSummaries[] = [
            'lab_name' => $ln,
            'equipment_count' => $ec,
            'chemical_count' => $cc,
            'student_count' => $sc,
            'compliance_score' => 95
        ];
    }
    
    echo json_encode([
        'success' => true,
        'total_labs' => $totalLabs,
        'total_equipment' => $totalEquip,
        'total_chemicals' => $totalChem,
        'low_stock_items' => $lowStock,
        'expiring_soon' => $expiring,
        'maintenance_due' => $maintDue,
        'total_value' => '0',
        'recent_activities' => $acts,
        'lab_summaries' => $labSummaries,
        'alerts' => $alerts,
        'user' => $userObj
    ]);
} elseif ($role === 'labhead') {
    $totalStudents = $db->count('users', ['role' => 'student', 'lab' => $lab]);
    $totalEquip = $db->count('equipment', ['lab' => $lab]);
    $totalChem = $db->count('chemicals', ['lab' => $lab]);
    $pendingAppr = $db->count('approval_requests', ['lab' => $lab, 'status' => 'pending']);
    
    $chemicals = $db->find('chemicals', ['lab' => $lab]);
    $lowStock = 0;
    $lowStockAlerts = [];
    foreach ($chemicals as $c) {
        if ((float)($c['quantity'] ?? 0) <= (float)($c['min_stock'] ?? 0)) {
            $lowStock++;
            $lowStockAlerts[] = [
                'name' => $c['name'],
                'quantity' => $c['quantity'],
                'unit' => $c['unit'],
                'min_stock' => $c['min_stock']
            ];
        }
    }
    
    $todayAtt = $db->count('attendance', ['lab' => $lab, 'date' => date('Y-m-d')]);
    $acts = $db->find('activities', ['lab' => $lab], ['limit' => 10, 'sort' => ['date' => -1]]);
    $pt = $db->find('tasks', ['lab' => $lab, 'status' => 'pending'], ['limit' => 10, 'sort' => ['due_date' => 1]]);
    
    echo json_encode([
        'success' => true,
        'total_students' => $totalStudents,
        'total_equipment' => $totalEquip,
        'total_chemicals' => $totalChem,
        'pending_approvals' => $pendingAppr,
        'low_stock_items' => $lowStock,
        'today_attendance' => $todayAtt,
        'recent_activities' => $acts,
        'pending_tasks' => $pt,
        'low_stock_alerts' => $lowStockAlerts,
        'user' => $userObj
    ]);
} elseif ($role === 'student') {
    $userName = $u ? $u['full_name'] : '';
    $totalTasks = $db->count('tasks', ['assigned_to' => $userName]);
    $compTasks = $db->count('tasks', ['assigned_to' => $userName, 'status' => 'completed']);
    $expLogged = $db->count('activities', ['student' => $userName]);
    $pendReq = $db->count('approval_requests', ['requested_by' => $userName, 'status' => 'pending']);
    
    $rollNo = $u ? ($u['roll_no'] ?? $u['user_code']) : '';
    $records = $db->find('attendance', ['roll_no' => $rollNo]);
    $totalAtt = count($records);
    $attended = count(array_filter($records, fn($r) => in_array($r['status'] ?? '', ['present', 'late'])));
    $attRate = $totalAtt > 0 ? round($attended / $totalAtt * 100, 1) . '%' : 'N/A';
    
    $ra = $db->find('activities', ['student' => $userName], ['limit' => 10, 'sort' => ['date' => -1]]);
    $ut = $db->find('tasks', ['assigned_to' => $userName, 'status' => ['$ne' => 'completed']], ['limit' => 10, 'sort' => ['due_date' => 1]]);
    
    echo json_encode([
        'success' => true,
        'total_tasks' => $totalTasks,
        'completed_tasks' => $compTasks,
        'attendance_rate' => $attRate,
        'experiments_logged' => $expLogged,
        'pending_requests' => $pendReq,
        'recent_activities' => $ra,
        'upcoming_tasks' => $ut,
        'user' => $userObj
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
}
