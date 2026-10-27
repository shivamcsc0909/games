<?php
declare(strict_types=1);

namespace App\Services;

class EloCalculator {
    public static function calculateEloChange(
        int $playerElo,
        int $opponentElo,
        float $actualScore, // 1.0 = win, 0.5 = draw, 0.0 = loss
        int $matchesPlayed = 20,
        int $winStreak = 0
    ): int {
        // Dynamic K-Factor
        $kFactor = 20;
        if ($matchesPlayed < 30) {
            $kFactor = 32; // Placement matches
        } elseif ($playerElo >= 2400) {
            $kFactor = 12; // Grandmaster stability
        }

        // Win streak momentum bonus
        if ($winStreak >= 3 && $actualScore === 1.0) {
            $kFactor += 4;
        }

        // Expected score
        $exponent = ($opponentElo - $playerElo) / 400.0;
        $expectedScore = 1.0 / (1.0 + pow(10.0, $exponent));

        // Rating delta
        $delta = (int)round($kFactor * ($actualScore - $expectedScore));
        return $delta;
    }

    public static function getTier(int $elo): string {
        if ($elo >= 2400) return 'Grandmaster';
        if ($elo >= 2000) return 'Diamond';
        if ($elo >= 1700) return 'Platinum';
        if ($elo >= 1400) return 'Gold';
        if ($elo >= 1200) return 'Silver';
        return 'Bronze';
    }
}
