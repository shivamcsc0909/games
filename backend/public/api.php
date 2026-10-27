<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Services/EloCalculator.php';
require_once __DIR__ . '/../src/Services/AntiCheatService.php';
require_once __DIR__ . '/../src/Controllers/MatchEngineController.php';

use App\Database;
use App\Controllers\MatchEngineController;

try {
    $db = Database::getConnection();
    $controller = new MatchEngineController($db);

    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];

    // Mock authenticated user (or extract from JWT HttpOnly cookie)
    $userId = 1;

    if ($method === 'POST' && str_contains($uri, '/api/match/move')) {
        $response = $controller->handleMove($input, $userId);
        echo json_encode($response);
    } elseif ($method === 'POST' && str_contains($uri, '/api/match/queue')) {
        $gameId = (string)($input['game_id'] ?? 'standard-chess');
        $userElo = (int)($input['elo'] ?? 1200);
        $response = $controller->enterQueue($gameId, $userId, $userElo);
        echo json_encode($response);
    } elseif ($method === 'GET' && str_contains($uri, '/api/health')) {
        echo json_encode([
            'status' => 'online',
            'version' => '1.0.0',
            'php' => PHP_VERSION,
            'time' => time(),
            'anti_cheat' => 'active'
        ]);
    } else {
        echo json_encode([
            'status' => 'ok',
            'message' => 'CyberArena 45 Engine API Gateway',
            'endpoints' => [
                'POST /api/match/move' => 'Validate move & broadcast',
                'POST /api/match/queue' => 'Matchmaking queue',
                'GET /api/health' => 'System health'
            ]
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
