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
        $filter = ['role' => 'student'];
        if ($lab) { $filter['lab'] = $lab; }
        $students = $db->find('users', $filter);
        
        foreach ($students as &$s) {
            $s['name'] = $s['full_name'];
            $s['roll_no'] = $s['roll_no'] ?? $s['user_code'];
            $s['status'] = 'active';
            $s['attendance_rate'] = 'N/A';
            $s['last_active'] = 'N/A';
        }
        echo json_encode(['success' => true, 'students' => $students]);
        break;
    case 'add':
        $hashedPw = password_hash('password123', PASSWORD_DEFAULT);
        $nameParts = explode(' ', $data['name'] ?? '');
        $avatar = implode('', array_map(fn($p) => strtoupper($p[0] ?? ''), $nameParts));
        
        $db->insert('users', [
            'full_name' => $data['name'] ?? '',
            'user_code' => $data['roll_no'] ?? '',
            'email' => $data['email'] ?? '',
            'password' => $hashedPw,
            'role' => 'student',
            'roll_no' => $data['roll_no'] ?? '',
            'year' => $data['year'] ?? null,
            'department' => $data['department'] ?? null,
            'lab' => $data['lab'] ?? '',
            'avatar' => $avatar,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true, 'message' => 'Student added']);
        break;
    case 'remove':
        $id = $data['student_id'] ?? '';
        $db->delete('users', ['_id' => new MongoDB\BSON\ObjectId($id), 'role' => 'student']);
        echo json_encode(['success' => true, 'message' => 'Student removed']);
        break;
    case 'delete':
        $roll = $_GET['roll'] ?? '';
        $db->delete('users', ['roll_no' => $roll, 'role' => 'student']);
        echo json_encode(['success' => true]);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
