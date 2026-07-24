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
    case 'get_equipment':
        $lab = $_GET['lab'] ?? '';
        $filter = $lab ? ['lab' => $lab] : [];
        $equipment = $db->find('equipment', $filter);
        echo json_encode(['success' => true, 'equipment' => $equipment]);
        break;
    case 'get_chemicals':
        $lab = $_GET['lab'] ?? '';
        $filter = $lab ? ['lab' => $lab] : [];
        $chemicals = $db->find('chemicals', $filter);
        foreach ($chemicals as &$c) {
            $c['quantity'] = (float)($c['quantity'] ?? 0);
            $c['min_stock'] = (float)($c['min_stock'] ?? 0);
            if ($c['quantity'] <= 0) $c['status'] = 'critical';
            elseif ($c['quantity'] <= $c['min_stock']) $c['status'] = 'low-stock';
            else $c['status'] = 'active';
        }
        echo json_encode(['success' => true, 'chemicals' => $chemicals]);
        break;
    case 'add_equipment':
        $db->insert('equipment', [
            'name' => $data['name'] ?? '',
            'category' => $data['category'] ?? null,
            'lab' => $data['lab'] ?? '',
            'status' => $data['status'] ?? 'operational',
            'manufacturer' => $data['manufacturer'] ?? null,
            'model' => $data['model'] ?? null,
            'serial_no' => $data['serial_no'] ?? null,
            'quantity' => (int)($data['quantity'] ?? 1),
            'purchase_date' => $data['purchase_date'] ?? null,
            'last_maintenance' => $data['last_maintenance'] ?? null,
            'next_maintenance' => $data['next_maintenance'] ?? null,
            'location' => $data['location'] ?? null,
            'notes' => $data['notes'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Equipment added']);
        break;
    case 'edit_equipment':
        $id = $data['id'] ?? 0;
        $db->update('equipment', ['_id' => new MongoDB\BSON\ObjectId($id)], [
            'name' => $data['name'] ?? '',
            'category' => $data['category'] ?? null,
            'lab' => $data['lab'] ?? '',
            'status' => $data['status'] ?? 'operational',
            'manufacturer' => $data['manufacturer'] ?? null,
            'model' => $data['model'] ?? null,
            'serial_no' => $data['serial_no'] ?? null,
            'quantity' => (int)($data['quantity'] ?? 1),
            'purchase_date' => $data['purchase_date'] ?? null,
            'last_maintenance' => $data['last_maintenance'] ?? null,
            'next_maintenance' => $data['next_maintenance'] ?? null,
            'location' => $data['location'] ?? null,
            'notes' => $data['notes'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Equipment updated']);
        break;
    case 'delete_equipment':
        $id = $data['id'] ?? 0;
        $db->delete('equipment', ['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true, 'message' => 'Equipment deleted']);
        break;
    case 'add_chemical':
        $db->insert('chemicals', [
            'name' => $data['name'] ?? '',
            'category' => $data['category'] ?? 'Chemical',
            'lab' => $data['lab'] ?? '',
            'quantity' => (float)($data['quantity'] ?? 0),
            'unit' => $data['unit'] ?? 'units',
            'min_stock' => (float)($data['min_stock'] ?? 0),
            'max_stock' => (float)($data['max_stock'] ?? 100),
            'expiry' => $data['expiry'] ?? null,
            'supplier' => $data['supplier'] ?? null,
            'location' => $data['location'] ?? null,
            'cas_number' => $data['cas_number'] ?? null,
            'hazard_level' => $data['hazard_level'] ?? 'low',
            'notes' => $data['notes'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Chemical added']);
        break;
    case 'edit_chemical':
        $id = $data['id'] ?? 0;
        $db->update('chemicals', ['_id' => new MongoDB\BSON\ObjectId($id)], [
            'name' => $data['name'] ?? '',
            'category' => $data['category'] ?? 'Chemical',
            'lab' => $data['lab'] ?? '',
            'quantity' => (float)($data['quantity'] ?? 0),
            'unit' => $data['unit'] ?? 'units',
            'min_stock' => (float)($data['min_stock'] ?? 0),
            'max_stock' => (float)($data['max_stock'] ?? 100),
            'expiry' => $data['expiry'] ?? null,
            'supplier' => $data['supplier'] ?? null,
            'location' => $data['location'] ?? null,
            'cas_number' => $data['cas_number'] ?? null,
            'hazard_level' => $data['hazard_level'] ?? 'low',
            'notes' => $data['notes'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Chemical updated']);
        break;
    case 'delete_chemical':
        $id = $data['id'] ?? 0;
        $db->delete('chemicals', ['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true, 'message' => 'Chemical deleted']);
        break;
    case 'add_item':
        $cat = $data['category'] ?? '';
        if ($cat === 'Equipment') {
            $db->insert('equipment', [
                'name' => $data['name'] ?? '',
                'category' => $cat,
                'lab' => $data['lab'] ?? '',
                'manufacturer' => $data['brand'] ?? null,
                'quantity' => (int)($data['quantity'] ?? 1),
                'location' => $data['location'] ?? null,
                'status' => 'operational'
            ]);
        } else {
            $db->insert('chemicals', [
                'name' => $data['name'] ?? '',
                'category' => $cat,
                'lab' => $data['lab'] ?? '',
                'quantity' => (float)($data['quantity'] ?? 0),
                'unit' => $data['unit'] ?? 'units',
                'min_stock' => (float)($data['min_stock'] ?? 0),
                'max_stock' => (float)($data['max_stock'] ?? 100),
                'location' => $data['location'] ?? null,
                'expiry' => $data['expiry'] ?? null,
                'hazard_level' => $data['hazard'] ?? 'low'
            ]);
        }
        echo json_encode(['success' => true, 'message' => 'Item added']);
        break;
    case 'edit_item':
        $id = $data['id'] ?? 0;
        $cat = $data['category'] ?? '';
        if ($cat === 'Equipment') {
            $db->update('equipment', ['_id' => new MongoDB\BSON\ObjectId($id)], [
                'name' => $data['name'] ?? '',
                'lab' => $data['lab'] ?? '',
                'location' => $data['location'] ?? null,
                'manufacturer' => $data['brand'] ?? null,
                'model' => $data['model'] ?? null,
                'quantity' => (int)($data['quantity'] ?? 1),
                'status' => $data['status'] ?? 'operational',
                'next_maintenance' => $data['next_maintenance'] ?? null
            ]);
        } else {
            $db->update('chemicals', ['_id' => new MongoDB\BSON\ObjectId($id)], [
                'name' => $data['name'] ?? '',
                'lab' => $data['lab'] ?? '',
                'location' => $data['location'] ?? null,
                'supplier' => $data['supplier'] ?? null,
                'unit' => $data['unit'] ?? 'units',
                'quantity' => (float)($data['stock'] ?? $data['quantity'] ?? 0),
                'expiry' => $data['expiry'] ?? null,
                'hazard_level' => $data['hazard'] ?? 'low',
                'cas_number' => $data['cas'] ?? null,
                'grade' => $data['grade'] ?? null,
                'min_stock' => (float)($data['min_stock'] ?? 0),
                'max_stock' => (float)($data['max_stock'] ?? 100)
            ]);
        }
        echo json_encode(['success' => true, 'message' => 'Item updated']);
        break;
    case 'delete_item':
        $id = $data['id'] ?? 0;
        $cat = $data['category'] ?? '';
        $collection = ($cat === 'Equipment') ? 'equipment' : 'chemicals';
        $db->delete($collection, ['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true, 'message' => 'Item deleted']);
        break;
    case 'use_stock':
        $itemId = $data['item_id'] ?? '';
        $qty = (float)($data['quantity'] ?? 0);
        $chemical = $db->findOne('chemicals', ['_id' => new MongoDB\BSON\ObjectId($itemId)]);
        if ($chemical) {
            $newQty = max($chemical['quantity'] - $qty, 0);
            $db->update('chemicals', ['_id' => new MongoDB\BSON\ObjectId($itemId)], ['quantity' => $newQty]);
            $db->insert('stock_history', [
                'item' => $chemical['name'],
                'action' => 'used',
                'quantity' => $qty,
                'unit' => $chemical['unit'],
                'by_user' => $data['user'] ?? '',
                'lab' => $data['lab'] ?? '',
                'date' => date('Y-m-d'),
                'reason' => $data['reason'] ?? ''
            ]);
        }
        echo json_encode(['success' => true, 'message' => 'Stock updated']);
        break;
    case 'update_stock':
        $type = $data['type'] ?? '';
        $itemId = $data['item_id'] ?? '';
        $qty = (float)($data['quantity'] ?? 0);
        $collection = ($type === 'equipment') ? 'equipment' : 'chemicals';
        
        $item = $db->findOne($collection, ['_id' => new MongoDB\BSON\ObjectId($itemId)]);
        if ($item) {
            $newQty = max(($item['quantity'] ?? 0) - $qty, 0);
            $db->update($collection, ['_id' => new MongoDB\BSON\ObjectId($itemId)], ['quantity' => $newQty]);
            $db->insert('stock_history', [
                'item' => $item['name'],
                'action' => 'used',
                'quantity' => $qty,
                'by_user' => $data['by_user'] ?? '',
                'lab' => $data['lab'] ?? '',
                'date' => date('Y-m-d'),
                'reason' => $data['reason'] ?? ''
            ]);
        }
        echo json_encode(['success' => true]);
        break;
    case 'log_usage':
        $db->insert('stock_history', [
            'item' => $data['item'] ?? '',
            'action' => 'used',
            'action_type' => $data['type'] ?? null,
            'quantity' => (float)($data['quantity'] ?? 0),
            'unit' => $data['unit'] ?? 'units',
            'by_user' => $data['by_user'] ?? '',
            'lab' => $data['lab'] ?? '',
            'date' => $data['date'] ?? date('Y-m-d'),
            'reason' => $data['reason'] ?? ''
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'get_history':
        $filter = [];
        if (!empty($_GET['date'])) { $filter['date'] = $_GET['date']; }
        if (!empty($_GET['action_type'])) { $filter['action'] = $_GET['action_type']; }
        if (!empty($_GET['lab'])) { $filter['lab'] = $_GET['lab']; }
        $history = $db->find('stock_history', $filter);
        echo json_encode(['success' => true, 'history' => $history]);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
