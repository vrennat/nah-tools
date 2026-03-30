-- nah — Dynamic QR Code Redirects
-- D1 (SQLite) schema

CREATE TABLE IF NOT EXISTS redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  label TEXT,
  passphrase_hash TEXT NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_short_code ON redirects(short_code);
CREATE INDEX IF NOT EXISTS idx_is_active ON redirects(is_active);
