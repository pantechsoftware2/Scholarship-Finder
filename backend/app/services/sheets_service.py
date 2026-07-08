import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

import httpx
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from app.config import settings

logger = logging.getLogger(__name__)


class SheetsService:
    """
    Production-oriented lead persistence with three layers:
    1. Direct Google Sheets API append via service account
    2. Existing Apps Script webhook fallback
    3. Local JSON backup fallback
    """

    SHEET_RANGE = "Sheet1!A:AC"
    SHEETS_SCOPE = ["https://www.googleapis.com/auth/spreadsheets"]

    def __init__(self):
        self.storage_file = Path(__file__).parent.parent / "data" / "leads.json"
        self.web_app_url = settings.google_apps_script_url
        self.sheet_id = settings.google_sheets_id
        self.service_account_email = settings.google_service_account_email
        self.private_key = settings.google_private_key

    @staticmethod
    async def save_lead(lead) -> bool:
        service = SheetsService()
        payload = service._build_payload(lead)

        try:
            logger.info("Processing lead for %s", lead.email)

            saved_to_sheets = await service._append_to_google_sheets(payload)
            if saved_to_sheets:
                await service._save_locally(payload)
                return True

            saved_via_apps_script = await service._append_via_apps_script(payload)
            if saved_via_apps_script:
                await service._save_locally(payload)
                return True

            logger.warning("Google Sheets write failed; saving lead locally only")
            await service._save_locally(payload)
            return False
        except Exception as e:
            logger.exception("Sheets service error: %s", e)
            try:
                await service._save_locally(payload)
            except Exception:
                logger.exception("Failed to save local backup after Sheets error")
            return False

    def _build_payload(self, lead) -> Dict[str, Any]:
        test_scores = lead.user_profile.test_scores or {}
        countries = (
            lead.user_profile.target_countries
            if isinstance(lead.user_profile.target_countries, list)
            else [str(lead.user_profile.target_countries or "")]
        )

        scholarships = []
        if lead.scholarship_results and lead.scholarship_results.scholarships:
            scholarships = [
                {
                    "name": scholarship.name,
                    "amount": scholarship.amount,
                    "deadline": scholarship.deadline,
                    "match_score": scholarship.match_score,
                    "one_liner_reason": scholarship.one_liner_reason,
                    "strategy_tip": scholarship.strategy_tip,
                }
                for scholarship in lead.scholarship_results.scholarships
            ]

        test_score_parts = [
            f"GRE: {test_scores.get('GRE', '') or test_scores.get('gre', '')}" if (test_scores.get("GRE", "") or test_scores.get("gre", "")) else "",
            f"GMAT: {test_scores.get('GMAT', '') or test_scores.get('gmat', '')}" if (test_scores.get("GMAT", "") or test_scores.get("gmat", "")) else "",
            f"IELTS: {test_scores.get('IELTS', '') or test_scores.get('ielts', '')}" if (test_scores.get("IELTS", "") or test_scores.get("ielts", "")) else "",
        ]
        compact_test_scores = ", ".join(part for part in test_score_parts if part)
        compact_test_scores = ", ".join(
            part
            for part in [
                compact_test_scores,
                f"TOEFL: {test_scores.get('TOEFL', '') or test_scores.get('toefl', '')}"
                if (test_scores.get("TOEFL", "") or test_scores.get("toefl", ""))
                else "",
                f"PTE: {test_scores.get('PTE', '') or test_scores.get('pte', '')}"
                if (test_scores.get("PTE", "") or test_scores.get("pte", ""))
                else "",
                f"DUOLINGO: {test_scores.get('DUOLINGO', '') or test_scores.get('duolingo', '')}"
                if (test_scores.get("DUOLINGO", "") or test_scores.get("duolingo", ""))
                else "",
            ]
            if part
        )
        top_scholarship = scholarships[0] if scholarships else {}
        scholarship_summary = " | ".join(
            f"{entry['name']} ({entry['deadline']})"
            for entry in scholarships[:5]
        )

        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "target_degree": lead.user_profile.degree_level,
            "current_degree": lead.user_profile.current_degree or "",
            "gpa": str(lead.user_profile.gpa or ""),
            "nationality": lead.user_profile.nationality or "",
            "countries": countries,
            "intended_intake": lead.user_profile.intended_intake or "",
            "major": lead.user_profile.major,
            "work_experience": str(
                int(lead.user_profile.work_experience_years)
                if lead.user_profile.work_experience_years
                else 0
            ),
            "profile_highlight": lead.user_profile.profile_highlight or "",
            "test_scores_provided": "Yes" if test_scores else "No",
            "english_test_taken": "Yes" if test_scores else "No",
            "gre": str(test_scores.get("GRE", "") or test_scores.get("gre", "")),
            "gmat": str(test_scores.get("GMAT", "") or test_scores.get("gmat", "")),
            "ielts": str(test_scores.get("IELTS", "") or test_scores.get("ielts", "")),
            "toefl": str(test_scores.get("TOEFL", "") or test_scores.get("toefl", "")),
            "pte": str(test_scores.get("PTE", "") or test_scores.get("pte", "")),
            "duolingo": str(test_scores.get("DUOLINGO", "") or test_scores.get("duolingo", "")),
            "test_scores": compact_test_scores,
            "ai_summary_probability": int(lead.scholarship_results.summary_probability)
            if lead.scholarship_results
            else 0,
            "scholarships_count": len(scholarships),
            "top_scholarship_name": top_scholarship.get("name", ""),
            "top_scholarship_amount": top_scholarship.get("amount", ""),
            "top_scholarship_deadline": top_scholarship.get("deadline", ""),
            "top_scholarship_match_score": top_scholarship.get("match_score", ""),
            "top_scholarship_reason": top_scholarship.get("one_liner_reason", ""),
            "top_scholarship_strategy_tip": top_scholarship.get("strategy_tip", ""),
            "top_scholarships_summary": scholarship_summary,
            "scholarships": scholarships,
        }

    async def _append_to_google_sheets(self, payload: Dict[str, Any]) -> bool:
        if not self.sheet_id or not self.service_account_email or not self.private_key:
            logger.warning(
                "Direct Sheets API not configured. Missing one of GOOGLE_SHEETS_ID, "
                "GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_PRIVATE_KEY"
            )
            return False

        row = self._build_sheet_row(payload)

        try:
            await asyncio.to_thread(self._append_row_sync, row)
            logger.info("Lead successfully appended to Google Sheets via service account")
            return True
        except Exception as e:
            logger.exception("Direct Google Sheets API append failed: %s", e)
            return False

    def _append_row_sync(self, row: list[str]) -> None:
        credentials_info = {
            "type": "service_account",
            "client_email": self.service_account_email,
            "private_key": self.private_key.replace("\\n", "\n"),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        credentials = Credentials.from_service_account_info(
            credentials_info,
            scopes=self.SHEETS_SCOPE,
        )
        sheets_service = build("sheets", "v4", credentials=credentials, cache_discovery=False)
        request_body = {"values": [row]}

        sheets_service.spreadsheets().values().append(
            spreadsheetId=self.sheet_id,
            range=self.SHEET_RANGE,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=request_body,
        ).execute()

    def _build_sheet_row(self, payload: Dict[str, Any]) -> list[str]:
        return [
            payload.get("timestamp", ""),
            payload.get("name", ""),
            payload.get("email", ""),
            payload.get("phone", ""),
            payload.get("target_degree", ""),
            payload.get("gpa", ""),
            ", ".join(payload.get("countries", [])),
            payload.get("major", ""),
            payload.get("work_experience", ""),
            payload.get("test_scores", ""),
            str(payload.get("ai_summary_probability", "")),
            str(payload.get("scholarships_count", "")),
            payload.get("top_scholarship_name", ""),
            payload.get("top_scholarship_amount", ""),
            payload.get("top_scholarship_deadline", ""),
            str(payload.get("top_scholarship_match_score", "")),
            payload.get("top_scholarship_reason", ""),
            payload.get("top_scholarship_strategy_tip", ""),
            payload.get("top_scholarships_summary", ""),
            payload.get("profile_highlight", ""),
            json.dumps(payload.get("scholarships", []), ensure_ascii=False),
            payload.get("current_degree", ""),
            payload.get("nationality", ""),
            payload.get("intended_intake", ""),
            payload.get("english_test_taken", ""),
            payload.get("ielts", ""),
            payload.get("toefl", ""),
            payload.get("pte", ""),
            payload.get("duolingo", ""),
        ]

    async def _append_via_apps_script(self, payload: Dict[str, Any]) -> bool:
        if not self.web_app_url:
            logger.warning("GOOGLE_APPS_SCRIPT_URL not configured; skipping Apps Script fallback")
            return False

        logger.info("Falling back to Apps Script for Google Sheets write")
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            try:
                response = await client.post(
                    self.web_app_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                logger.info("Apps Script response status: %s", response.status_code)

                if response.status_code != 200:
                    logger.error("Apps Script HTTP error %s: %s", response.status_code, response.text)
                    return False

                try:
                    result = response.json()
                    success = bool(result.get("success"))
                    if not success:
                        logger.error("Apps Script reported failure: %s", result)
                    return success
                except json.JSONDecodeError:
                    logger.warning("Apps Script returned non-JSON response; treating as success")
                    return True
            except httpx.TimeoutException:
                logger.error("Apps Script request timed out")
                return False
            except httpx.RequestError as e:
                logger.exception("Apps Script request error: %s", e)
                return False

    async def _save_locally(self, lead_data: Dict[str, Any]) -> bool:
        try:
            self.storage_file.parent.mkdir(parents=True, exist_ok=True)

            leads = []
            if self.storage_file.exists():
                with open(self.storage_file, "r", encoding="utf-8") as file:
                    leads = json.load(file)

            lead_data["local_backup_time"] = datetime.now().isoformat()
            leads.append(lead_data)

            with open(self.storage_file, "w", encoding="utf-8") as file:
                json.dump(leads, file, indent=2, ensure_ascii=False)

            logger.info("Lead backed up locally: %s", lead_data.get("email"))
            return True
        except Exception as e:
            logger.exception("Local backup error: %s", e)
            return False
