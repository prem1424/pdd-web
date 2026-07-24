<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$data = json_decode(file_get_contents('php://input'), true);
$user_code = $data['user_code'] ?? '';
$full_name = $data['full_name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

if (!$user_code || !$full_name || !$email || !$password || !$role) {
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
    exit;
}

$existing = $db->findOne('users', ['$or' => [['user_code' => $user_code], ['email' => $email]]]);
if ($existing) {
    echo json_encode(['success' => false, 'message' => 'User code or email already exists']);
    exit;
}

$nameParts = explode(' ', $full_name);
$avatar = implode('', array_map(fn($p) => strtoupper($p[0] ?? ''), $nameParts));
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$db->insert('users', [
    'user_code' => $user_code,
    'full_name' => $full_name,
    'email' => $email,
    'password' => $hashedPassword,
    'role' => $role,
    'lab' => $data['lab'] ?? null,
    'department' => $data['department'] ?? null,
    'roll_no' => $data['roll_no'] ?? null,
    'year' => $data['year'] ?? null,
    'avatar' => $avatar,
    'created_at' => date('Y-m-d H:i:s')
]);

echo json_encode(['success' => true, 'message' => 'Registration successful']);
