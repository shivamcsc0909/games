<?php
declare(strict_types=1);

namespace App\Services;

class AntiCheatService {
    private const MIN_MOVE_TIME_MS = 100;

    /**
     * Check if client move latency is inhumanly fast (auto-clickers / speed bots)
     */
    public static function validateMoveSpeed(int $timeDeltaMs, int $userId, int $matchId): bool {
        if ($timeDeltaMs > 0 && $timeDeltaMs < self::MIN_MOVE_TIME_MS) {
            error_log(sprintf(
                "[ANTI-CHEAT SPEEDBOT FLAG] User %d in Match %d sent move in %d ms (Threshold: %d ms)",
                $userId,
                $matchId,
                $timeDeltaMs,
                self::MIN_MOVE_TIME_MS
            ));
            return false;
        }
        return true;
    }

    /**
     * Check for board coordinate teleportation / out-of-bounds exploits
     */
    public static function validateBoardBounds(string $gameId, array $move): bool {
        if (isset($move['to']['row']) && isset($move['to']['col'])) {
            $r = (int)$move['to']['row'];
            $c = (int)$move['to']['col'];
            if ($r < 0 || $r >= 19 || $c < 0 || $c >= 19) {
                return false;
            }
        }
        return true;
    }
}
