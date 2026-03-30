-- Add columns to redirects for link shortener support
ALTER TABLE redirects ADD COLUMN source TEXT NOT NULL DEFAULT 'qr';
ALTER TABLE redirects ADD COLUMN custom_alias TEXT;
ALTER TABLE redirects ADD COLUMN utm_source TEXT;
ALTER TABLE redirects ADD COLUMN utm_medium TEXT;
ALTER TABLE redirects ADD COLUMN utm_campaign TEXT;
ALTER TABLE redirects ADD COLUMN utm_term TEXT;
ALTER TABLE redirects ADD COLUMN utm_content TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_alias ON redirects(custom_alias);

-- Click log table for analytics
CREATE TABLE IF NOT EXISTS click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT,
  referer TEXT,
  user_agent TEXT,
  FOREIGN KEY (short_code) REFERENCES redirects(short_code)
);

CREATE INDEX IF NOT EXISTS idx_click_logs_code ON click_logs(short_code);
CREATE INDEX IF NOT EXISTS idx_click_logs_time ON click_logs(clicked_at);

-- Blocked domains table for spam prevention
CREATE TABLE IF NOT EXISTS blocked_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reported links table
CREATE TABLE IF NOT EXISTS reported_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  reporter_ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (short_code) REFERENCES redirects(short_code)
);

CREATE INDEX IF NOT EXISTS idx_reported_links_code ON reported_links(short_code);
