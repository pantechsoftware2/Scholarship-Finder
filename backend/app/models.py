# Filename: backend/app/models.py
# No changes.

from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserProfile(BaseModel):
    degree_level: str  # Undergrad, Masters, PhD, MBA
    gpa: float
    gpa_scale: str  # "10" or "100"
    target_countries: List[str]
    major: str
    test_scores: Optional[dict] = None
    work_experience_years: int = 0
    profile_highlight: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "degree_level": "Masters",
                "gpa": 8.5,
                "gpa_scale": "10",
                "target_countries": ["USA", "Canada"],
                "major": "Computer Science",
                "test_scores": {"gre": 320},
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