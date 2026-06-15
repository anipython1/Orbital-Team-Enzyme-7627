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
In this phase, advanced features will be added to improve usability. The system will include
skills analysis, Coursera course recommendations, heatmap to show project popularity.
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


### 1. Backend (FastAPI)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 2. Frontend (React)


```powershell
cd frontend
npm install
npm run dev
```
