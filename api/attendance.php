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
        $attendance = $db->find('attendance', $filter);
        echo json_encode(['success' => true, 'attendance' => $attendance]);
        break;
    case 'mark':
        $date = $data['date'] ?? date('Y-m-d');
        $db->insert('attendance', [
            'student_name' => $data['student_name'] ?? '',
            'roll_no' => $data['roll_no'] ?? '',
            'lab' => $data['lab'] ?? '',
            'date' => $date,
            'status' => $data['status'] ?? 'present',
            'time_in' => $data['time_in'] ?? date('H:i:s')
        ]);
        echo json_encode(['success' => true, 'message' => 'Attendance marked']);
        break;
    case 'student_history':
        $rollNo = $_GET['roll_no'] ?? '';
        $records = $db->find('attendance', ['roll_no' => $rollNo]);
        $total = count($records);
        $present = count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'present'));
        $absent = count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'absent'));
        $late = count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'late'));
        $rate = $total > 0 ? round(($present + $late) / $total * 100, 1) . '%' : 'N/A';
        echo json_encode(['success' => true, 'attendance' => $records, 'stats' => compact('total', 'present', 'absent', 'late') + ['total_days' => $total, 'attendance_rate' => $rate]]);
        break;
    case 'qr_checkin':
        $db->insert('attendance', [
            'student_name' => $data['student_name'] ?? '',
            'roll_no' => $data['roll_no'] ?? '',
            'lab' => $data['lab'] ?? '',
            'date' => date('Y-m-d'),
            'status' => 'present',
            'time_in' => date('H:i:s')
        ]);
        echo json_encode(['success' => true, 'message' => 'QR check-in successful']);
        break;
    case 'generate_qr':
        $qrData = json_encode(['lab' => $data['lab'] ?? '', 'date' => $data['date'] ?? date('Y-m-d'), 'code' => bin2hex(random_bytes(8))]);
        echo json_encode(['success' => true, 'qr_data' => $qrData, 'message' => 'QR generated']);
        break;
    case 'submit_list':
        $date = $data['date'] ?? date('Y-m-d');
        $records = $data['records'] ?? [];
        foreach ($records as $r) {
            $existing = $db->findOne('attendance', ['roll_no' => $r['roll_no'] ?? '', 'date' => $date]);
            if ($existing) {
                $db->update('attendance', ['_id' => new MongoDB\BSON\ObjectId($existing['id'])], [
                    'status' => $r['status'] ?? 'present',
                    'time_in' => $r['time_in'] ?? null,
                    'time_out' => $r['time_out'] ?? null
                ]);
            } else {
                $db->insert('attendance', [
                    'student_name' => $r['name'] ?? '',
                    'roll_no' => $r['roll_no'] ?? '',
                    'date' => $date,
                    'status' => $r['status'] ?? 'present',
                    'time_in' => $r['time_in'] ?? null,
                    'time_out' => $r['time_out'] ?? null
                ]);
            }
        }
        echo json_encode(['success' => true, 'message' => 'Attendance saved']);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
