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




@app.post("/api/register")
def register(request: RegisterRequest):
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (request.name, request.email, hash_password(request.password), request.role),
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    finally:
        conn.close()

    return {"id": user_id, "name": request.name, "email": request.email, "role": request.role}


@app.post("/api/login")
def login(request: LoginRequest):
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        (request.email, hash_password(request.password)),
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
