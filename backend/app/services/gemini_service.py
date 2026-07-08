import json
import logging
from datetime import date
from pathlib import Path
from typing import Any, Dict

import httpx

from app.config import settings
from app.models import Scholarship, ScholarshipResult

try:
    import google.generativeai as genai
except Exception:
    genai = None


logger = logging.getLogger(__name__)
SCHOLARSHIP_DATA_PATH = Path(__file__).parent.parent / "data" / "scholarships.json"
TODAY = date.today()


class GeminiService:
    @staticmethod
    def get_scholarships(user_profile: Dict[str, Any]) -> ScholarshipResult:
        """
        Generate matching scholarships.
        Preference order:
        1. OpenAI-compatible API via API_KEY
        2. Google Gemini via GOOGLE_API_KEY
        """
        if settings.api_key:
            result = GeminiService._get_scholarships_openrouter(user_profile)
            if result is not None:
                return result
            logger.warning("OpenAI-compatible provider failed, falling back to Gemini")

        if settings.google_api_key:
            result = GeminiService._get_scholarships_gemini(user_profile)
            if result is not None:
                return result

        logger.warning("No working AI provider available, using local scholarship matcher")
        return GeminiService._get_local_fallback_result(user_profile)

    @staticmethod
    def _build_prompt(user_profile: Dict[str, Any]) -> str:
        user_profile_str = json.dumps(user_profile, indent=2)
        return f"""Analyze this Indian student profile and find 5 REAL, ACTIVE scholarships as of {TODAY.isoformat()} for the current or next active admissions cycle:

{user_profile_str}

INSTRUCTIONS:
1. Verify each scholarship is real and currently active before including it
2. Only include scholarships with deadlines on or after {TODAY.isoformat()}, or clearly marked as rolling/opening soon for the next active cycle
3. Match scholarships to the student's GPA, target countries, field of study, and experience
4. Return ONLY verifiable scholarships
5. Never return scholarships from closed or expired cycles
6. Return ONLY valid JSON with no markdown

Return ONLY this JSON format:
{{
  "summary_probability": <integer 0-100 representing likelihood of getting at least one scholarship>,
  "scholarships": [
    {{
      "name": "<real scholarship name>",
      "amount": "<funding amount>",
      "deadline": "<YYYY-MM-DD format>",
      "match_score": <0-100>,
      "one_liner_reason": "<why this student matches>",
      "strategy_tip": "<specific winning strategy for this student>"
    }}
  ]
}}"""

    @staticmethod
    def _parse_result(response_text: str) -> ScholarshipResult:
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        data = json.loads(response_text)
        scholarships_data = data.get("scholarships", [])
        if not scholarships_data:
            logger.warning("No scholarships returned from AI provider")
            return GeminiService._get_fallback_result()

        scholarships = [
            Scholarship(**scholarship)
            for scholarship in scholarships_data
            if GeminiService._is_fresh_deadline(scholarship.get("deadline"))
        ]
        if not scholarships:
            logger.warning("AI provider returned only stale or expired scholarships")
            return GeminiService._get_no_fresh_data_result()

        result = ScholarshipResult(
            summary_probability=data.get("summary_probability", 0),
            scholarships=GeminiService._sort_by_deadline(scholarships)[:5],
        )
        logger.info("Successfully found %s scholarships", len(result.scholarships))
        return result

    @staticmethod
    def _get_scholarships_openrouter(user_profile: Dict[str, Any]) -> ScholarshipResult | None:
        prompt = GeminiService._build_prompt(user_profile)
        payload: Dict[str, Any] = {
            "model": settings.openrouter_model or "tencent/hy3:free",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an elite financial aid consultant specializing in scholarships "
                        "for Indian students applying internationally. Only return real, active "
                        "scholarships and output strict JSON."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 2000,
            "reasoning": {"effort": "none"},
        }

        headers = {
            "Authorization": f"Bearer {settings.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.frontend_url,
            "X-OpenRouter-Title": "Scholarship Finder",
        }

        try:
            with httpx.Client(timeout=45, follow_redirects=True) as client:
                response = client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()

            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if isinstance(content, list):
                content = "".join(
                    part.get("text", "") for part in content if isinstance(part, dict)
                )

            logger.info("OpenAI-compatible response received")
            return GeminiService._parse_result(content)
        except json.JSONDecodeError as e:
            logger.exception("OpenAI-compatible response JSON parse error: %s", e)
            return None
        except Exception as e:
            logger.exception(
                "OpenAI-compatible API error: %s: %s",
                type(e).__name__,
                e,
            )
            return None

    @staticmethod
    def _get_scholarships_gemini(user_profile: Dict[str, Any]) -> ScholarshipResult | None:
        if genai is None:
            logger.error("google.generativeai is not available")
            return None

        prompt = GeminiService._build_prompt(user_profile)

        try:
            genai.configure(api_key=settings.google_api_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=(
                    "You are an elite financial aid consultant specializing in scholarships "
                    "for Indian students applying internationally. Only return real, active "
                    "scholarships and output strict JSON."
                ),
            )
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                    top_p=0.8,
                    max_output_tokens=2000,
                ),
            )
            response_text = response.text.strip()
            logger.info("Gemini response received")
            return GeminiService._parse_result(response_text)
        except json.JSONDecodeError as e:
            logger.exception("Gemini response JSON parse error: %s", e)
            return None
        except Exception as e:
            logger.exception("Gemini API error: %s: %s", type(e).__name__, e)
            return None

    @staticmethod
    def _get_fallback_result() -> ScholarshipResult:
        return ScholarshipResult(
            summary_probability=65,
            scholarships=[
                Scholarship(
                    name="API Configuration Required",
                    amount="Varies",
                    deadline="Contact support",
                    match_score=0,
                    one_liner_reason="The scholarship engine could not reach a configured AI provider",
                    strategy_tip="Check the backend API key and provider settings, then try again",
                )
            ],
        )

    @staticmethod
    def _get_local_fallback_result(user_profile: Dict[str, Any]) -> ScholarshipResult:
        try:
            with open(SCHOLARSHIP_DATA_PATH, "r", encoding="utf-8") as file:
                scholarships = json.load(file)
        except Exception as e:
            logger.exception("Failed to load local scholarship data: %s", e)
            return GeminiService._get_fallback_result()

        matches = []
        for item in scholarships:
            if not GeminiService._is_fresh_deadline(item.get("deadline")):
                continue

            score = GeminiService._score_local_match(item, user_profile)
            if score < 45:
                continue

            matches.append(
                Scholarship(
                    name=item["name"],
                    amount=item["amount"],
                    deadline=item["deadline"],
                    match_score=score,
                    one_liner_reason=GeminiService._build_local_reason(item, user_profile, score),
                    strategy_tip=GeminiService._build_local_strategy(item, user_profile),
                )
            )

        matches = GeminiService._sort_by_deadline(matches)
        matches.sort(key=lambda scholarship: (-scholarship.match_score, scholarship.deadline))

        if not matches:
            logger.warning("Local scholarship matcher found no fresh scholarship data")
            return GeminiService._get_no_fresh_data_result()

        top_matches = matches[:5]
        summary_probability = min(92, max(45, int(sum(item.match_score for item in top_matches) / len(top_matches))))
        logger.info("Local scholarship matcher returned %s scholarships", len(top_matches))
        return ScholarshipResult(
            summary_probability=summary_probability,
            scholarships=top_matches,
        )

    @staticmethod
    def _score_local_match(item: Dict[str, Any], user_profile: Dict[str, Any]) -> int:
        score = 0
        degree_level = str(user_profile.get("degree_level", "")).strip()
        target_countries = [str(country).strip() for country in user_profile.get("target_countries", [])]
        major = str(user_profile.get("major", "")).strip().lower()
        work_experience = int(user_profile.get("work_experience_years", 0) or 0)
        test_scores = user_profile.get("test_scores") or {}

        user_percentage = GeminiService._normalize_to_percentage(
            user_profile.get("gpa"),
            user_profile.get("gpa_scale"),
        )

        if degree_level in item.get("degreeLevels", []):
            score += 25
        else:
            score -= 20

        country = item.get("country", "")
        if country == "Anywhere" or country in target_countries:
            score += 20

        majors = [str(entry).lower() for entry in item.get("majors", [])]
        if "any" in majors:
            score += 15
        elif any(option in major or major in option for option in majors):
            score += 15

        min_percentage = item.get("minGPAPercentage", 0)
        if user_percentage >= min_percentage:
            score += 20
        else:
            shortfall = min_percentage - user_percentage
            score += max(-20, 10 - int(shortfall))

        if work_experience >= int(item.get("workExperienceRequired", 0) or 0):
            score += 5

        test_score_requirements = item.get("testScores", {})
        if not test_score_requirements:
            score += 5
        else:
            test_match_points = 0
            for exam, minimum in test_score_requirements.items():
                provided = test_scores.get(exam) or test_scores.get(exam.upper()) or test_scores.get(exam.lower())
                if provided is None:
                    continue
                try:
                    if float(provided) >= float(minimum):
                        test_match_points = max(test_match_points, 15)
                    else:
                        test_match_points = max(test_match_points, 5)
                except (TypeError, ValueError):
                    continue
            score += test_match_points

        if user_profile.get("profile_highlight"):
            score += 5

        return max(0, min(98, score))

    @staticmethod
    def _normalize_to_percentage(gpa: Any, scale: Any) -> float:
        try:
            gpa_value = float(gpa)
        except (TypeError, ValueError):
            return 0.0

        scale_value = str(scale or "").strip()
        if scale_value == "10":
            return (gpa_value / 10.0) * 100
        if scale_value == "4":
            return (gpa_value / 4.0) * 100
        return gpa_value

    @staticmethod
    def _is_fresh_deadline(deadline: Any) -> bool:
        if not deadline:
            return False

        deadline_text = str(deadline).strip()
        if deadline_text.lower() in {"rolling", "rolling deadlines", "tba", "open soon"}:
            return True

        try:
            parsed = date.fromisoformat(deadline_text)
            return parsed >= TODAY
        except ValueError:
            return False

    @staticmethod
    def _sort_by_deadline(scholarships: list[Scholarship]) -> list[Scholarship]:
        def deadline_key(scholarship: Scholarship) -> tuple[int, str]:
            if GeminiService._is_fresh_deadline(scholarship.deadline):
                return (0, scholarship.deadline)
            return (1, scholarship.deadline)

        return sorted(scholarships, key=deadline_key)

    @staticmethod
    def _build_local_reason(item: Dict[str, Any], user_profile: Dict[str, Any], score: int) -> str:
        reasons = []
        if item.get("country") in user_profile.get("target_countries", []) or item.get("country") == "Anywhere":
            reasons.append("it matches your target destination")
        if str(user_profile.get("degree_level", "")) in item.get("degreeLevels", []):
            reasons.append("your degree level is eligible")

        user_percentage = GeminiService._normalize_to_percentage(
            user_profile.get("gpa"),
            user_profile.get("gpa_scale"),
        )
        if user_percentage >= item.get("minGPAPercentage", 0):
            reasons.append("your academics clear the typical cutoff")

        if not reasons:
            reasons.append("your profile aligns with several base eligibility criteria")

        return f"This is a {score}% match because " + ", ".join(reasons) + "."

    @staticmethod
    def _build_local_strategy(item: Dict[str, Any], user_profile: Dict[str, Any]) -> str:
        strategies = []
        if item.get("essayRequired"):
            strategies.append("prepare a focused statement of purpose tied to impact and leadership")
        if user_profile.get("profile_highlight"):
            strategies.append("highlight your strongest achievement early in the application")
        if item.get("testScores"):
            strategies.append("submit your strongest standardized test evidence where accepted")
        if not strategies:
            strategies.append("apply early and tailor your application to the program's priorities")

        return "; ".join(strategies).capitalize() + "."

    @staticmethod
    def _get_no_fresh_data_result() -> ScholarshipResult:
        return ScholarshipResult(
            summary_probability=0,
            scholarships=[
                Scholarship(
                    name="Fresh live scholarship data temporarily unavailable",
                    amount="Waiting for current-cycle provider data",
                    deadline="Open soon",
                    match_score=0,
                    one_liner_reason=(
                        f"No verified scholarship in the current result set had a deadline on or after {TODAY.isoformat()}."
                    ),
                    strategy_tip=(
                        "Restore a working live AI provider or refresh the scholarship source list with current-cycle opportunities."
                    ),
                )
            ],
        )
