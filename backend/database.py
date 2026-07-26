"""
Database setup for FindMyFYP.
Uses SQLite (a single file: findmyfyp.db)- no server needed
"""

import os
import sqlite3

# In production point DB_PATH 
# so registered users and submitted projects survive redeploys
DB_NAME = os.environ.get("DB_PATH", "findmyfyp.db")


def get_connection():
    """Open a connection to the SQLite database"""
    
    db_dir = os.path.dirname(DB_NAME)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables and insert sample projects (runs once at startup)."""
    conn = get_connection()
    cursor = conn.cursor()

    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            email     TEXT NOT NULL UNIQUE,
            password  TEXT NOT NULL,
            role      TEXT NOT NULL CHECK (role IN ('student', 'supervisor', 'admin'))
        )
    """)


   
    existing = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'"
    ).fetchone()
    if existing is not None:
        columns = [row[1] for row in cursor.execute("PRAGMA table_info(projects)")]
        if "domain_keywords" not in columns:
            cursor.execute("DROP TABLE projects")
        else:
            if "contact_email" not in columns:
                # Add the new column
                cursor.execute(
                    "ALTER TABLE projects ADD COLUMN contact_email TEXT NOT NULL DEFAULT ''"
                )
            if "owner_email" not in columns:
                
                cursor.execute(
                    "ALTER TABLE projects ADD COLUMN owner_email TEXT NOT NULL DEFAULT ''"
                )
                cursor.execute(
                    "UPDATE projects SET owner_email = LOWER(TRIM(contact_email))"
                )

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id                     INTEGER PRIMARY KEY AUTOINCREMENT,
            title                  TEXT NOT NULL,
            supervisor_name        TEXT NOT NULL,
            contact_email          TEXT NOT NULL,   -- supervisor email students can reach out to
            owner_email            TEXT NOT NULL DEFAULT '',  -- account email of the supervisor who submitted it
            description            TEXT NOT NULL,
            required_skills        TEXT NOT NULL,   -- technical skills, comma separated e.g. "Python, SQL"
            languages              TEXT NOT NULL,   -- programming languages, comma separated
            prerequisite_knowledge TEXT NOT NULL,   -- what a student should already know
            expected_deliverables  TEXT NOT NULL,   -- what the student is expected to produce
            domain_keywords        TEXT NOT NULL,   -- topic/domain tags, comma separated
            difficulty             TEXT NOT NULL    -- Beginner / Intermediate / Advanced
        )
    """)


    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        sample_projects = [
            (
                "Smart Attendance System using Face Recognition",
                "Dr. Aisha Rahman",
                "aisha.rahman@university.edu",
                "Build a web application that marks student attendance automatically "
                "using face recognition through a webcam.",
                "Python, OpenCV, Machine Learning, Flask",
                "Python",
                "Basic Python programming, understanding of how images are represented as arrays.",
                "A working web app with webcam capture, a trained face recognition model, and an attendance log.",
                "Computer Vision, Biometrics, Education Technology",
                "Intermediate",
            ),
            (
                "E-Commerce Website for Campus Bookstore",
                "Mr. Daniel Tan",
                "daniel.tan@university.edu",
                "Develop an online store where students can browse, search and buy "
                "textbooks. Includes a shopping cart and order history.",
                "React, JavaScript, Node.js, SQL",
                "JavaScript, SQL",
                "Familiarity with HTML/CSS and basic web concepts.",
                "A full-stack web store with product search, shopping cart, checkout, and order history pages.",
                "E-Commerce, Web Development, Databases",
                "Beginner",
            ),
            (
                "Mental Health Chatbot for Students",
                "Dr. Sarah Lim",
                "sarah.lim@university.edu",
                "Create a friendly chatbot that answers common mental health questions "
                "and points students to counselling resources.",
                "Python, NLP, Machine Learning, APIs",
                "Python",
                "Understanding of basic machine learning and how to call REST APIs.",
                "A conversational chatbot with an intent model, a curated resource knowledge base, and a chat interface.",
                "Natural Language Processing, Healthcare, Conversational AI",
                "Advanced",
            ),
            (
                "Mobile App for Food Waste Reduction",
                "Dr. Kumar Velu",
                "kumar.velu@university.edu",
                "A mobile app that connects campus cafeterias with students to share "
                "surplus food and reduce waste.",
                "Flutter, Firebase, Mobile Development, UI Design",
                "Dart",
                "Basic mobile app concepts and experience with any object-oriented language.",
                "A cross-platform mobile app with listings, real-time notifications, and a cloud-backed database.",
                "Mobile Development, Sustainability, Cloud",
                "Intermediate",
            ),
            (
                "Student Result Analytics Dashboard",
                "Ms. Nurul Huda",
                "nurul.huda@university.edu",
                "Build a dashboard that visualises student grades and trends using "
                "charts so lecturers can spot struggling students early.",
                "Python, Data Analysis, SQL, Data Visualization",
                "Python, SQL",
                "Basic statistics and comfort working with spreadsheets or tabular data.",
                "An interactive dashboard with charts, filtering, and an at-risk student report.",
                "Data Analytics, Education Technology, Visualization",
                "Beginner",
            ),
            (
                "IoT Smart Parking System",
                "Dr. James Wong",
                "james.wong@university.edu",
                "Use sensors and a web dashboard to show available parking spots on "
                "campus in real time.",
                "IoT, Arduino, Python, Web Development",
                "C++, Python",
                "Basic electronics and familiarity with microcontrollers such as Arduino.",
                "A sensor prototype, a backend that ingests readings, and a live web dashboard of free spots.",
                "Internet of Things, Embedded Systems, Smart Campus",
                "Advanced",
            ),
            (
                "Fake News Detection System",
                "Dr. Aisha Rahman",
                "aisha.rahman@university.edu",
                "Train a machine learning model to classify news articles as real or "
                "fake, with a simple web interface to test articles.",
                "Python, Machine Learning, NLP, Data Analysis",
                "Python",
                "Understanding of supervised machine learning and text preprocessing.",
                "A trained classifier with evaluation metrics and a web interface to test new articles.",
                "Natural Language Processing, Misinformation, Machine Learning",
                "Advanced",
            ),
            (
                "University Event Management Portal",
                "Mr. Daniel Tan",
                "daniel.tan@university.edu",
                "A website where clubs can post events and students can register, "
                "with QR-code check-in on event day.",
                "React, JavaScript, SQL, Web Development",
                "JavaScript, SQL",
                "Basic web development and understanding of databases.",
                "A web portal with event creation, student registration, and QR-code based check-in.",
                "Web Development, Event Management, Databases",
                "Beginner",
            ),
        ]
        cursor.executemany(
            """INSERT INTO projects
               (title, supervisor_name, contact_email, description, required_skills, languages,
                prerequisite_knowledge, expected_deliverables, domain_keywords, difficulty)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            sample_projects,
        )
        # The sample supervisors have no account, so treat their contact address
        # as the owner: registering with that email adopts the demo project.
        cursor.execute("UPDATE projects SET owner_email = LOWER(TRIM(contact_email))")

    conn.commit()
    conn.close()
