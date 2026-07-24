<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'send_otp') {
    $email = $data['email'] ?? '';
    if (!$email) { echo json_encode(['success' => false, 'message' => 'Email required']); exit; }
    $user = $db->findOne('users', ['email' => $email]);
    if (!$user) { echo json_encode(['success' => false, 'message' => 'Email not found']); exit; }
    
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $db->insert('password_resets', [
        'email' => $email,
        'otp' => $otp,
        'expires_at' => $expires,
        'used' => 0
    ]);
    echo json_encode(['success' => true, 'message' => "OTP sent to email. (Dev OTP: $otp)"]);
} elseif ($action === 'reset_password') {
    $email = $data['email'] ?? '';
    $otp = $data['otp'] ?? '';
    $new_password = $data['new_password'] ?? '';
    if (!$email || !$otp || !$new_password) { echo json_encode(['success' => false, 'message' => 'All fields required']); exit; }
    
    $reset = $db->findOne('password_resets', [
        'email' => $email,
        'otp' => $otp,
        'used' => 0,
        'expires_at' => ['$gt' => date('Y-m-d H:i:s')]
    ]);
    
    if (!$reset) { echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP']); exit; }
    $hashed = password_hash($new_password, PASSWORD_DEFAULT);
    
    $db->update('users', ['email' => $email], ['password' => $hashed]);
    $db->update('password_resets', ['_id' => new MongoDB\BSON\ObjectId($reset['id'])], ['used' => 1]);
    
    echo json_encode(['success' => true, 'message' => 'Password reset successful']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
