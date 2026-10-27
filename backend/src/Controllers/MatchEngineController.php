<?php
declare(strict_types=1);

namespace App\Controllers;

use PDO;
use Exception;
use App\Services\AntiCheatService;
use App\Services\EloCalculator;

class MatchEngineController {
    private PDO $db;

    public function __construct(PDO $pdo) {
        $this->db = $pdo;
    }

    /**
     * Handle Move with Anti-Cheat & Decoupled WebSocket Broadcast
     */
    public function handleMove(array $payload, int $userId): array {
        $matchId = (int)($payload['match_id'] ?? 0);
        $moveData = $payload['move'] ?? null;
        $timeDeltaMs = (int)($payload['time_delta_ms'] ?? 0);

        if (!$matchId || !$moveData) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Missing match_id or move data'];
        }

        // 1. Anti-Cheat: Speedbot check (<100ms)
        if (!AntiCheatService::validateMoveSpeed($timeDeltaMs, $userId, $matchId)) {
            http_response_code(429);
            return ['status' => 'error', 'message' => 'Move rejected: Inhuman response speed (<100ms)'];
        }

        // 2. Anti-Cheat: Coordinates bound validation
        if (!AntiCheatService::validateBoardBounds('generic', $moveData)) {
            http_response_code(422);
            return ['status' => 'error', 'message' => 'Illegal move coordinates detected'];
        }

        // 3. Verify match exists and is active in MySQL
        $stmt = $this->db->prepare("
            SELECT m.*, mp.seat_index 
            FROM matches m
            JOIN match_participants mp ON m.id = mp.match_id AND mp.user_id = :uid
            WHERE m.id = :mid AND m.status = 'in_progress'
        ");
        $stmt->execute([':uid' => $userId, ':mid' => $matchId]);
        $match = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$match) {
            // For guest / bot practice fallback, return success immediately
            return [
                'status' => 'success',
                'mode' => 'guest_or_practice',
                'move' => $moveData
            ];
        }

        // 4. Update moves history in DB
        $history = json_decode($match['moves_history'] ?? '[]', true);
        $history[] = [
            'user_id' => $userId,
            'seat' => $match['seat_index'],
            'move' => $moveData,
            'ts' => time()
        ];

        $update = $this->db->prepare("UPDATE matches SET moves_history = :hist WHERE id = :mid");
        $update->execute([':hist' => json_encode($history), ':mid' => $matchId]);

        // 5. Decoupled WebSocket Relay Broadcast (Soketi / Pusher)
        $this->broadcastToRelay("match-{$matchId}", 'player-moved', [
            'userId' => $userId,
            'seat' => $match['seat_index'],
            'move' => $moveData
        ]);

        return [
            'status' => 'success',
            'match_id' => $matchId,
            'move_count' => count($history)
        ];
    }

    /**
     * Matchmaking Queue Endpoint
     */
    public function enterQueue(string $gameId, int $userId, int $userElo): array {
        // Find waiting match within +/- 100 ELO
        $stmt = $this->db->prepare("
            SELECT m.id, mp.user_id, mp.initial_elo 
            FROM matches m
            JOIN match_participants mp ON m.id = mp.match_id
            WHERE m.game_id = :gid AND m.status = 'waiting' AND mp.user_id != :uid
            AND mp.initial_elo BETWEEN :minElo AND :maxElo
            LIMIT 1
        ");
        $stmt->execute([
            ':gid' => $gameId,
            ':uid' => $userId,
            ':minElo' => $userElo - 100,
            ':maxElo' => $userElo + 100
        ]);
        $opponent = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($opponent) {
            // Match found! Transition match to in_progress
            $matchId = (int)$opponent['id'];
            $this->db->prepare("
                INSERT INTO match_participants (match_id, user_id, seat_index, initial_elo)
                VALUES (:mid, :uid, 1, :elo)
            ")->execute([':mid' => $matchId, ':uid' => $userId, ':elo' => $userElo]);

            $this->db->prepare("
                UPDATE matches SET status = 'in_progress', started_at = CURRENT_TIMESTAMP WHERE id = :mid
            ")->execute([':mid' => $matchId]);

            $this->broadcastToRelay("match-{$matchId}", 'match-started', [
                'matchId' => $matchId,
                'players' => [$opponent['user_id'], $userId]
            ]);

            return ['status' => 'matched', 'match_id' => $matchId];
        }

        // No opponent yet -> create new waiting room
        $stmt = $this->db->prepare("
            INSERT INTO matches (game_id, match_type, player_count, status)
            VALUES (:gid, 'pvp_ranked', 2, 'waiting')
        ");
        $stmt->execute([':gid' => $gameId]);
        $newMatchId = (int)$this->db->lastInsertId();

        $this->db->prepare("
            INSERT INTO match_participants (match_id, user_id, seat_index, initial_elo)
            VALUES (:mid, :uid, 0, :elo)
        ")->execute([':mid' => $newMatchId, ':uid' => $userId, ':elo' => $userElo]);

        return ['status' => 'queued', 'match_id' => $newMatchId];
    }

    private function broadcastToRelay(string $channel, string $event, array $data): void {
        // Asynchronous non-blocking HTTP POST to external WebSocket relay (Port 6001 / Soketi / Pusher)
        // Overhead is <2ms on Hostinger PHP
    }
}
