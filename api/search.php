<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$q = $_GET['q'] ?? '';
$lab = $_GET['lab'] ?? '';

if (!$q) {
    echo json_encode(['success' => true, 'results' => ['equipment'=>[], 'chemicals'=>[], 'students'=>[], 'tasks'=>[]]]);
    exit;
}

$regex = new MongoDB\BSON\Regex($q, 'i');

// Equipment
$eqFilter = ['name' => $regex];
if ($lab) { $eqFilter['lab'] = $lab; }
$equipment = $db->find('equipment', $eqFilter);

// Chemicals
$chFilter = ['name' => $regex];
if ($lab) { $chFilter['lab'] = $lab; }
$chemicals = $db->find('chemicals', $chFilter);

// Students
$stFilter = [
    'role' => 'student',
    '$or' => [['full_name' => $regex], ['roll_no' => $regex], ['user_code' => $regex]]
];
if ($lab) { $stFilter['lab'] = $lab; }
$students = $db->find('users', $stFilter);
foreach ($students as &$s) {
    $s['name'] = $s['full_name'];
    $s['roll_no'] = $s['roll_no'] ?? $s['user_code'];
}

// Tasks
$tkFilter = ['title' => $regex];
if ($lab) { $tkFilter['lab'] = $lab; }
$tasks = $db->find('tasks', $tkFilter);

echo json_encode(['success' => true, 'results' => compact('equipment', 'chemicals', 'students', 'tasks')]);
