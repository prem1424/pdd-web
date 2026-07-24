<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$action = $_GET['action'] ?? '';
$lab = $_GET['lab'] ?? '';

switch ($action) {
    case 'monthly_usage':
        // Simulating trend grouping
        $history = $db->find('stock_history', []);
        $months = [];
        foreach ($history as $h) {
            $month = date('b', strtotime($h['date'] ?? 'now'));
            $months[$month] = ($months[$month] ?? 0) + 1;
        }
        echo json_encode(['success' => true, 'labels' => array_keys($months), 'values' => array_values($months)]);
        break;
    case 'lab_utilization':
        $equip = $db->find('equipment');
        $labs = [];
        foreach ($equip as $e) {
            $l = $e['lab'];
            $labs[$l] = ($labs[$l] ?? 0) + 1;
        }
        echo json_encode(['success' => true, 'labels' => array_keys($labs), 'values' => array_values($labs)]);
        break;
    case 'attendance_trend':
        $att = $db->find('attendance');
        $dates = [];
        foreach ($att as $a) {
            $d = $a['date'];
            $dates[$d] = ($dates[$d] ?? 0) + 1;
        }
        ksort($dates);
        echo json_encode(['success' => true, 'labels' => array_keys($dates), 'values' => array_values($dates)]);
        break;
    case 'category_breakdown':
        $chems = $db->find('chemicals');
        $cats = [];
        foreach ($chems as $c) {
            $cat = $c['category'] ?? 'Chemical';
            $cats[$cat] = ($cats[$cat] ?? 0) + 1;
        }
        echo json_encode(['success' => true, 'labels' => array_keys($cats), 'values' => array_values($cats)]);
        break;
    default:
        // General analytics
        $history = $db->find('stock_history', []);
        $trends = [];
        foreach ($history as $h) {
            $ym = date('Y-m', strtotime($h['date'] ?? 'now'));
            $trends[$ym] = ($trends[$ym] ?? 0) + 1;
        }
        $stockTrends = [];
        foreach ($trends as $d => $count) {
            $stockTrends[] = ['date' => $d, 'total_items' => $count, 'low_stock' => 0, 'value' => 0];
        }
        
        $chems = $db->find('chemicals');
        $cats = [];
        foreach ($chems as $c) {
            $cat = $c['category'] ?? 'Chemical';
            $cats[$cat] = ($cats[$cat] ?? 0) + 1;
        }
        $catDist = [];
        foreach ($cats as $cat => $count) {
            $catDist[] = ['category' => $cat, 'count' => $count, 'value' => 0];
        }
        
        // Usage
        $usage = [];
        foreach ($history as $h) {
            $item = $h['item'];
            $usage[$item] = ($usage[$item] ?? 0) + (float)($h['quantity'] ?? 0);
        }
        arsort($usage);
        $usageData = [];
        $i = 0;
        foreach ($usage as $item => $used) {
            if ($i++ >= 10) break;
            $usageData[] = ['item' => $item, 'used' => $used, 'remaining' => 0];
        }
        
        // Lab comparisons
        $labComp = [];
        $labs = $db->find('labs');
        foreach ($labs as $l) {
            $ln = $l['name'];
            $ec = $db->count('equipment', ['lab' => $ln]);
            $cc = $db->count('chemicals', ['lab' => $ln]);
            $labComp[] = ['lab' => $ln, 'equipment' => $ec, 'chemicals' => $cc, 'compliance' => 100];
        }
        
        $total = $db->count('notifications');
        $critical = $db->count('notifications', ['severity' => 'critical']);
        $warning = $db->count('notifications', ['severity' => 'warning']);
        $info = $db->count('notifications', ['severity' => 'info']);
        
        $consumers = [];
        foreach ($history as $h) {
            $user = $h['by_user'] ?? '';
            $labName = $h['lab'] ?? '';
            if ($user) {
                $key = $user . '|' . $labName;
                $consumers[$key] = ($consumers[$key] ?? 0) + 1;
            }
        }
        arsort($consumers);
        $topConsumers = [];
        $i = 0;
        foreach ($consumers as $key => $cnt) {
            if ($i++ >= 10) break;
            list($user, $labName) = explode('|', $key);
            $topConsumers[] = ['name' => $user, 'items_used' => $cnt, 'lab' => $labName];
        }
        
        echo json_encode([
            'success' => true,
            'stock_trends' => $stockTrends,
            'category_distribution' => $catDist,
            'usage_data' => $usageData,
            'lab_comparison' => $labComp,
            'alerts_summary' => compact('total', 'critical', 'warning', 'info'),
            'top_consumers' => $topConsumers
        ]);
}
