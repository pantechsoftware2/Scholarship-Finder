# Filename: backend/app/services/sheets_service.py
# Google Sheets integration via Apps Script Web App

import logging
from typing import Dict, Any, List
from datetime import datetime
import os
from pathlib import Path
import json
import httpx

logger = logging.getLogger(__name__)

class SheetsService:
    """
    Manages Google Sheets integration for lead capture.
    Stores lead data via Google Apps Script web app deployment.
    """
    
    def __init__(self):
        """Initialize Google Sheets connection"""
        # Google Apps Script Web App URL (from environment variable)
        self.web_app_url = os.getenv("GOOGLE_APPS_SCRIPT_URL")
        
        if not self.web_app_url:
            logger.warning("GOOGLE_APPS_SCRIPT_URL not set in environment variables")
            logger.warning("Please add GOOGLE_APPS_SCRIPT_URL to your .env file or Vercel environment settings")
        
        self.storage_file = Path(__file__).parent.parent / "data" / "leads.json"
    
    @staticmethod
    async def save_lead(lead) -> bool:
        """
        Append lead data to Google Sheet via Apps Script.
        
        Args:
            lead: LeadCapture object containing all lead information
        
        Returns:
            bool: Success status
        """
        service = SheetsService()
        
        try:
            logger.info("Processing lead: %s", lead.email)
            
            # Check if Apps Script URL is configured
            if not service.web_app_url:
                logger.error("GOOGLE_APPS_SCRIPT_URL not configured in environment")
                logger.warning("Lead will be saved locally as fallback")
                # Save locally as fallback
                await service._save_locally({
                    "name": lead.name,
                    "email": lead.email,
                    "phone": lead.phone,
                    "timestamp": datetime.now().isoformat(),
                    "error": "GOOGLE_APPS_SCRIPT_URL not configured"
                })
                return False
            
            # Format test scores
            test_scores = lead.user_profile.test_scores or {}
            gre = test_scores.get("GRE", "") or test_scores.get("gre", "")
            gmat = test_scores.get("GMAT", "") or test_scores.get("gmat", "")
            ielts = test_scores.get("IELTS", "") or test_scores.get("ielts", "")
            
            # Format countries as array (Apps Script will join them)
            countries_array = lead.user_profile.target_countries if isinstance(lead.user_profile.target_countries, list) else [str(lead.user_profile.target_countries or "")]
            
            # Format scholarships
            scholarships = []
            if lead.scholarship_results and lead.scholarship_results.scholarships:
                for scholarship in lead.scholarship_results.scholarships:
                    scholarships.append({
                        "name": scholarship.name,
                        "amount": scholarship.amount,
                        "deadline": scholarship.deadline,
                        "match_score": scholarship.match_score,
                        "one_liner_reason": scholarship.one_liner_reason,
                        "strategy_tip": scholarship.strategy_tip
                    })
            
            # Build payload for Apps Script
            payload = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "name": lead.name,
                "email": lead.email,
                "phone": lead.phone,
                "target_degree": lead.user_profile.degree_level,
                "gpa": str(lead.user_profile.gpa or ""),
                "countries": countries_array,
                "major": lead.user_profile.major,
                "work_experience": str(int(lead.user_profile.work_experience_years) if lead.user_profile.work_experience_years else 0),
                "profile_highlight": lead.user_profile.profile_highlight or "",
                "test_scores_provided": "Yes" if test_scores else "No",
                "gre": str(gre),
                "gmat": str(gmat),
                "ielts": str(ielts),
                "ai_summary_probability": int(lead.scholarship_results.summary_probability) if lead.scholarship_results else 0,
                "scholarships": scholarships
            }
            
            logger.info("Sending payload to Apps Script for %s", lead.email)
            
            # Send to Apps Script
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                try:
                    response = await client.post(
                        service.web_app_url,
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    logger.info("Apps Script response status: %s", response.status_code)
                    logger.info("Apps Script response body: %s", response.text)
                    
                    if response.status_code == 200:
                        try:
                            result = response.json()
                            if result.get("success"):
                                logger.info("Lead successfully saved to Google Sheets: %s", lead.email)
                                # Also save locally as backup
                                await service._save_locally(payload)
                                return True
                            else:
                                logger.error("Apps Script error: %s", result.get("error", "Unknown error"))
                                # Save locally as fallback
                                await service._save_locally(payload)
                                return False
                        except json.JSONDecodeError:
                            logger.warning("Apps Script returned non-JSON response; treating as success")
                            # Save locally as fallback
                            await service._save_locally(payload)
                            return True
                    else:
                        logger.error("Apps Script HTTP error %s: %s", response.status_code, response.text)
                        # Save locally as fallback
                        await service._save_locally(payload)
                        return False
                except httpx.TimeoutException:
                    logger.error("Apps Script request timed out")
                    await service._save_locally(payload)
                    return False
                except httpx.RequestError as e:
                    logger.exception("Apps Script request error: %s", e)
                    await service._save_locally(payload)
                    return False
            
        except Exception as e:
            logger.exception("Sheets service error: %s", e)
            # Save locally as fallback
            try:
                await service._save_locally({
                    "name": lead.name,
                    "email": lead.email,
                    "phone": lead.phone,
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                })
            except:
                pass
            return False
    
    async def _save_locally(self, lead_data: Dict[str, Any]) -> bool:
        """
        Backup: Save lead to local JSON file
        """
        try:
            self.storage_file.parent.mkdir(parents=True, exist_ok=True)
            
            leads = []
            if self.storage_file.exists():
                with open(self.storage_file, 'r') as f:
                    leads = json.load(f)
            
            lead_data["local_backup_time"] = datetime.now().isoformat()
            leads.append(lead_data)
            
            with open(self.storage_file, 'w') as f:
                json.dump(leads, f, indent=2)
            
            logger.info("Lead backed up locally: %s", lead_data.get("email"))
            return True
            
        except Exception as e:
            logger.exception("Local backup error: %s", e)
            return False
