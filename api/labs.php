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
        $labName = $_GET['name'] ?? '';
        if ($labName) {
            $lab = $db->findOne('labs', ['name' => $labName]);
            if (!$lab) { echo json_encode(['success' => false, 'message' => 'Lab not found']); exit; }
            $equipment = $db->find('equipment', ['lab' => $labName]);
            $chemicals = $db->find('chemicals', ['lab' => $labName]);
            $students = $db->find('users', ['role' => 'student', 'lab' => $labName]);
            
            // Standardize output formats
            foreach ($chemicals as &$c) { $c['stock'] = $c['quantity']; }
            foreach ($students as &$s) { $s['name'] = $s['full_name']; $s['attendance'] = 90; $s['status'] = 'active'; }
            
            echo json_encode(['success' => true, 'lab' => $lab, 'equipment' => $equipment, 'chemicals' => $chemicals, 'students' => $students]);
        } else {
            $labs = $db->find('labs', []);
            echo json_encode(['success' => true, 'labs' => $labs]);
        }
        break;
    case 'add':
        $db->insert('labs', [
            'name' => $data['name'] ?? '',
            'code' => $data['code'] ?? null,
            'head' => $data['head'] ?? null,
            'location' => $data['location'] ?? null,
            'status' => $data['status'] ?? 'active',
            'department' => $data['department'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Lab added successfully']);
        break;
    case 'edit':
        if (!empty($data['old_name'])) {
            $filter = ['name' => $data['old_name']];
            $update = [
                'name' => $data['name'] ?? $data['old_name'],
                'code' => $data['code'] ?? null,
                'head' => $data['head'] ?? null,
                'location' => $data['location'] ?? null,
                'status' => $data['status'] ?? 'active'
            ];
        } else {
            $filter = ['_id' => new MongoDB\BSON\ObjectId($data['id'])];
            $update = array_filter([
                'name' => $data['name'] ?? null,
                'code' => $data['code'] ?? null,
                'head' => $data['head'] ?? null,
                'location' => $data['location'] ?? null,
                'status' => $data['status'] ?? null
            ]);
        }
        $db->update('labs', $filter, $update);
        echo json_encode(['success' => true, 'message' => 'Lab updated successfully']);
        break;
    case 'delete':
        if (!empty($data['id'])) {
            $db->delete('labs', ['_id' => new MongoDB\BSON\ObjectId($data['id'])]);
        } elseif (!empty($data['name'])) {
            $db->delete('labs', ['name' => $data['name']]);
        }
        echo json_encode(['success' => true, 'message' => 'Lab deleted successfully']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
