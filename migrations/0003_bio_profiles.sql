-- Bio profiles: link-in-bio pages
CREATE TABLE IF NOT EXISTS bio_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  passphrase_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bio_handle ON bio_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_bio_active ON bio_profiles(is_active);

-- Links belonging to a bio profile
CREATE TABLE IF NOT EXISTS bio_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_handle TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (profile_handle) REFERENCES bio_profiles(handle)
);

CREATE INDEX IF NOT EXISTS idx_bio_links_handle ON bio_links(profile_handle);
CREATE INDEX IF NOT EXISTS idx_bio_links_order ON bio_links(profile_handle, order_index);

-- Click tracking for bio links
CREATE TABLE IF NOT EXISTS bio_click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_handle TEXT NOT NULL,
  link_id INTEGER NOT NULL,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  device_type TEXT,
  referer TEXT,
  FOREIGN KEY (profile_handle) REFERENCES bio_profiles(handle),
  FOREIGN KEY (link_id) REFERENCES bio_links(id)
);

CREATE INDEX IF NOT EXISTS idx_bio_clicks_handle ON bio_click_logs(profile_handle);
CREATE INDEX IF NOT EXISTS idx_bio_clicks_link ON bio_click_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_bio_clicks_time ON bio_click_logs(clicked_at);
