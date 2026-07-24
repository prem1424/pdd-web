<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$data = json_decode(file_get_contents('php://input'), true);
$user_code = $data['user_code'] ?? '';
$password = $data['password'] ?? '';

if (!$user_code || !$password) {
    echo json_encode(['success' => false, 'message' => 'User code and password are required']);
    exit;
}

$user = $db->findOne('users', ['user_code' => $user_code]);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    exit;
}

if (!empty($data['role']) && $user['role'] !== $data['role']) {
    echo json_encode(['success' => false, 'message' => 'Role mismatch']);
    exit;
}

$nameParts = explode(' ', $user['full_name']);
$avatar = implode('', array_map(fn($p) => strtoupper($p[0] ?? ''), $nameParts));

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'lab' => $user['lab'] ?? null,
        'user_code' => $user['user_code'],
        'department' => $user['department'] ?? null,
        'avatar' => $avatar,
        'rollNo' => $user['roll_no'] ?? null,
        'roll_no' => $user['roll_no'] ?? null,
        'year' => $user['year'] ?? null
    ]
]);
