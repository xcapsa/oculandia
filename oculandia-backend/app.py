# oculandia-main/backend/app.py
import os
import re
import sqlite3
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

# ------------------------------------------------------------------
# 0. PATHS
# ------------------------------------------------------------------
BACKEND_DIR  = os.path.dirname(os.path.abspath(__file__))  # oculandia-main/backend
FRONTEND_DIR = os.path.join(BACKEND_DIR, "..")             # oculandia-main
DB_PATH      = os.path.join(FRONTEND_DIR, "data", "oculandia.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

app = Flask(__name__)
app.secret_key = "chiave-a-caso-da-cambiare-per-pubblicazione"
CORS(app, supports_credentials=True)

# ------------------------------------------------------------------
# 1. DB
# ------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    schema_path = os.path.join(BACKEND_DIR, "migrations", "01_create_schema.sql")
    with sqlite3.connect(DB_PATH) as conn:
        with open(schema_path, encoding="utf-8") as f:
            conn.executescript(f.read())
        conn.commit()
    print("Database inizializzato:", DB_PATH)

# ------------------------------------------------------------------
# 2. STATIC ROUTES  (FUORI da init_db!)
# ------------------------------------------------------------------
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

# ------------------------------------------------------------------
# 3. API
# ------------------------------------------------------------------

# REGISTER-----------------------------------------------------------------------------
@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    email        = data.get("email", "").strip().lower()
    display_name = data.get("display_name", "").strip()
    password     = data.get("password", "")

    if not email or not display_name or not password:
        return jsonify({"error": "Tutti i campi sono obbligatori"}), 400
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "E-mail non valida"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password troppo corta (min 6)"}), 400

    try:
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
                (email, display_name, generate_password_hash(password)),
            )
            user_id = cur.lastrowid
            conn.commit()
    except sqlite3.IntegrityError:          # UNIQUE fail
        return jsonify({"error": "E-mail già registrata"}), 409

    print(f"Nuovo utente: {email} (id={user_id})")
    return jsonify({"message": "Registrazione completata", "user_id": user_id}), 201

#LOGIN-------------------------------------------------------------------------------------
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email e password obbligatorie"}), 400

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, display_name, password_hash FROM users WHERE email = ?",
            (email,)
        ).fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Credenziali non valide"}), 401

    # DA TESTARE sessione di esempio (cookie) "sembra funzionare"
    from flask import session
    session.clear()
    session["user_id"]   = user["id"]
    session["user_name"] = user["display_name"]

    return jsonify({
        "message": "Login effettuato",
        "user": {"id": user["id"], "display_name": user["display_name"]}
    }), 200

#ME (UTENTI) ----------------------------------------------------------------------------------------
@app.get("/api/me")
def me():
    if "user_id" not in session:
        return jsonify({"error": "Non autenticato"}), 401

    uid = session["user_id"]
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, display_name, email, bio, avatar, first_login,"
            "       posts_count, events_count, tourneys_count, deals_count "
            "FROM users WHERE id = ?", (uid,)
        ).fetchone()

        nicknames = conn.execute(
            "SELECT platform, nickname FROM nicknames WHERE user_id = ?", (uid,)
        ).fetchall()

        headsets = conn.execute(
            "SELECT model, notes FROM headsets WHERE user_id = ?", (uid,)
        ).fetchall()

        socials = conn.execute(
            "SELECT platform, handle FROM socials WHERE user_id = ?", (uid,)
        ).fetchall()

        achievements = conn.execute(
            "SELECT a.code, a.title, a.description, ua.earned_at "
            "FROM user_achievements ua "
            "JOIN achievements a ON a.id = ua.achievement_id "
            "WHERE ua.user_id = ?", (uid,)
        ).fetchall()

        friends = conn.execute(
            "SELECT u.id, u.display_name "
            "FROM friends f "
            "JOIN users u ON u.id = f.addressee_id "
            "WHERE f.requester_id = ? AND f.status = 'accepted' "
            "UNION "
            "SELECT u.id, u.display_name "
            "FROM friends f "
            "JOIN users u ON u.id = f.requester_id "
            "WHERE f.addressee_id = ? AND f.status = 'accepted'", (uid, uid)
        ).fetchall()

    # primo accesso: metti a zero i contatori e flag a 0
    if user["first_login"]:
        with get_db() as conn:
            conn.execute(
                "UPDATE users SET first_login = 0, posts_count = 0, events_count = 0, "
                " tourneys_count = 0, deals_count = 0 WHERE id = ?", (uid,)
            )
            conn.commit()

    return jsonify({
        "user": {
            "id":             user["id"],
            "display_name":   user["display_name"],
            "email":          user["email"],
            "bio":            user["bio"],
            "avatar":         user["avatar"] or "",
            "posts_count":    user["posts_count"],
            "events_count":   user["events_count"],
            "tourneys_count": user["tourneys_count"],
            "deals_count":    user["deals_count"]
        },
        "nicknames":  [dict(r) for r in nicknames],
        "headsets":   [dict(r) for r in headsets],
        "socials":    [dict(r) for r in socials],
        "achievements": [
            {"code": a["code"], "title": a["title"], "description": a["description"], "earned_at": a["earned_at"]}
            for a in achievements
        ],
        "friends":    [dict(r) for r in friends]
    }), 200

@app.post("/api/me")
def update_me():
    if "user_id" not in session:
        return jsonify({"error": "Non autenticato"}), 401

    data = request.get_json(silent=True) or {}
    new_bio    = data.get("bio", "").strip()
    new_name   = data.get("display_name", "").strip()

    if new_name and len(new_name) < 2:
        return jsonify({"error": "Nome troppo corto"}), 400

    sets = []
    vals = []
    if "bio" in data:
        sets.append("bio = ?")
        vals.append(new_bio)
    if "display_name" in data:
        sets.append("display_name = ?")
        vals.append(new_name)

    if not sets:
        return jsonify({"error": "Niente da aggiornare"}), 400

    vals.append(session["user_id"])
    with get_db() as conn:
        conn.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = ?", vals)
        conn.commit()

    return jsonify({"message": "Profilo aggiornato"}), 200

#LOGOUT-------------------------------------------------------------------------------------------------------
@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logout effettuato"}), 200

#NICKNAME------------------------------------------------------------------------------------------------------
@app.post("/api/profile/nickname")
def add_nickname():
    if "user_id" not in session:
        return jsonify({"error": "Non autenticato"}), 401

    data = request.get_json(silent=True) or {}
    platform = data.get("platform", "").strip()
    nickname = data.get("nickname", "").strip()

    if not platform or not nickname:
        return jsonify({"error": "Dati mancanti"}), 400

    uid = session["user_id"]
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO nicknames(user_id, platform, nickname) VALUES (?,?,?) "
                "ON CONFLICT(user_id, platform) DO UPDATE SET nickname=?",
                (uid, platform, nickname, nickname)
            )
            conn.commit()
            # ritorna la lista aggiornata
            rows = conn.execute(
                "SELECT platform, nickname FROM nicknames WHERE user_id = ?", (uid,)
            ).fetchall()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Errore database"}), 500

    return jsonify({"profiles": [dict(r) for r in rows]}), 200

#HEADSETS---------------------------------------------------------------------------------------------------------
@app.post("/api/headsets")
def add_headset():
    if "user_id" not in session:
        return jsonify({"error": "Non autenticato"}), 401
    data = request.get_json(silent=True) or {}
    model = data.get("model", "").strip()
    notes = data.get("notes", "").strip()
    if not model:
        return jsonify({"error": "Modello obbligatorio"}), 400
    with get_db() as conn:
        conn.execute(
            "INSERT INTO headsets(user_id, model, notes) VALUES (?,?,?)",
            (session["user_id"], model, notes)
        )
        conn.commit()
        rows = conn.execute(
            "SELECT model, notes FROM headsets WHERE user_id = ?", (session["user_id"],)
        ).fetchall()
    return jsonify({"headsets": [dict(r) for r in rows]}), 201


# ------------------------------------------------------------------
# 4. START
# ------------------------------------------------------------------
if __name__ == "__main__":
    print("DB_PATH assoluto:", os.path.abspath(DB_PATH))

    init_db()
    app.run(debug=True, port=5000)