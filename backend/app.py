from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from recommender import get_recommendations
import sqlite3
import json

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "internmatch-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "null"])
JWTManager(app)

# ── Database ──────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect("internmatch.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            email      TEXT NOT NULL UNIQUE,
            password   TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            answers    TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS saved_internships (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL,
            title    TEXT,
            company  TEXT,
            location TEXT,
            url      TEXT,
            saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    db.close()
    print("✅ Database ready.")

# ── Auth Routes ───────────────────────────────────────────────
@app.route("/api/auth/register", methods=["POST"])
def register():
    data     = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    db = get_db()
    if db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
        db.close()
        return jsonify({"message": "Email already registered."}), 409

    hashed = generate_password_hash(password)
    cursor = db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed))
    db.commit()
    user_id = cursor.lastrowid
    db.close()

    token = create_access_token(identity=str(user_id))
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email}}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    db  = get_db()
    row = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    db.close()

    if not row or not check_password_hash(row["password"], password):
        return jsonify({"message": "Invalid email or password."}), 401

    token = create_access_token(identity=str(row["id"]))
    return jsonify({"token": token, "user": {"id": row["id"], "name": row["name"], "email": row["email"]}}), 200


# ── Quiz Route ────────────────────────────────────────────────
@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        return jsonify({"message": "Please log in again."}), 401

    data    = request.get_json()
    answers = data.get("answers", [])

    db = get_db()
    db.execute("INSERT INTO quiz_results (user_id, answers) VALUES (?, ?)",
               (user_id, json.dumps(answers)))
    db.commit()
    db.close()

    return jsonify({"message": "Quiz saved!"}), 200


# ── Recommend Route ───────────────────────────────────────────
@app.route("/api/recommend", methods=["POST"])
def recommend():
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    try:
        verify_jwt_in_request()
    except:
        return jsonify({"message": "Please log in again."}), 401

    data    = request.get_json()
    answers = data.get("answers", [])

    results = get_recommendations(answers)
    return jsonify({"results": results}), 200


# ── Health Check ──────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ── Start ─────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=False)