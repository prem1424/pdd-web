<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? [];

function timeAgo($datetime) {
    if (!$datetime) return 'Just now';
    $now = new DateTime();
    $past = new DateTime($datetime);
    $diff = $now->diff($past);
    if ($diff->y > 0) return $diff->y . ' year(s) ago';
    if ($diff->m > 0) return $diff->m . ' month(s) ago';
    if ($diff->d > 0) return $diff->d . ' day(s) ago';
    if ($diff->h > 0) return $diff->h . ' hour(s) ago';
    if ($diff->i > 0) return $diff->i . ' minute(s) ago';
    return 'Just now';
}

switch ($action) {
    case 'list':
        $lab = $_GET['lab'] ?? '';
        $filter = [];
        if ($lab) {
            $filter['$or'] = [['lab' => $lab], ['lab_name' => $lab]];
        }
        $notifications = $db->find('notifications', $filter, ['sort' => ['created_at' => -1]]);
        foreach ($notifications as &$n) {
            $n['time'] = $n['time'] ?? timeAgo($n['created_at'] ?? null);
            $n['is_read'] = (int)($n['is_read'] ?? 0);
        }
        echo json_encode(['success' => true, 'notifications' => $notifications]);
        break;
    case 'mark_read':
        $db->update('notifications', ['is_read' => 0], ['is_read' => 1], ['multi' => true]);
        echo json_encode(['success' => true, 'message' => 'All marked read']);
        break;
    case 'clear':
        $db->delete('notifications', [], ['multi' => true]);
        echo json_encode(['success' => true, 'message' => 'All cleared']);
        break;
    case 'delete_one':
        $id = $data['id'] ?? '';
        $db->delete('notifications', ['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true]);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
