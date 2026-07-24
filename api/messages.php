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
        $user = $_GET['user'] ?? '';
        $filter = ['$or' => [['sender' => $user], ['recipient' => $user]]];
        $messages = $db->find('messages', $filter, ['sort' => ['date' => -1]]);
        echo json_encode(['success' => true, 'messages' => $messages]);
        break;
    case 'send':
        $db->insert('messages', [
            'sender' => $data['sender'] ?? '',
            'recipient' => $data['recipient'] ?? '',
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'] ?? '',
            'lab' => $data['lab'] ?? null,
            'is_read' => 0,
            'date' => date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true, 'message' => 'Message sent']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
