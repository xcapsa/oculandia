CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT UNIQUE NOT NULL,
    display_name    TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio             TEXT DEFAULT '',
    avatar          TEXT DEFAULT '',
    first_login     INTEGER DEFAULT 1,
    posts_count     INTEGER DEFAULT 0,
    events_count    INTEGER DEFAULT 0,
    tourneys_count  INTEGER DEFAULT 0,
    deals_count     INTEGER DEFAULT 0
);