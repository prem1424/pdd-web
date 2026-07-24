<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$bodyAction = $data['action'] ?? '';

if ($bodyAction === 'update') {
    $oldEmpid = $data['old_empid'] ?? '';
    $user = $db->findOne('users', ['user_code' => $oldEmpid]);
    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }
    
    $newEmpid = $data['empid'] ?? $oldEmpid;
    $db->update('users', ['user_code' => $oldEmpid], [
        'user_code' => $newEmpid,
        'full_name' => $data['name'] ?? $user['full_name'],
        'department' => $data['dept'] ?? $user['department']
    ]);
    
    $updated = $db->findOne('users', ['user_code' => $newEmpid]);
    $nameParts = explode(' ', $updated['full_name']);
    $avatar = implode('', array_map(fn($p) => strtoupper($p[0] ?? ''), $nameParts));
    
    echo json_encode(['success' => true, 'user' => [
        'id' => $updated['id'],
        'name' => $updated['full_name'],
        'email' => $updated['email'],
        'role' => $updated['role'],
        'lab' => $updated['lab'] ?? null,
        'user_code' => $updated['user_code'],
        'department' => $updated['department'] ?? null,
        'avatar' => $avatar,
        'rollNo' => $updated['roll_no'] ?? null,
        'roll_no' => $updated['roll_no'] ?? null,
        'year' => $updated['year'] ?? null
    ]]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
