"""
Database setup for FindMyFYP.
Uses SQLite (a single file: findmyfyp.db) - no server needed.
"""

import sqlite3

DB_NAME = "findmyfyp.db"


def get_connection():
    """Open a connection to the SQLite database."""
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

    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT NOT NULL,
            supervisor_name TEXT NOT NULL,
            description     TEXT NOT NULL,
            required_skills TEXT NOT NULL,   -- comma separated, e.g. "Python, SQL"
            difficulty      TEXT NOT NULL    -- Beginner / Intermediate / Advanced
        )
    """)

    
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        sample_projects = [
            (
                "Smart Attendance System using Face Recognition",
                "Dr. Aisha Rahman",
                "Build a web application that marks student attendance automatically "
                "using face recognition through a webcam.",
                "Python, OpenCV, Machine Learning, Flask",
                "Intermediate",
            ),
            (
                "E-Commerce Website for Campus Bookstore",
                "Mr. Daniel Tan",
                "Develop an online store where students can browse, search and buy "
                "textbooks. Includes a shopping cart and order history.",
                "React, JavaScript, Node.js, SQL",
                "Beginner",
            ),
            (
                "Mental Health Chatbot for Students",
                "Dr. Sarah Lim",
                "Create a friendly chatbot that answers common mental health questions "
                "and points students to counselling resources.",
                "Python, NLP, Machine Learning, APIs",
                "Advanced",
            ),
            (
                "Mobile App for Food Waste Reduction",
                "Dr. Kumar Velu",
                "A mobile app that connects campus cafeterias with students to share "
                "surplus food and reduce waste.",
                "Flutter, Firebase, Mobile Development, UI Design",
                "Intermediate",
            ),
            (
                "Student Result Analytics Dashboard",
                "Ms. Nurul Huda",
                "Build a dashboard that visualises student grades and trends using "
                "charts so lecturers can spot struggling students early.",
                "Python, Data Analysis, SQL, Data Visualization",
                "Beginner",
            ),
            (
                "IoT Smart Parking System",
                "Dr. James Wong",
                "Use sensors and a web dashboard to show available parking spots on "
                "campus in real time.",
                "IoT, Arduino, Python, Web Development",
                "Advanced",
            ),
            (
                "Fake News Detection System",
                "Dr. Aisha Rahman",
                "Train a machine learning model to classify news articles as real or "
                "fake, with a simple web interface to test articles.",
                "Python, Machine Learning, NLP, Data Analysis",
                "Advanced",
            ),
            (
                "University Event Management Portal",
                "Mr. Daniel Tan",
                "A website where clubs can post events and students can register, "
                "with QR-code check-in on event day.",
                "React, JavaScript, SQL, Web Development",
                "Beginner",
            ),
        ]
        cursor.executemany(
            """INSERT INTO projects
               (title, supervisor_name, description, required_skills, difficulty)
               VALUES (?, ?, ?, ?, ?)""",
            sample_projects,
        )

    conn.commit()
    conn.close()
