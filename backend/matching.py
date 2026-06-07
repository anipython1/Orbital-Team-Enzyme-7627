"""
Simple keyword-based project matching.

How it works:
1. Take everything the student typed (skills they have, skills they want
   to learn, interests) and split it into a list of lowercase keywords.
2. For each project, check how many of its required skills match the
   student's keywords  -> skill score (worth 70% of the total).
3. Also check how many of the student's keywords appear in the project
   description -> interest score (worth 30% of the total).
4. Combine both into a percentage from 0 to 100.
"""


def text_to_keywords(text):
    """Turn 'Python, Machine Learning' into ['python', 'machine learning']."""
    return [word.strip().lower() for word in text.split(",") if word.strip()]


def calculate_match(student_keywords, project):
    """Return a match score (0-100) between a student and one project."""
    required_skills = text_to_keywords(project["required_skills"])
    description = project["description"].lower()

    
    matched_skills = 0
    for skill in required_skills:
        for keyword in student_keywords:
            
            if keyword in skill or skill in keyword:
                matched_skills += 1
                break  

    skill_score = matched_skills / len(required_skills) if required_skills else 0

   
    keywords_in_description = sum(1 for kw in student_keywords if kw in description)
    interest_score = min(keywords_in_description / 3, 1.0)  

    
    return round((0.7 * skill_score + 0.3 * interest_score) * 100)
