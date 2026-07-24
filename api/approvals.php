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
        $requests = $db->find('approval_requests', $filter);
        echo json_encode(['success' => true, 'requests' => $requests]);
        break;
    case 'add': case 'submit':
        $db->insert('approval_requests', [
            'type' => $data['type'] ?? '',
            'title' => $data['title'] ?? '',
            'requested_by' => $data['requested_by'] ?? '',
            'lab' => $data['lab'] ?? '',
            'quantity' => $data['quantity'] ?? null,
            'urgency' => $data['urgency'] ?? 'medium',
            'notes' => $data['notes'] ?? null,
            'date' => date('Y-m-d'),
            'status' => 'pending'
        ]);
        echo json_encode(['success' => true, 'message' => 'Request submitted']);
        break;
    case 'handle':
        $status = ($data['action'] ?? '') === 'approve' ? 'approved' : 'rejected';
        $requestId = $data['request_id'] ?? '';
        $db->update('approval_requests', ['_id' => new MongoDB\BSON\ObjectId($requestId)], [
            'status' => $status,
            'handled_by' => $data['handled_by'] ?? ''
        ]);
        echo json_encode(['success' => true, 'message' => "Request $status"]);
        break;
    case 'update_status':
        $id = $data['id'] ?? '';
        $status = $data['status'] ?? 'pending';
        $db->update('approval_requests', ['_id' => new MongoDB\BSON\ObjectId($id)], ['status' => $status]);
        echo json_encode(['success' => true, 'message' => 'Status updated']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
