-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  mode VARCHAR(20) NOT NULL, -- FLASH, SPEED, STANDARD
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  user_score INTEGER DEFAULT 0,
  ai_score INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- rounds
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  round_number INTEGER NOT NULL,
  asset VARCHAR(10) NOT NULL, -- BTC, ETH, etc
  timeframe VARCHAR(10) NOT NULL, -- 30s, 1m, 5m
  start_price DECIMAL(18,8) NOT NULL,
  end_price DECIMAL(18,8),
  user_prediction VARCHAR(4), -- UP, DOWN
  ai_prediction VARCHAR(4),
  ai_reasoning TEXT,
  ai_confidence INTEGER,
  result VARCHAR(10), -- user_win, ai_win, draw
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- leaderboard (materialized view)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.points,
  u.wins,
  u.losses,
  u.current_streak,
  RANK() OVER (ORDER BY u.points DESC) as rank
FROM users u
ORDER BY u.points DESC
LIMIT 100;

-- indexes
CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_rounds_game ON rounds(game_id);
CREATE INDEX idx_leaderboard_points ON users(points DESC);
