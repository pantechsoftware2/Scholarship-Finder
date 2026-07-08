# Filename: backend/app/models.py
# No changes.

from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserProfile(BaseModel):
    degree_level: str  # Undergrad, Masters, PhD, MBA
    current_degree: Optional[str] = None
    gpa: float
    gpa_scale: str  # "10" or "100"
    nationality: Optional[str] = None
    target_countries: List[str]
    intended_intake: Optional[str] = None
    major: str
    test_scores: Optional[dict] = None
    english_test_type: Optional[str] = None
    english_test_score: Optional[float] = None
    work_experience_years: int = 0
    profile_highlight: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "degree_level": "Masters",
                "current_degree": "B.Tech",
                "gpa": 8.5,
                "gpa_scale": "10",
                "nationality": "India",
                "target_countries": ["USA", "Canada"],
                "intended_intake": "Fall 2027",
                "major": "Computer Science",
                "test_scores": {"ielts": 7.5},
                "english_test_type": "IELTS",
                "english_test_score": 7.5,
                "work_experience_years": 2,
                "profile_highlight": "Published research paper, 2 years IT experience"
            }
        }

class Scholarship(BaseModel):
    name: str
    amount: str
    deadline: str
    match_score: int
    one_liner_reason: str
    strategy_tip: str

class ScholarshipResult(BaseModel):
    summary_probability: int
    scholarships: List[Scholarship]

class LeadCapture(BaseModel):
    name: str
    email: EmailStr
    phone: str
    user_profile: UserProfile
    scholarship_results: ScholarshipResult

class EmailRequest(BaseModel):
    recipient_email: str
    recipient_name: str
    scholarship_results: ScholarshipResult
    profile_highlight: str
