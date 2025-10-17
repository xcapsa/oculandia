# complete_schema.py
import sqlite3, os

DB = r"d:\Oculandia-App\oculandia-main\data\oculandia.db"
os.makedirs(os.path.dirname(DB), exist_ok=True)
conn = sqlite3.connect(DB)

# ---------- 1) tabelle nuove (solo se non esistono) ----------
tables_sql = {
    "nicknames": """
        CREATE TABLE IF NOT EXISTS nicknames (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            platform TEXT NOT NULL,
            nickname TEXT NOT NULL,
            UNIQUE(user_id, platform)
        );
    """,
    "headsets": """
        CREATE TABLE IF NOT EXISTS headsets (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            model    TEXT NOT NULL,
            notes    TEXT DEFAULT ''
        );
    """,
    "socials": """
        CREATE TABLE IF NOT EXISTS socials (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            platform TEXT NOT NULL,
            handle   TEXT NOT NULL,
            UNIQUE(user_id, platform)
        );
    """,
    "friends": """
        CREATE TABLE IF NOT EXISTS friends (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status       TEXT CHECK(status IN ('pending','accepted')) DEFAULT 'pending',
            UNIQUE(requester_id, addressee_id)
        );
    """,
    "achievements": """
        CREATE TABLE IF NOT EXISTS achievements (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            code        TEXT UNIQUE NOT NULL,
            title       TEXT NOT NULL,
            description TEXT NOT NULL
        );
    """,
    "user_achievements": """
        CREATE TABLE IF NOT EXISTS user_achievements (
            user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
            earned_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, achievement_id)
        );
    """,
}

for tbl, sql in tables_sql.items():
    conn.executescript(sql)
    print(f"✔ Tabella {tbl} pronta")

# ---------- 2) colonne mancanti in users ----------
cols = [
    ("bio",            "TEXT DEFAULT ''"),
    ("avatar",         "TEXT DEFAULT ''"),
    ("first_login",    "INTEGER DEFAULT 1"),
    ("posts_count",    "INTEGER DEFAULT 0"),
    ("events_count",   "INTEGER DEFAULT 0"),
    ("tourneys_count", "INTEGER DEFAULT 0"),
    ("deals_count",    "INTEGER DEFAULT 0"),
]

for name, defn in cols:
    try:
        conn.execute(f"ALTER TABLE users ADD COLUMN {name} {defn}")
        print(f"✔ Colonna {name} aggiunta")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"- Colonna {name} già presente")
        else:
            raise

conn.commit()
conn.close()
print("Schema completo aggiornato!")