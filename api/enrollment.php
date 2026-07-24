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
    case 'list_pending':
        $labName = $_GET['lab_name'] ?? '';
        $requests = $db->find('enrollment_requests', ['lab_name' => $labName, 'status' => 'pending']);
        foreach ($requests as &$r) { $r['request_date'] = $r['created_at'] ?? date('Y-m-d H:i:s'); }
        echo json_encode(['success' => true, 'requests' => $requests]);
        break;
    case 'status':
        $studentRoll = $_GET['student_roll'] ?? '';
        $enrollments = $db->find('enrollment_requests', ['student_roll' => $studentRoll]);
        echo json_encode(['success' => true, 'enrollments' => $enrollments]);
        break;
    case 'request':
        $db->insert('enrollment_requests', [
            'student_roll' => $data['student_roll'] ?? '',
            'student_name' => $data['student_name'] ?? '',
            'lab_name' => $data['lab_name'] ?? '',
            'request_date' => date('Y-m-d'),
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'approve':
        $id = $data['id'] ?? '';
        $db->update('enrollment_requests', ['_id' => new MongoDB\BSON\ObjectId($id)], ['status' => 'approved']);
        $req = $db->findOne('enrollment_requests', ['_id' => new MongoDB\BSON\ObjectId($id)]);
        if ($req) {
            $db->update('users', ['roll_no' => $req['student_roll']], ['lab' => $req['lab_name']]);
        }
        echo json_encode(['success' => true]);
        break;
    case 'reject':
        $id = $data['id'] ?? '';
        $db->update('enrollment_requests', ['_id' => new MongoDB\BSON\ObjectId($id)], ['status' => 'rejected']);
        echo json_encode(['success' => true]);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
