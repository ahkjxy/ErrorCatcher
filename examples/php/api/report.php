<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['errors'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid data']));
}

// 数据库配置
$host = 'localhost';
$dbname = 'error_catcher';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("
        INSERT INTO errors (
            type, app_name, environment, status, status_text, url, method,
            message, stack, page_url, user_agent, user_id, timestamp, created_at
        ) VALUES (
            :type, :app_name, :environment, :status, :status_text, :url, :method,
            :message, :stack, :page_url, :user_agent, :user_id, :timestamp, NOW()
        )
    ");
    
    $count = 0;
    foreach ($data['errors'] as $error) {
        $stmt->execute([
            ':type' => $error['type'] ?? '',
            ':app_name' => $error['appName'] ?? '',
            ':environment' => $error['environment'] ?? '',
            ':status' => $error['status'] ?? 0,
            ':status_text' => $error['statusText'] ?? '',
            ':url' => $error['url'] ?? '',
            ':method' => $error['method'] ?? '',
            ':message' => $error['message'] ?? '',
            ':stack' => $error['stack'] ?? '',
            ':page_url' => $error['pageUrl'] ?? '',
            ':user_agent' => $error['userAgent'] ?? '',
            ':user_id' => $error['userId'] ?? '',
            ':timestamp' => $error['timestamp'] ?? date('Y-m-d H:i:s')
        ]);
        $count++;
    }
    
    echo json_encode([
        'success' => true,
        'count' => $count,
        'receivedAt' => date('c')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    error_log('Error saving to database: ' . $e->getMessage());
}
?>
