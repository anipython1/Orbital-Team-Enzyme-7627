# FindMyFYP (MVP)

> Find the right project. Build the right skills.

FindMyFYP is a web platform that helps university students discover suitable
**Final Year Projects (FYPs)** based on the skills they already have, the
skills they want to learn, and their personal interests. Instead of scrolling
through a long, flat list of project titles, students fill in a short profile
and receive every available project **ranked by a match score** — so the best
fits rise to the top.

**This MVP covers:** the landing page, login, registration, a public project
explorer, and the student dashboard with keyword-based project matching
(steps 1–4 of the project plan).

## Table of Contents

- [Milestone 1 — Ideation](#milestone-1--ideation)
  - [Problem & Motivation](#problem--motivation)
  - [Proposed Core Features / User Stories](#proposed-core-features--user-stories)
  - [Design](#design)
  - [Plan](#plan)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-fastapi)
  - [Frontend Setup](#2-frontend-react)
  - [Troubleshooting](#troubleshooting)
- [How to Use](#how-to-use)
- [How Matching Works](#how-matching-works-simple-keyword-matching)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Sample Data](#sample-data)
- [Known Limitations](#known-limitations)
- [Future Work](#future-work)

---

## Milestone 1 — Ideation

### Problem & Motivation

Choosing a Final Year Project is one of the most consequential decisions in a
student's degree: it shapes their final-year workload, the skills they
graduate with, and often the direction of their first job. Yet at most
universities the selection process is surprisingly primitive:

- **Information overload.** Project lists are circulated as long PDFs,
  spreadsheets, or notice-board posts containing dozens of titles. There is
  no way to filter, search, or compare them against your own background.
- **Poor fit.** Students frequently choose based on the title alone, and
  only discover weeks later that the project requires skills they don't have
  — or worse, teaches them nothing new. A bad fit leads to lower grades,
  higher stress, and sometimes a mid-semester change of topic.
- **First-come-first-served pressure.** Popular supervisors fill their
  quotas within days. The pressure to "lock in" a project quickly rewards
  speed over informed decision-making.
- **No visibility for supervisors.** Supervisors publish a title and a
  paragraph, then wait. They have no structured way to see which students
  are genuinely suited to (or interested in) their projects until students
  email them one by one.
- **Mismatch costs everyone.** Poorly matched projects produce weaker
  outcomes for students, more supervision effort for staff, and lower
  overall FYP quality for the department.

**The core idea:** treat FYP selection as a *matching problem* rather than a
*browsing problem*. A student describes three things —

1. skills they **already have** (e.g. `Python, SQL`),
2. skills they **want to learn** (e.g. `Machine Learning`),
3. their **interests** (e.g. `education, chatbots`),

— and the system scores every project in the catalogue against that profile,
returning a ranked list. The decision becomes driven by *fit*, not luck,
speed, or whoever shouted about their project the loudest.

### Proposed Core Features / User Stories

#### Student stories

| # | User story | Acceptance criteria | Status |
|---|-----------|---------------------|--------|
| S1 | As a student, I can **register** an account with my name, email and password so I have my own profile. | Registration form validates input; duplicate emails are rejected with a clear message; on success I am logged in and taken to my dashboard. | ✅ MVP |
| S2 | As a student, I can **log in** with my email and password so I can return to my dashboard. | Wrong credentials show "Incorrect email or password"; success redirects to the dashboard. | ✅ MVP |
| S3 | As a student, I can **enter my skills and interests** (have / want to learn / interests) so the system understands my background. | Three free-text fields accept comma-separated values; at least one keyword is required. | ✅ MVP |
| S4 | As a student, I can see **all projects ranked by match score** so I can shortlist the best fits quickly. | Each project card shows a percentage badge and a progress bar; the list is sorted highest-first. | ✅ MVP |
| S5 | As a student, I can **explore all projects without logging in** so I can get a feel for what's available before committing to an account. | A public "Explore Projects" page lists every project with its skills and difficulty. | ✅ MVP |
| S6 | As a student, I can press **"I'm Interested"** on a project so the supervisor knows about me. | Interest is recorded once per student per project; the supervisor can see it. | ⏳ Planned |

#### Supervisor stories *(later milestone)*

| # | User story | Status |
|---|-----------|--------|
| V1 | As a supervisor, I can **post and edit my project ideas**, including required skills and difficulty level. | ⏳ Planned |
| V2 | As a supervisor, I can **see which students expressed interest** in my projects, alongside their match scores, so I can shortlist candidates. | ⏳ Planned |

#### Admin stories *(later milestone)*

| # | User story | Status |
|---|-----------|--------|
| A1 | As an admin, I can **manage users and projects** (view, edit, remove) to keep the catalogue clean. | ⏳ Planned |
| A2 | As an admin, I can see **simple statistics** (number of students, projects, interests) to monitor adoption. | ⏳ Planned |

> The `users` table already stores a `role` (`student` / `supervisor` /
> `admin`), so the supervisor and admin milestones require no schema
> migration — only new screens and routes.

### Design

#### High-level architecture

```
┌──────────────────────┐         JSON over HTTP         ┌──────────────────────┐
│   React SPA (Vite)   │  ───────────────────────────►  │   FastAPI backend    │
│  Tailwind + shadcn   │  ◄───────────────────────────  │      (Python)        │
│   localhost:5173     │        CORS-restricted         │    localhost:8000    │
└──────────────────────┘                                └──────────┬───────────┘
        │                                                          │
        │  localStorage                                            │  sqlite3 (stdlib)
        ▼                                                          ▼
┌──────────────────────┐                                ┌──────────────────────┐
│  "session" = stored  │                                │     findmyfyp.db     │
│      user object     │                                │  (single SQLite file)│
└──────────────────────┘                                └──────────────────────┘
```

- The **frontend** is a single-page app. React Router handles navigation;
  all data comes from the backend through a tiny fetch wrapper
  (`src/lib/api.js`).
- The **backend** exposes four JSON endpoints (see
  [API Reference](#api-reference)). CORS is restricted to the Vite dev
  origin (`http://localhost:5173`).
- The **database** is a single SQLite file created automatically on first
  startup, seeded with 8 sample projects so the app is demo-ready
  immediately.

#### Key design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Matching algorithm | Transparent keyword matching | Explainable to examiners and users ("you matched 3 of 4 required skills"), trivial to debug, and good enough to validate the idea. A smarter algorithm (TF-IDF, embeddings) can replace `matching.py` later **without changing the API contract**. |
| Database | SQLite | Zero installation, zero configuration, a single file — ideal for an MVP and for markers who need to run the project quickly. The SQL is standard, so migrating to PostgreSQL later is straightforward. |
| Backend framework | FastAPI | Automatic interactive docs at `/docs` (great for demos), Pydantic request validation for free, and very little boilerplate. |
| Frontend | React + Vite + Tailwind + shadcn/ui | Fast dev server, utility-first styling, and a consistent accessible component library without designing from scratch. |
| Roles from day one | `student` / `supervisor` / `admin` on the user record | Future milestones (supervisor & admin dashboards) need only new screens, not a schema change. |
| Skills storage | Comma-separated text columns | Keeps the MVP schema simple. A normalised `skills` table is a known future refactor if filtering/analytics are needed. |
| Session handling | Logged-in user kept in `localStorage` | Simplest thing that works for a single-machine demo; flagged for replacement with JWT (see [Known Limitations](#known-limitations)). |

#### Data model

```
users                                projects
─────                                ────────
id        INTEGER PK                 id              INTEGER PK
name      TEXT                      title           TEXT
email     TEXT UNIQUE               supervisor_name TEXT
password  TEXT (SHA-256 hash)       description     TEXT
role      TEXT (student/            required_skills TEXT (comma separated)
                supervisor/admin)    difficulty      TEXT (Beginner/Intermediate/Advanced)
```

### Plan

The project is broken into nine incremental steps. Each step leaves the app
in a working, demonstrable state.

| Step | Scope | Milestone | Status |
|------|-------|-----------|--------|
| 1 | Landing page with public project explorer | MVP | ✅ Done |
| 2 | Register / login with roles | MVP | ✅ Done |
| 3 | Student dashboard — enter skills & interests | MVP | ✅ Done |
| 4 | Keyword-based matching with ranked results | MVP | ✅ Done |
| 5 | Project detail view + "I'm Interested" button | Milestone 2 | ⏳ Next |
| 6 | Supervisor dashboard — post/edit projects, see interested students | Milestone 2 | ⏳ Planned |
| 7 | Admin dashboard — manage users and projects | Milestone 3 | ⏳ Planned |
| 8 | Hardening — bcrypt password hashing, JWT sessions | Milestone 3 | ⏳ Planned |
| 9 | Polish, testing and final report | Milestone 3 | ⏳ Planned |

---

## Tech Stack

| Layer    | Technology                                  | Version notes |
| -------- | ------------------------------------------- | ------------- |
| Frontend | React (Vite) + Tailwind CSS + shadcn/ui     | React 19, Vite 6, Tailwind 4 |
| Routing  | React Router                                | v7 |
| Backend  | FastAPI (Python)                            | Python 3.10+ |
| Server   | Uvicorn (ASGI)                              | with `--reload` for development |
| Database | SQLite                                      | single file, created automatically |

## Folder Structure

```
FYP-Project/
├── backend/
│   ├── main.py            # FastAPI app — all API routes (register, login, projects, match)
│   ├── database.py        # SQLite connection helper, table creation, sample project data
│   ├── matching.py        # keyword matching logic (pure functions, no framework code)
│   ├── requirements.txt   # fastapi + uvicorn[standard]
│   └── findmyfyp.db       # created automatically on first run (gitignored)
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── main.jsx               # entry point — mounts <App/> inside BrowserRouter
        ├── App.jsx                # route table (/, /login, /register, /dashboard, /explore)
        ├── pages/
        │   ├── Landing.jsx        # hero, feature cards, links to login/register/explore
        │   ├── Login.jsx          # email + password form
        │   ├── Register.jsx       # name/email/password/role form
        │   ├── StudentDashboard.jsx  # skills form + ranked match results
        │   └── ExploreProjects.jsx   # public list of all projects
        ├── components/
        │   ├── ProjectCard.jsx    # one project: title, supervisor, skills, difficulty,
        │   │                      #   optional match-score badge + progress bar
        │   └── ui/                # shadcn/ui primitives (button, card, input, ...)
        └── lib/
            ├── api.js             # fetch wrapper + the four API calls
            └── auth.js            # saveUser / getUser / logout via localStorage
```

## Getting Started

### Prerequisites

- **Python 3.10 or newer** — check with `python --version`
- **Node.js 18 or newer** (includes npm) — check with `node --version`
- Two terminals (the backend and frontend run side by side)

### 1. Backend (FastAPI)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

- API base URL: **http://localhost:8000**
- Interactive API docs (Swagger UI): **http://localhost:8000/docs** — you
  can try every endpoint from the browser, no extra tools needed.
- On first startup the SQLite database (`findmyfyp.db`) is created
  automatically and seeded with **8 sample projects**.

### 2. Frontend (React)

In a **second terminal**:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `venv\Scripts\activate` fails with *"running scripts is disabled on this system"* | PowerShell's default execution policy blocks the activation script. | Run once: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`, then open a new terminal and try again. |
| `uvicorn` is *"not recognized as the name of a cmdlet"* | The `uvicorn.exe` script folder isn't on PATH (common when the venv wasn't activated). | Use `python -m uvicorn main:app --reload` instead — it always works. |
| `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'` (or similar binary import errors) | The venv was created with one Python version and is now running another, leaving stale compiled packages behind. | Delete and rebuild the venv: `Remove-Item -Recurse -Force venv`, then `python -m venv venv`, activate, and `pip install -r requirements.txt` again. |
| Frontend shows *"Failed to fetch"* / network errors | The backend isn't running, or is on a different port. | Make sure the backend terminal shows Uvicorn running on port 8000. |
| Browser console shows CORS errors | The frontend isn't running on `http://localhost:5173` (the only origin the backend allows). | Run the frontend with `npm run dev` (default port 5173), or add your origin to `allow_origins` in `backend/main.py`. |
| Port 8000 or 5173 already in use | Another process holds the port. | Stop the other process, or run uvicorn with `--port 8001` and update `API_URL` in `frontend/src/lib/api.js`. |

## How to Use

1. Click **Register** and create a **Student** account → you land on the
   dashboard.
2. Enter your skills and interests (comma separated), e.g.
   - Skills I have: `Python, SQL`
   - Skills I want to learn: `Machine Learning`
   - Interests: `data, charts`
3. Click **Find Matching Projects** → every project appears as a card,
   sorted by match score, with a percentage badge and a progress bar.
4. Want to browse first? **Explore Projects** on the landing page shows the
   full catalogue without logging in.

## How Matching Works (simple keyword matching)

The matching logic lives in `backend/matching.py` and is deliberately
simple and transparent:

1. **Keyword extraction.** Everything the student typed (skills they have,
   skills they want to learn, interests) is combined, split on commas, and
   lower-cased into one keyword list. `"Python, SQL"` →
   `["python", "sql"]`.
2. **Skill score (70% of the total).** For each of the project's required
   skills, the student matches it if any of their keywords is a substring of
   the skill or vice versa (so `data` matches `Data Analysis`). The score is
   *matched skills ÷ total required skills*.
3. **Interest score (30% of the total).** Counts how many of the student's
   keywords appear anywhere in the project description. Three or more hits
   give the full score (*hits ÷ 3*, capped at 1.0).
4. **Final score** = `0.7 × skill score + 0.3 × interest score`, rounded
   and shown as a percentage.

### Worked example

Student profile:

- Skills I have: `Python, SQL`
- Skills I want to learn: `Machine Learning`
- Interests: `data, charts`

→ keywords: `["python", "sql", "machine learning", "data", "charts"]`

Project: **Student Result Analytics Dashboard** — required skills
`Python, Data Analysis, SQL, Data Visualization`; description *"Build a
dashboard that visualises student grades and trends using charts so
lecturers can spot struggling students early."*

| Component | Calculation | Result |
|-----------|------------|--------|
| Skill score | `python` ✓, `data` matches *Data Analysis* ✓, `sql` ✓, `data` matches *Data Visualization* ✓ → 4/4 | 1.00 |
| Interest score | only `charts` appears in the description → 1 hit ÷ 3 | 0.33 |
| **Final** | 0.7 × 1.00 + 0.3 × 0.33 = 0.80 | **80%** |

Because the algorithm is a pure function over the request and the project
row, it can later be swapped for something smarter (TF-IDF, embeddings)
without touching any route or frontend code.

## API Reference

Base URL: `http://localhost:8000` — interactive docs at `/docs`.

### POST `/api/register`

Create a user account.

```jsonc
// Request
{ "name": "Alice Tan", "email": "alice@uni.edu", "password": "secret123", "role": "student" }

// 200 Response
{ "id": 1, "name": "Alice Tan", "email": "alice@uni.edu", "role": "student" }

// 400 — email already taken
{ "detail": "This email is already registered." }
```

### POST `/api/login`

Verify credentials and return the user.

```jsonc
// Request
{ "email": "alice@uni.edu", "password": "secret123" }

// 200 Response
{ "id": 1, "name": "Alice Tan", "email": "alice@uni.edu", "role": "student" }

// 401 — bad credentials
{ "detail": "Incorrect email or password." }
```

### GET `/api/projects`

List every project (used by the public Explore page).

```jsonc
// 200 Response (array)
[
  {
    "id": 5,
    "title": "Student Result Analytics Dashboard",
    "supervisor_name": "Ms. Nurul Huda",
    "description": "Build a dashboard that visualises student grades and trends...",
    "required_skills": "Python, Data Analysis, SQL, Data Visualization",
    "difficulty": "Beginner"
  }
]
```

### POST `/api/match`

Score all projects against a student profile; returns them sorted
best-match-first. All three fields are free text, comma separated.

```jsonc
// Request
{ "skills_have": "Python, SQL", "skills_want": "Machine Learning", "interests": "data, charts" }

// 200 Response (array, sorted by match_score descending)
[
  { "id": 5, "title": "Student Result Analytics Dashboard", "...": "...", "match_score": 80 },
  { "id": 7, "title": "Fake News Detection System",          "...": "...", "match_score": 62 }
]

// 400 — empty profile
{ "detail": "Please enter at least one skill or interest." }
```

## Database Schema

Created automatically by `backend/database.py` on first startup.

**`users`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | primary key, autoincrement |
| name | TEXT | not null |
| email | TEXT | not null, **unique** |
| password | TEXT | not null — SHA-256 hash, never plain text |
| role | TEXT | not null — `student`, `supervisor`, or `admin` (CHECK constraint) |

**`projects`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | primary key, autoincrement |
| title | TEXT | not null |
| supervisor_name | TEXT | not null |
| description | TEXT | not null |
| required_skills | TEXT | not null — comma separated, e.g. `"Python, SQL"` |
| difficulty | TEXT | not null — `Beginner` / `Intermediate` / `Advanced` |

## Frontend Pages & Routes

| Route | Page | Access | Purpose |
|-------|------|--------|---------|
| `/` | Landing | Public | Hero, feature cards, links to login / register / explore |
| `/explore` | ExploreProjects | Public | Full project catalogue, no account needed |
| `/login` | Login | Public | Email + password form |
| `/register` | Register | Public | Name, email, password, role |
| `/dashboard` | StudentDashboard | Logged-in | Skills/interests form + ranked match results |

## Sample Data

Eight projects spanning different domains and difficulty levels are seeded
on first run, so matching can be demonstrated immediately:

| Project | Skills | Difficulty |
|---------|--------|-----------|
| Smart Attendance System using Face Recognition | Python, OpenCV, Machine Learning, Flask | Intermediate |
| E-Commerce Website for Campus Bookstore | React, JavaScript, Node.js, SQL | Beginner |
| Mental Health Chatbot for Students | Python, NLP, Machine Learning, APIs | Advanced |
| Mobile App for Food Waste Reduction | Flutter, Firebase, Mobile Development, UI Design | Intermediate |
| Student Result Analytics Dashboard | Python, Data Analysis, SQL, Data Visualization | Beginner |
| IoT Smart Parking System | IoT, Arduino, Python, Web Development | Advanced |
| Fake News Detection System | Python, Machine Learning, NLP, Data Analysis | Advanced |
| University Event Management Portal | React, JavaScript, SQL, Web Development | Beginner |

## Known Limitations

These are conscious MVP trade-offs, not oversights — each has a planned fix:

- **Password hashing is SHA-256** (unsalted). Acceptable for a local demo;
  will be replaced with **bcrypt** in the hardening step (step 8).
- **The "session" is the user object in `localStorage`.** There is no token
  or expiry — anyone with the browser can edit it. Will be replaced with
  **JWT** authentication (step 8).
- **No authorisation on API routes.** All endpoints are open; route-level
  role checks arrive together with the supervisor/admin dashboards.
- **Skills are comma-separated text**, not a normalised table — fine for
  matching, but limits filtering/analytics later.
- **Matching is substring-based**, so very short keywords can over-match
  (e.g. `c` would match many skills). Users are expected to enter
  meaningful, comma-separated terms.
- **Single-machine setup** — CORS and API URLs are hardcoded to
  `localhost`; deployment configuration is out of scope for the MVP.

## Future Work

In rough priority order (continuing the plan table above):

1. **Project detail page + "I'm Interested"** — an `interests` join table
   (`student_id`, `project_id`) and a button on each card.
2. **Supervisor dashboard** — CRUD for own projects; list of interested
   students with their match scores.
3. **Admin dashboard** — user/project management and simple usage stats.
4. **Security hardening** — bcrypt, JWT, role-based route protection.
5. **Smarter matching** — weight "skills I want to learn" differently from
   "skills I have", synonym handling (`ML` = `Machine Learning`), and
   eventually TF-IDF or embedding-based similarity behind the same
   `/api/match` contract.
6. **Quality** — automated tests for the matching logic and API routes,
   plus a small seed script for demo accounts.
