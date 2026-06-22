"""
FindMyFYP - Backend API (FastAPI + SQLite)

Run with:  uvicorn main:app --reload
Docs at:   http://localhost:8000/docs
"""

import hashlib
import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db
from matching import calculate_match, text_to_keywords

app = FastAPI(title="FindMyFYP")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()


# Roles a user is allowed to register with 
VALID_ROLES = {"student", "supervisor", "admin"}


def hash_password(password: str) -> str:
    """Hash a password so we never store it as plain text.
    (Good enough for an MVP - a real app should use bcrypt.)"""
    return hashlib.sha256(password.encode()).hexdigest()




class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str 


class LoginRequest(BaseModel):
    email: str
    password: str


class MatchRequest(BaseModel):
    skills_have: str
    skills_want: str
    interests: str


class ProjectRequest(BaseModel):
    title: str
    supervisor_name: str
    contact_email: str
    difficulty: str
    description: str
    required_skills: str
    languages: str
    prerequisite_knowledge: str
    expected_deliverables: str
    domain_keywords: str




@app.get("/")
def health_check():
    """Simple health check so hosting platforms can confirm the API is alive."""
    return {"status": "ok", "service": "FindMyFYP API"}


@app.post("/api/register")
def register(request: RegisterRequest):
    # Validate before touching the database 
    # instead of a generic "email already registered" 
    if request.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Role must be one of: student, supervisor, admin.",
        )
    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters.",
        )

    # Store emails lowercase so login isn't case sensi
    email = request.email.strip().lower()

    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (request.name.strip(), email, hash_password(request.password), request.role),
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    finally:
        conn.close()

    return {"id": user_id, "name": request.name.strip(), "email": email, "role": request.role}


@app.post("/api/login")
def login(request: LoginRequest):
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        (request.email.strip().lower(), hash_password(request.password)),
    ).fetchone()
    conn.close()

    if user is None:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}




@app.get("/api/projects")
def list_projects():
    """Return all projects (used by the Explore Projects button)."""
    conn = get_connection()
    projects = conn.execute("SELECT * FROM projects").fetchall()
    conn.close()
    return [dict(p) for p in projects]


@app.post("/api/projects")
def create_project(request: ProjectRequest):
    """Create a new project (used by the supervisor 'Submit Project' form)."""
    conn = get_connection()
    cursor = conn.execute(
        """INSERT INTO projects
           (title, supervisor_name, contact_email, description, required_skills, languages,
            prerequisite_knowledge, expected_deliverables, domain_keywords, difficulty)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            request.title,
            request.supervisor_name,
            request.contact_email,
            request.description,
            request.required_skills,
            request.languages,
            request.prerequisite_knowledge,
            request.expected_deliverables,
            request.domain_keywords,
            request.difficulty,
        ),
    )
    conn.commit()
    project_id = cursor.lastrowid
    conn.close()
    return {"id": project_id, **request.model_dump()}


@app.get("/api/stats")
def get_stats():
    """Return basic site statistics (used by the admin Statistics page)."""
    conn = get_connection()
    total_projects = conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    role_rows = conn.execute(
        "SELECT role, COUNT(*) AS count FROM users GROUP BY role"
    ).fetchall()
    keyword_rows = conn.execute("SELECT domain_keywords FROM projects").fetchall()
    conn.close()

    # Count how often each domain keyword 
    keyword_counts = {}
    for row in keyword_rows:
        for keyword in text_to_keywords(row["domain_keywords"]):
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1

    top_keywords = sorted(
        ({"keyword": kw, "count": count} for kw, count in keyword_counts.items()),
        key=lambda k: k["count"],
        reverse=True,
    )

    return {
        "total_projects": total_projects,
        "total_users": total_users,
        "total_keywords": len(keyword_counts),
        "users_by_role": {row["role"]: row["count"] for row in role_rows},
        "top_keywords": top_keywords,
    }


@app.post("/api/match")
def match_projects(request: MatchRequest):
    """Score every project against the student's skills/interests
    and return them sorted from best match to worst."""
    student_keywords = text_to_keywords(
        request.skills_have + "," + request.skills_want + "," + request.interests
    )
    if not student_keywords:
        raise HTTPException(status_code=400, detail="Please enter at least one skill or interest.")

    conn = get_connection()
    projects = conn.execute("SELECT * FROM projects").fetchall()
    conn.close()

    results = []
    for project in projects:
        results.append({
            **dict(project),
            "match_score": calculate_match(student_keywords, project),
        })

  
    results.sort(key=lambda p: p["match_score"], reverse=True)
    return results
