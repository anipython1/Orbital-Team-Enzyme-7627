# FindMyFYP

FindMyFYP is a web platform that helps university students discover suitable
Final Year Projects (FYPs) based on the skills they already have, the
skills they want to learn and their personal interests. Instead of scrolling
through a long, flat list of project titles, students fill in a short profile
and receive every available project  so the best fits rise to the top. Teachers also 
can submit projects inside and allow students to match with them.


# Problem & Motivation

Issues with current FYP matching:

- 1. Information overload- Project lists are circulated as long PDFs,
  spreadsheets, or notice-board posts containing dozens of titles. There is
  no way to filter, search, or compare them against your own background

- 2. Poor fit- Students frequently choose based on the title alone, and
  only discover weeks later that the project requires skills they don't have
  A bad fit leads to lower grades, higher stress, and sometimes a mid-semester change of topic.

- 3. First-come-first-served pressure- Popular supervisors fill their
  quotas within days. The pressure to "lock in" a project quickly rewards
  speed over informed decision-making.

- 4. No visibility for supervisors- Supervisors publish a title and a
  paragraph, then wait. They have no structured way to see which students
  are genuinely suited to (or interested in) their projects until students
  email them one by one

# Aim

We aim to develop a centralized and intelligent platform that improves the project-student
matching process. Instead of a simple project list, the system will use AI (NLP) to match
project requirements with student skills and provide recommended Coursera courses to help
students fill any skill gaps.
The system will enable students to:
● Select projects that match their skills, interests, and career goals
● Filter projects based on skills they already have or want to learn
● Clearly understand project requirements and expectations
● Identify skill gaps and receive relevant Coursera course recommendations
● Make better decisions using real-time project demand insights
● Discover and connect with potential teammates for interdisciplinary projects
The system will enable the supervisors to:
● Provide clear visibility of the project to the students
● Identify and select the suitable students for the project
Overall, the goal is to transform the FYP selection process into a more personalized,
transparent, and intelligent system that improves both student experience and project
outcomes.

### Proposed Core Features / User Stories

#### Student/Supervisor stories

1. As a Student who wants to choose a suitable FYP project, I want to receive
personalized project recommendations, so that I can make informed decisions.
2. As a Student, I want to filter projects by “Skills I have” and “Skills I want to learn”, so
that my project aligns with my career goals.
3. As a Student, I want to see a Skill Analysis, so that I understand what I need to learn
before starting the project.
4. As a Student, I want to receive recommended Coursera courses, so that I can prepare
effectively.
5. As a Student, I want to see a real-time demand heatmap (project popularity), so that I
can manage expectations and bid strategically.
6. As a Student, I want a simple explanation of complex project descriptions, so that I can
better understand them.
7. As a Student, I want an interface to discover and connect with potential teammates or
students with similar projects, so that I can form a team or discuss ideas.
8. As a Supervisor, I want my project to be automatically tagged with relevant technical
keywords, so that it attracts students with the right background.


Features


2. Feature 1 (core): Student Profiling & Filtering. Students can input their current skills,
interests, and the skills they want to learn. The system will use this information to filter
and show relevant projects.
3. Feature 2 (core)-Teachers can submit their projects which in return students can view and connect with them
4. Feature 3 (extension): Skills Analysis. The system will show the skills needed for the
project, difference between the student’s current skills and the skills required for each
project. This helps students understand what they need to learn.
5. Feature 4 (extension): Coursera Course Recommendation. Based on the skills, the
system will suggest relevant Coursera courses to help students prepare for the project.
6. Feature 5 (extension): Real-Time Demand Heatmap. Students can show interest in
projects, and the system will display how many students are interested in each project.
This helps students understand competition levels. And also the admi can see these statistics


## High-level architecture

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

## Entity Relationship Diagram

The SQLite database  has two tables with 1 relationship. - users and projects A supervisor is simply a
`users` row with role = 'supervisor'. Projects link to their supervisor
by email 

```
        users                                       projects
+-----------------------+                +----------------------------------+
| PK id        INTEGER  |                | PK id                  INTEGER   |
|    name      TEXT      |                |    title               TEXT      |
|    email     TEXT (UK) |                |    supervisor_name     TEXT      |
|    password  TEXT      |                | FK contact_email       TEXT      |
|    role      TEXT      |                |    description         TEXT      |
+-----------------------+                |    required_skills     TEXT      |
           │                             |    languages           TEXT      |
           │  email = contact_email      |    prerequisite_knowledge TEXT   |
           │  (soft link, not enforced)  |    expected_deliverables  TEXT   |
           │                             |    domain_keywords     TEXT      |
           └──── 1 ───────────< many ────|    difficulty          TEXT      |
       one supervisor   has many projects +----------------------------------+
```

Timeline

Milestone 1 – Technical Proof of Concept
In this phase, a basic system will be built to show end-to-end functionality. It will include a
simple interface to view project descriptions and enter student profiles, along with backend
integration. Basic skill and keyword extraction will be implemented at a simple level.
➔ Feature 1 (Project Skill Extraction) will be implemented at a basic level.
➔ Feature 2 (Student Profiling) will be implemented at an initial level.

Milestone 2 – Prototype
In this phase, the main functionality of the system will be developed. The project
recommendation engine will match students to projects and provide a ranked list based on
skills and interests. Filtering features will be fully available and skill extraction will be done
➔ Feature 1 will be completed at an advanced level.
➔ Feature 2 will be fully implemented.
➔ Feature 3  will be completed.

Milestone 3 – Extended System
In this phase, advanced features will be added to improve usability.  heatmap to show project popularity. and bug fixes
➔ Feature 4 and 5 will be completed


## Tech Stack

Frontend

- React 19 — UI library
- Vite 6 — build tool / dev server
- Tailwind CSS 4 styling, plus tw-animate-css for animations
- shadcn/ui-style components 

Backend

- Python with FastAPI 

Database

- SQLite

## User Flow

![FindMyFYP user flow for students, supervisors, and administrators](docs/user-flow.png)


## Some tech stack details

Architecture

"It's a React + Vite single-page frontend talking over JSON to a FastAPI Python backend, with SQLite as the database.


Login / password security

For login, passwords are never stored as plain text. When a user registers, the password is run through hashing using Python's built-in hashlib library in our FastAPI backend, and only the resulting hash is saved in the database


SQL injection protection

All database queries use parameterized queries (the ? placeholders) rather than string concatenation, which protects against SQL injection

Role-based access

On the login screen the user first picks a role student, supervisor, or admin. The role is validated against an allowed list both on the frontend and backend and the database itself enforces it with a CHECK constraint. Admins are routed to the Statistics dashboard; everyone else goes to their respective dashboard

Session handling

We keep a lightweight session by storing the logged-in user object in the browser's localStorag so the app remembers who's logged in across pages

Project matching ( core Feature)

When a student enters the skills they have, skills they want to learn, and interests, our backend scores every project. It's a keyword-matching algorithm: 70% of the score comes from how many of the project's required skills match the student's keywords, and 30% from keywords appearing in the project description. Projects are then ranked best-match-first (matching.py)

Statistics / demand heatmap (admin)

The admin Statistics page aggregates live data of total users, total projects, a breakdown of users by role, and the most in-demand domain keywords across all projects we can see which topics are most popular.





## USER FLOW CHART
FindMyFYP follows a role-driven user flow where every user starts at a single entry point and is then guided down one of three distinct paths depending on their role. The journey begins at Start, after which the user proceeds to Login. From the login screen the flow branches into three role-based journeys - Students, Supervisors, and Administrators and although each role follows its own sequence of actions and decisions, all paths eventually converge on a single End point.
This reflects the platform's role-based access model, where one shared login leads to three different experiences: students discover and connect with projects, supervisors submit projects and respond to interest and administrators analyse data and share insights.




Students
- Begin by filling in their profile ("Tell Us About Yourself") with their skills and interests.
- Explore the available projects through matching and filtering.
- Reach a decision point "Found a suitable project?":
  - Yes- Contact the supervisor.
  - No- Wait for other projects, or contact a supervisor for more questions.


Supervisors
- Submit a project to the platform.
- Reach a decision point- "Any students contacted?":
  - Yes -Continue discussing with the student.
  - No -Wait for student interest.
Administrators
- View the statistics dashboard (demand heatmap and aggregated data).
- Reach a decision point - "Any interesting data found?":
  - Yes- identify a popular project with multiple impressions, then contact the supervisor to share insights.
  - No-Note it as a not-very-popular project, with no further action needed.
Convergence
- All three paths whether a student contacts or waits, a supervisor discusses or waits, or an admin shares insights or not funnels down to a single End point.



### FOR PERSONAL USE


# 1. Backend (FastAPI)

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

# 2. Frontend (React)

```
cd frontend
npm install
npm run dev
```