# Filename: backend/app/main.py
# No changes.

import asyncio
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import UserProfile, LeadCapture, ScholarshipResult, EmailRequest
from app.services.gemini_service import GeminiService
from app.services.sheets_service import SheetsService
from app.services.email_service import EmailService
from app.services.rate_limiter import rate_limiter
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


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_rate_limit(request: Request, scope: str, limit: int, window_seconds: int, key_suffix: str = "") -> None:
    client_ip = _get_client_ip(request)
    composed_key = f"{scope}:{client_ip}:{key_suffix}".rstrip(":")
    retry_after = rate_limiter.check(composed_key, limit, window_seconds)
    if retry_after:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
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
def calculate_scholarships(profile: UserProfile, request: Request):
    """
    Calculate scholarships using Gemini + Google Search grounding
    """
    try:
        _enforce_rate_limit(request, "calculate", limit=20, window_seconds=60)
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
async def submit_lead(lead: LeadCapture, request: Request):
    """
    Save lead → Google Sheets → Send email
    """
    try:
        _enforce_rate_limit(request, "submit-lead-ip", limit=5, window_seconds=900)
        _enforce_rate_limit(request, "submit-lead-email", limit=3, window_seconds=1800, key_suffix=lead.email.lower())

        if lead.website.strip():
            raise HTTPException(status_code=400, detail="Unable to process submission.")

        logger.info("Lead received for %s", lead.email)
        
        # Save to Google Sheets
        logger.info("Saving lead to Google Sheets")
        sheets_result = await SheetsService.save_lead(lead)
        logger.info("Google Sheets save result: %s", sheets_result)
        if not sheets_result:
            raise HTTPException(
                status_code=503,
                detail="We could not save your details securely right now. Please try again in a few minutes.",
            )

        logger.info("Sending report email to %s", lead.email)
        email_sent = await asyncio.to_thread(
            EmailService.send_scholarship_report,
            lead.email,
            lead.name,
            lead.scholarship_results,
        )

        if not email_sent:
            return JSONResponse(
                status_code=202,
                content={
                    "success": True,
                    "message": (
                        "Your details were saved, but we could not send the report email right now. "
                        "Please try again shortly or contact support if the issue continues."
                    ),
                    "email": lead.email,
                    "email_sent": False,
                    "lead_saved": True,
                },
            )

        return {
            "success": True,
            "message": "Lead submitted successfully. Check your email for the full report!",
            "email": lead.email,
            "sheets_saved": sheets_result,
            "email_sent": True,
            "lead_saved": True,
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
async def send_email(email_data: EmailRequest, request: Request):
    """
    Manually trigger email sending
    """
    try:
        _enforce_rate_limit(request, "send-email-ip", limit=3, window_seconds=900)
        _enforce_rate_limit(
            request,
            "send-email-recipient",
            limit=2,
            window_seconds=1800,
            key_suffix=email_data.recipient_email.lower(),
        )

        email_sent = await asyncio.to_thread(
            EmailService.send_scholarship_report,
            email_data.recipient_email,
            email_data.recipient_name,
            email_data.scholarship_results,
        )

        if not email_sent:
            raise HTTPException(
                status_code=502,
                detail="Unable to send email right now. Please try again shortly.",
            )

        return {
            "success": True,
            "message": "Email sent successfully"
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
