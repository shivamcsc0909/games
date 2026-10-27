-- ============================================================================
-- CYBERARENA 45 - 3NF NORMALIZED DATABASE MIGRATIONS (MySQL 8.0+)
-- Optimized for Hostinger Shared & Cloud Hosting
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `tutorial_progress`;
DROP TABLE IF EXISTS `match_participants`;
DROP TABLE IF EXISTS `matches`;
DROP TABLE IF EXISTS `player_progression`;
DROP TABLE IF EXISTS `games_catalog`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(32) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `country_code` VARCHAR(3) DEFAULT 'IN',
  `avatar` VARCHAR(32) DEFAULT '⚡',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_country` (`country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Games Catalog
CREATE TABLE `games_catalog` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `hub_category` ENUM('chess_arena', 'cube_lab', 'royal_race', 'striker_physics', 'mind_gym') NOT NULL,
  `engine_app_id` VARCHAR(32) NOT NULL,
  `min_players` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `max_players` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `default_elo` INT UNSIGNED NOT NULL DEFAULT 1200,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Player Progression (Dual Track: Bot Practice & Global PvP)
CREATE TABLE `player_progression` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `game_id` VARCHAR(64) NOT NULL,
  `bot_level_unlocked` INT UNSIGNED NOT NULL DEFAULT 1,
  `bot_stars` INT UNSIGNED NOT NULL DEFAULT 0,
  `bot_xp` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `pvp_elo` INT NOT NULL DEFAULT 1200,
  `pvp_tier` ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Grandmaster') DEFAULT 'Bronze',
  `pvp_wins` INT UNSIGNED NOT NULL DEFAULT 0,
  `pvp_losses` INT UNSIGNED NOT NULL DEFAULT 0,
  `pvp_draws` INT UNSIGNED NOT NULL DEFAULT 0,
  `current_win_streak` INT UNSIGNED NOT NULL DEFAULT 0,
  `highest_win_streak` INT UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_game` (`user_id`, `game_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games_catalog` (`id`) ON DELETE CASCADE,
  INDEX `idx_pvp_elo` (`game_id`, `pvp_elo` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Matches Table
CREATE TABLE `matches` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `game_id` VARCHAR(64) NOT NULL,
  `match_type` ENUM('bot', 'pvp_ranked', 'pvp_custom') NOT NULL,
  `room_code` VARCHAR(16) UNIQUE NULL,
  `player_count` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `status` ENUM('waiting', 'in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'waiting',
  `winner_id` BIGINT UNSIGNED NULL,
  `moves_history` JSON NULL,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL,
  FOREIGN KEY (`game_id`) REFERENCES `games_catalog` (`id`),
  FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_match_status` (`game_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Match Participants Table
CREATE TABLE `match_participants` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `match_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `seat_index` TINYINT UNSIGNED NOT NULL,
  `initial_elo` INT NOT NULL,
  `elo_change` INT NOT NULL DEFAULT 0,
  `score` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'resigned', 'timed_out', 'disconnected') DEFAULT 'active',
  FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_match_seat` (`match_id`, `seat_index`),
  UNIQUE KEY `uk_match_user` (`match_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Interactive Tutorial Progress Table
CREATE TABLE `tutorial_progress` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `game_id` VARCHAR(64) NOT NULL,
  `step_completed` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `total_steps` TINYINT UNSIGNED NOT NULL DEFAULT 4,
  `is_mastered` BOOLEAN DEFAULT FALSE,
  `completed_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_user_game_tutorial` (`user_id`, `game_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games_catalog` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data for Test User
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `country_code`, `avatar`)
VALUES (1, 'CyberStriker', 'striker@cyberarena.com', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890', 'IN', '⚡');
