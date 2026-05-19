-- ============================================================
-- LeBron Miniapp 数据库初始化（MySQL / 微信云托管）
-- 执行方式：在云托管 MySQL 管理界面粘贴执行
-- 可重复执行：所有 CREATE 都用 IF NOT EXISTS，幂等
-- ============================================================


-- ------------------------------------------------------------
-- 1. 用户基础信息
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  openid          VARCHAR(64) PRIMARY KEY,
  unionid         VARCHAR(64),
  nickname        VARCHAR(64),
  avatar_url      TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_last_active ON users(last_active_at DESC);


-- ------------------------------------------------------------
-- 2. 段位排行榜（每人一行）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaderboard (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  openid          VARCHAR(64) UNIQUE NOT NULL,
  nickname        VARCHAR(64),
  avatar_url      TEXT,
  score           INT NOT NULL DEFAULT 0,
  `rank`          VARCHAR(16) NOT NULL DEFAULT 'bronze',
  total_matches   INT NOT NULL DEFAULT 0,
  wins            INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT leaderboard_score_nonneg CHECK (score >= 0),
  CONSTRAINT leaderboard_rank_valid CHECK (
    `rank` IN ('bronze', 'silver', 'gold', 'diamond', 'king')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_leaderboard_score_desc ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard(`rank`);


-- ------------------------------------------------------------
-- 3. PK 对战流水
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_records (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  openid          VARCHAR(64) NOT NULL,
  score           INT NOT NULL,
  total           INT NOT NULL,
  delta           INT NOT NULL DEFAULT 0,
  rank_before     VARCHAR(16),
  rank_after      VARCHAR(16),
  played_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_match_openid ON match_records(openid);
CREATE INDEX idx_match_played_at_desc ON match_records(played_at DESC);


-- ------------------------------------------------------------
-- 4. 每日签到
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  openid          VARCHAR(64) NOT NULL,
  checkin_date    DATE NOT NULL,
  card_id         VARCHAR(64),
  streak_days     INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY checkins_openid_date (openid, checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_checkins_openid ON checkins(openid);
CREATE INDEX idx_checkins_date_desc ON checkins(checkin_date DESC);


-- ------------------------------------------------------------
-- 5. 测试数据
-- ------------------------------------------------------------
-- 段位阈值：bronze 0 / silver 200 / gold 500 / diamond 1000 / king 1800
INSERT IGNORE INTO leaderboard (openid, nickname, score, `rank`, total_matches, wins)
VALUES ('test_seed_001', '测试玩家', 100, 'bronze', 1, 1);


-- ============================================================
-- 完工。预期 4 张表 + 1 行测试数据。
-- 验证：SHOW TABLES; SELECT * FROM leaderboard;
-- ============================================================
