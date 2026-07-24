<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {
    case 'list':
        $lab = $_GET['lab'] ?? '';
        $filter = $lab ? ['lab' => $lab] : [];
        $tasks = $db->find('tasks', $filter);
        echo json_encode(['success' => true, 'tasks' => $tasks]);
        break;
    case 'add': case 'create':
        $db->insert('tasks', [
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? '',
            'assigned_by' => $data['assigned_by'] ?? '',
            'lab' => $data['lab'] ?? '',
            'due_date' => $data['due_date'] ?? date('Y-m-d'),
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'pending'
        ]);
        echo json_encode(['success' => true, 'message' => 'Task created']);
        break;
    case 'update_status':
        $taskId = $data['task_id'] ?? '';
        $status = $data['status'] ?? 'pending';
        $db->update('tasks', ['_id' => new MongoDB\BSON\ObjectId($taskId)], ['status' => $status]);
        echo json_encode(['success' => true, 'message' => 'Task updated']);
        break;
    case 'delete':
        $taskId = $data['task_id'] ?? '';
        $db->delete('tasks', ['_id' => new MongoDB\BSON\ObjectId($taskId)]);
        echo json_encode(['success' => true, 'message' => 'Task deleted']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
