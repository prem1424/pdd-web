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
        $activities = $db->find('activities', $filter);
        echo json_encode(['success' => true, 'activities' => $activities]);
        break;
    case 'add': case 'submit':
        $chemicals = $data['chemicals'] ?? '';
        $equipment = $data['equipment'] ?? '';
        $id = $db->insert('activities', [
            'student' => $data['student'] ?? '',
            'date' => $data['date'] ?? date('Y-m-d'),
            'lab' => $data['lab'] ?? '',
            'experiment' => $data['experiment'] ?? '',
            'duration' => $data['duration'] ?? null,
            'chemicals' => is_array($chemicals) ? implode(', ', $chemicals) : $chemicals,
            'equipment' => is_array($equipment) ? implode(', ', $equipment) : $equipment,
            'notes' => $data['notes'] ?? null,
            'status' => $data['status'] ?? 'completed',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Activity submitted']);
        break;
    case 'update':
        $id = $data['id'] ?? '';
        $chemicals = $data['chemicals'] ?? '';
        $equipment = $data['equipment'] ?? '';
        $db->update('activities', ['_id' => new MongoDB\BSON\ObjectId($id)], [
            'student' => $data['student'] ?? '',
            'date' => $data['date'] ?? date('Y-m-d'),
            'lab' => $data['lab'] ?? '',
            'experiment' => $data['experiment'] ?? '',
            'notes' => $data['notes'] ?? null,
            'status' => $data['status'] ?? 'completed',
            'duration' => $data['duration'] ?? null,
            'chemicals' => is_array($chemicals) ? implode(', ', $chemicals) : $chemicals,
            'equipment' => is_array($equipment) ? implode(', ', $equipment) : $equipment
        ]);
        echo json_encode(['success' => true, 'message' => 'Activity updated']);
        break;
    case 'delete':
        $id = $_GET['id'] ?? '';
        $db->delete('activities', ['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true, 'message' => 'Activity deleted']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
