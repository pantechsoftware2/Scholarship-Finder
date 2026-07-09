# Filename: backend/app/main.py
# No changes.

import logging

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.models import UserProfile, LeadCapture, ScholarshipResult
from app.services.gemini_service import GeminiService
from app.services.sheets_service import SheetsService
from app.services.email_service import EmailService
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

allowed_origins = list(
    dict.fromkeys(
        [
            settings.frontend_url,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://scholarship-finder-frontend.vercel.app",
        ]
    )
)

app = FastAPI(
    title="Scholarship Finder API",
    description="AI-powered scholarship calculator for Indian students",
    version="1.0.0"
)

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
        logger.exception("Scholarship calculation failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to calculate scholarships at this time."
        )

# -------------------- LEAD SUBMIT --------------------
@app.post("/api/submit-lead")
async def submit_lead(lead: LeadCapture, background_tasks: BackgroundTasks):
    """
    Save lead → Google Sheets → Send email
    """
    try:
        logger.info("Lead received for %s", lead.email)
        
        # Save to Google Sheets
        logger.info("Saving lead to Google Sheets")
        sheets_result = await SheetsService.save_lead(lead)
        logger.info("Google Sheets save result: %s", sheets_result)

        # Queue email notification
        logger.info("Queueing email to %s", lead.email)
        background_tasks.add_task(
            EmailService.send_scholarship_report,
            lead.email,
            lead.name,
            lead.scholarship_results
        )

        return {
            "success": True,
            "message": "Lead submitted successfully. Check your email for the full report!",
            "email": lead.email,
            "sheets_saved": sheets_result
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Lead submission failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Unable to submit lead: {str(e)}"
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
        logger.exception("Email send failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to send email"
        )

# -------------------- RUN --------------------
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=settings.port)
