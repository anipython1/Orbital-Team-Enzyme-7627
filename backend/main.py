"""
FindMyFYP - Backend API (FastAPI + SQLite)

Run with:  uvicorn main:app --reload
Docs at:   http://localhost:8000/docs
"""

import hashlib
import os
import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db
from matching import calculate_match, text_to_keywords

app = FastAPI(title="FindMyFYP")


def _allowed_origins() -> list[str]:
    """Origins allowed to call the API.

    Always permits the local Vite dev server. In production set FRONTEND_URL to
    the deployed site (comma-separated for more than one). A bare hostname is
    upgraded to https:// so a Render `fromService` host value works as-is.
    """
    origins = [
        "http://localhost:5173",
        "https://findmyfyp-frontend.onrender.com",
    ]
    for raw in os.environ.get("FRONTEND_URL", "").split(","):
        url = raw.strip()
        if not url:
            continue
        if not url.startswith("http"):
            url = "https://" + url
        origins.append(url.rstrip("/"))
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
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


class ProjectCreateRequest(ProjectRequest):
    # Account email of the supervisor submitting the project. This is what
    # ownership is based on contact_emaiil is only the address shown to
    # students and a supervisor is free to give a different one
    owner_email: str


class ProjectUpdateRequest(ProjectRequest):
    # Email of the supervisor asking for the change, so we can check they own
    # the project before editing it.
    requester_email: str




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
def create_project(request: ProjectCreateRequest):
    """Create a new project (used by the supervisor 'Submit Project' form)."""
    owner_email = request.owner_email.strip().lower()
    if not owner_email:
        raise HTTPException(
            status_code=400,
            detail="You must be logged in as a supervisor to submit a project.",
        )

    conn = get_connection()
    cursor = conn.execute(
        """INSERT INTO projects
           (title, supervisor_name, contact_email, owner_email, description, required_skills,
            languages, prerequisite_knowledge, expected_deliverables, domain_keywords, difficulty)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            request.title,
            request.supervisor_name,
            request.contact_email.strip(),
            owner_email,
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
    return {
        **request.model_dump(),
        "id": project_id,
        "contact_email": request.contact_email.strip(),
        "owner_email": owner_email,
    }


def _owned_project_or_error(conn, project_id: int, requester_email: str):
    """Fetch a project and confirm the requester is the supervisor who owns it.

    Ownership is the project's owner_email — the account email captured when the
    project was submitted. Older rows predate that column, so fall back to
    contact_email, which is how ownership used to be inferred.
    """
    project = conn.execute(
        "SELECT * FROM projects WHERE id = ?", (project_id,)
    ).fetchone()

    if project is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    owner = (project["owner_email"] or project["contact_email"] or "").strip().lower()
    if not owner or owner != requester_email.strip().lower():
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="You can only edit or delete your own projects.",
        )

    return project


@app.get("/api/projects/{project_id}")
def get_project(project_id: int):
    """Return a single project (used to pre-fill the edit form)."""
    conn = get_connection()
    project = conn.execute(
        "SELECT * FROM projects WHERE id = ?", (project_id,)
    ).fetchone()
    conn.close()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return dict(project)


@app.put("/api/projects/{project_id}")
def update_project(project_id: int, request: ProjectUpdateRequest):
    """Update a project. Only the supervisor who submitted it may change it."""
    conn = get_connection()
    _owned_project_or_error(conn, project_id, request.requester_email)

    # owner_email is rewritten from the (already authorised) requester so legacy
    # rows that only had contact_email get a real owner the first time they are
    # edited  otherwise changing the contact address would orphan the project.
    conn.execute(
        """UPDATE projects
           SET title = ?, supervisor_name = ?, contact_email = ?, owner_email = ?,
               description = ?, required_skills = ?, languages = ?, prerequisite_knowledge = ?,
               expected_deliverables = ?, domain_keywords = ?, difficulty = ?
           WHERE id = ?""",
        (
            request.title,
            request.supervisor_name,
            request.contact_email.strip(),
            request.requester_email.strip().lower(),
            request.description,
            request.required_skills,
            request.languages,
            request.prerequisite_knowledge,
            request.expected_deliverables,
            request.domain_keywords,
            request.difficulty,
            project_id,
        ),
    )
    conn.commit()
    updated = conn.execute(
        "SELECT * FROM projects WHERE id = ?", (project_id,)
    ).fetchone()
    conn.close()
    return dict(updated)


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, requester_email: str):
    """Delete a project. Only the supervisor who submitted it may remove it."""
    conn = get_connection()
    _owned_project_or_error(conn, project_id, requester_email)

    conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"id": project_id, "deleted": True}


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
