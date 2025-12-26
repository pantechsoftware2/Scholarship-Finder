# Filename: backend/app/main.py
# No changes.

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.models import UserProfile, LeadCapture, ScholarshipResult
from app.services.gemini_service import GeminiService
from app.services.sheets_service import SheetsService
from app.services.email_service import EmailService
from app.config import settings

app = FastAPI(
    title="Scholarship Finder API",
    description="AI-powered scholarship calculator for Indian students",
    version="1.0.0"
)

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- HEALTH --------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Scholarship Finder API"
    }

# -------------------- CALCULATE --------------------
@app.post("/api/calculate-scholarships")
def calculate_scholarships(profile: UserProfile):
    """
    Calculate scholarships using Gemini + Google Search grounding
    """
    try:
        profile_dict = profile.model_dump()

        result = GeminiService.get_scholarships(profile_dict)

        # Defensive fallback (never break frontend)
        if not result or not result.scholarships:
            fallback = GeminiService._get_fallback_result()
            return {
                "success": True,
                "data": fallback.model_dump(),
                "note": "No direct matches found. Consultation recommended."
            }

        return {
            "success": True,
            "data": result.model_dump()
        }

    except Exception as e:
        print(f"[ERROR] Scholarship calculation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to calculate scholarships at this time."
        )

# -------------------- LEAD SUBMIT --------------------
@app.post("/api/submit-lead")
async def submit_lead(lead_data: dict, background_tasks: BackgroundTasks):
    """
    Save lead → Google Sheets → Send email
    """
    try:
        name = lead_data.get("name")
        email = lead_data.get("email")
        phone = lead_data.get("phone")
        user_profile = lead_data.get("user_profile")
        scholarship_results = lead_data.get("scholarship_results")

        if not all([name, email, phone, user_profile, scholarship_results]):
            raise HTTPException(
                status_code=400,
                detail="Missing required fields"
            )

        profile_obj = UserProfile(**user_profile)
        result_obj = ScholarshipResult(**scholarship_results)

        lead = LeadCapture(
            name=name,
            email=email,
            phone=phone,
            user_profile=profile_obj,
            scholarship_results=result_obj
        )

        # ✅ Save ONCE only
        await SheetsService.save_lead(lead)

        # ✅ Always send full scholarship report
        background_tasks.add_task(
            EmailService.send_scholarship_report,
            email,
            name,
            result_obj
        )

        return {
            "success": True,
            "message": "Lead submitted successfully. Check your email for the full report!",
            "email": email
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Lead submission failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to submit lead at this time."
        )

# -------------------- SEND EMAIL (OPTIONAL) --------------------
@app.post("/api/send-email")
def send_email(email_data: dict, background_tasks: BackgroundTasks):
    """
    Manually trigger email sending
    """
    try:
        recipient_email = email_data.get("email")
        recipient_name = email_data.get("name")
        scholarships_data = email_data.get("scholarships")

        if not all([recipient_email, recipient_name, scholarships_data]):
            raise HTTPException(
                status_code=400,
                detail="Missing required fields"
            )

        scholarships = ScholarshipResult(**scholarships_data)

        background_tasks.add_task(
            EmailService.send_scholarship_report,
            recipient_email,
            recipient_name,
            scholarships
        )

        return {
            "success": True,
            "message": "Email queued successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Email send failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to send email"
        )

# -------------------- RUN --------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)