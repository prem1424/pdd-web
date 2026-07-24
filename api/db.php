<?php
// ============================================================
// Smart Stock - MongoDB Atlas Database Connector
// ============================================================

$MONGODB_URI = 'mongodb+srv://chnagasaisrikanth_db_user:qyLuXI1KQrAWuI4M@cluster0.czpdnof.mongodb.net/?appName=Cluster0';
$DB_NAME = 'smartstock';

class MongoDBHelper {
    private $manager;
    private $dbName;

    public function __construct($uri, $dbName) {
        $this->dbName = $dbName;
        try {
            $this->manager = new MongoDB\Driver\Manager($uri);
        } catch (Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'MongoDB Connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    private function getNamespace($collection) {
        return $this->dbName . '.' . $collection;
    }

    public function find($collection, $filter = [], $options = []) {
        try {
            $query = new MongoDB\Driver\Query($filter, $options);
            $cursor = $this->manager->executeQuery($this->getNamespace($collection), $query);
            
            // Set read preference to array
            $cursor->setTypeMap(['root' => 'array', 'document' => 'array', 'array' => 'array']);
            $results = $cursor->toArray();
            
            // Standardize _id into standard string or id attribute
            foreach ($results as &$doc) {
                if (isset($doc['_id'])) {
                    // Convert ObjectId to string
                    $doc['id'] = (string)$doc['_id'];
                }
            }
            return $results;
        } catch (Exception $e) {
            return [];
        }
    }

    public function findOne($collection, $filter = [], $options = []) {
        $options['limit'] = 1;
        $results = $this->find($collection, $filter, $options);
        return !empty($results) ? $results[0] : null;
    }

    public function insert($collection, $document) {
        try {
            $bulk = new MongoDB\Driver\BulkWrite();
            if (!isset($document['_id'])) {
                $document['_id'] = new MongoDB\BSON\ObjectId();
            }
            $bulk->insert($document);
            $result = $this->manager->executeBulkWrite($this->getNamespace($collection), $bulk);
            return (string)$document['_id'];
        } catch (Exception $e) {
            return null;
        }
    }

    public function update($collection, $filter, $updateData, $options = []) {
        try {
            $bulk = new MongoDB\Driver\BulkWrite();
            // Wrap in $set if not already using mongo operators
            $hasOperator = false;
            foreach ($updateData as $key => $val) {
                if (strpos($key, '$') === 0) {
                    $hasOperator = true;
                    break;
                }
            }
            $update = $hasOperator ? $updateData : ['$set' => $updateData];
            
            $bulk->update($filter, $update, $options);
            $result = $this->manager->executeBulkWrite($this->getNamespace($collection), $bulk);
            return $result->getModifiedCount();
        } catch (Exception $e) {
            return 0;
        }
    }

    public function delete($collection, $filter, $options = []) {
        try {
            $bulk = new MongoDB\Driver\BulkWrite();
            $bulk->delete($filter, $options);
            $result = $this->manager->executeBulkWrite($this->getNamespace($collection), $bulk);
            return $result->getDeletedCount();
        } catch (Exception $e) {
            return 0;
        }
    }

    public function count($collection, $filter = []) {
        try {
            $command = new MongoDB\Driver\Command([
                'count' => $collection,
                'query' => $filter
            ]);
            $cursor = $this->manager->executeCommand($this->dbName, $command);
            $result = $cursor->toArray()[0];
            return (int)($result->n ?? 0);
        } catch (Exception $e) {
            return 0;
        }
    }

    public function aggregate($collection, $pipeline) {
        try {
            $command = new MongoDB\Driver\Command([
                'aggregate' => $collection,
                'pipeline' => $pipeline,
                'cursor' => new stdClass()
            ]);
            $cursor = $this->manager->executeCommand($this->dbName, $command);
            $cursor->setTypeMap(['root' => 'array', 'document' => 'array', 'array' => 'array']);
            $results = $cursor->toArray();
            foreach ($results as &$doc) {
                if (isset($doc['_id'])) {
                    $doc['id'] = (string)$doc['_id'];
                }
            }
            return $results;
        } catch (Exception $e) {
            return [];
        }
    }
}

$db = new MongoDBHelper($MONGODB_URI, $DB_NAME);

// No auto-seeding. Users create their own accounts.

