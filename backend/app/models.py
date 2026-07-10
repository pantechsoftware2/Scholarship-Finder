from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

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
    match_score: int = Field(ge=0, le=100)
    one_liner_reason: str
    strategy_tip: str

class ScholarshipResult(BaseModel):
    summary_probability: int
    scholarships: List[Scholarship]

class LeadCapture(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    website: str = ""
    user_profile: UserProfile
    scholarship_results: ScholarshipResult

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = " ".join(str(value).strip().split())
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = str(value).strip()
        allowed_chars = set("+0123456789 -()")
        if any(char not in allowed_chars for char in cleaned):
            raise ValueError("Phone number contains invalid characters")

        digit_count = sum(char.isdigit() for char in cleaned)
        if digit_count < 7:
            raise ValueError("Phone number must contain at least 7 digits")

        return cleaned

class EmailRequest(BaseModel):
    recipient_email: str
    recipient_name: str
    scholarship_results: ScholarshipResult
    profile_highlight: str
