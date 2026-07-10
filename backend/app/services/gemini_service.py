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
        normalized_profile = GeminiService._normalize_user_profile(user_profile)
        user_profile_str = json.dumps(normalized_profile, indent=2)
        nationality = normalized_profile.get("nationality") or "the student's"
        target_countries = ", ".join(normalized_profile.get("target_countries", [])) or "the stated target countries"
        english_test = normalized_profile.get("english_test_summary") or "Not taken yet"
        intake = normalized_profile.get("intended_intake") or "current / next available intake"

        return f"""Analyze this student profile and find 5 REAL, ACTIVE scholarships as of {TODAY.isoformat()} for the current or next active admissions cycle.

PROFILE TO MATCH:
- Nationality / citizenship: {nationality}
- Target countries: {target_countries}
- Degree level sought: {normalized_profile.get("degree_level")}
- Current / last degree: {normalized_profile.get("current_degree") or "Not specified"}
- Major / field: {normalized_profile.get("major")}
- GPA: {normalized_profile.get("gpa")} on {normalized_profile.get("gpa_scale")} scale ({normalized_profile.get("gpa_percentage")} percent equivalent)
- Intended intake: {intake}
- English test status: {english_test}
- Work experience: {normalized_profile.get("work_experience_years", 0)} years
- Extra context: {normalized_profile.get("profile_highlight") or "None provided"}

RAW PROFILE JSON:

{user_profile_str}

INSTRUCTIONS:
1. Verify each scholarship is real and currently active before including it
2. Only include scholarships with deadlines on or after {TODAY.isoformat()}, or clearly marked as rolling/opening soon for the next active cycle
3. Match scholarships to the student's nationality, target countries, degree level, current degree background, field of study, GPA, English-test status, intended intake, and work experience
4. Exclude scholarships that clearly do not fit the target countries, degree level, field, or applicant nationality rules
5. If a scholarship is country-specific or nationality-specific, only include it when this profile actually qualifies
6. Prefer scholarships whose deadlines and cycle timing make sense for {intake}
7. If the student has not taken an English test, avoid scholarships that require an already-submitted IELTS/TOEFL/PTE/Duolingo score unless the score can clearly be submitted later
8. Return ONLY verifiable scholarships
9. Never return scholarships from closed or expired cycles
10. Return ONLY valid JSON with no markdown

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

        scholarships.sort(key=lambda scholarship: (-scholarship.match_score, scholarship.deadline))

        result = ScholarshipResult(
            summary_probability=data.get("summary_probability", 0),
            scholarships=scholarships[:5],
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
                        "for international students applying globally. Only return real, active "
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
                    "for international students applying globally. Only return real, active "
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
        normalized_profile = GeminiService._normalize_user_profile(user_profile)
        degree_level = str(normalized_profile.get("degree_level", "")).strip()
        target_countries = [str(country).strip() for country in normalized_profile.get("target_countries", [])]
        major = str(user_profile.get("major", "")).strip().lower()
        work_experience = int(normalized_profile.get("work_experience_years", 0) or 0)
        test_scores = normalized_profile.get("test_scores") or {}
        user_percentage = normalized_profile.get("gpa_percentage", 0)
        scholarship_degree_levels = [
            GeminiService._normalize_degree_level(level)
            for level in item.get("degreeLevels", [])
        ]

        if degree_level in scholarship_degree_levels:
            score += 25
        else:
            score -= 20

        country = item.get("country", "")
        if country == "Anywhere" or country in target_countries:
            score += 20
        elif target_countries:
            score -= 15

        majors = [str(entry).lower() for entry in item.get("majors", [])]
        if "any" in majors:
            score += 15
        else:
            score += GeminiService._score_major_match(major, majors)

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
            if not test_match_points and normalized_profile.get("english_test_type"):
                test_match_points = 2
            score += test_match_points

        intake_bonus = GeminiService._score_intake_fit(item, normalized_profile.get("intended_intake"))
        score += intake_bonus

        if normalized_profile.get("profile_highlight"):
            score += 5

        return max(0, min(98, score))

    @staticmethod
    def _normalize_user_profile(user_profile: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(user_profile)
        normalized["degree_level"] = GeminiService._normalize_degree_level(
            normalized.get("degree_level", "")
        )
        normalized["gpa_percentage"] = GeminiService._normalize_to_percentage(
            normalized.get("gpa"),
            normalized.get("gpa_scale"),
        )

        test_scores = dict(normalized.get("test_scores") or {})
        english_test_type = normalized.get("english_test_type")
        english_test_score = normalized.get("english_test_score")
        if english_test_type and english_test_score is not None:
            test_scores[str(english_test_type).lower()] = english_test_score
        normalized["test_scores"] = test_scores

        if english_test_type and english_test_score is not None:
            normalized["english_test_summary"] = f"{english_test_type} {english_test_score}"
        elif english_test_type:
            normalized["english_test_summary"] = str(english_test_type)
        elif test_scores:
            normalized["english_test_summary"] = ", ".join(
                f"{str(exam).upper()} {score}" for exam, score in test_scores.items()
            )
        else:
            normalized["english_test_summary"] = None

        return normalized

    @staticmethod
    def _normalize_degree_level(value: Any) -> str:
        text = str(value or "").strip().lower()
        mapping = {
            "undergrad": "Bachelor's",
            "undergraduate": "Bachelor's",
            "bachelor": "Bachelor's",
            "bachelor's": "Bachelor's",
            "masters": "Master's",
            "master": "Master's",
            "master's": "Master's",
            "phd": "PhD",
            "doctorate": "PhD",
            "doctoral": "PhD",
        }
        return mapping.get(text, str(value or "").strip())

    @staticmethod
    def _score_major_match(user_major: str, scholarship_majors: list[str]) -> int:
        if not user_major or not scholarship_majors:
            return 0

        normalized_user_major = user_major.lower()
        major_aliases = {
            "computer science": ["computer science", "software", "technology", "data science", "artificial intelligence", "cybersecurity"],
            "business administration": ["business", "management", "finance", "economics"],
            "management": ["business", "management", "finance", "economics"],
            "medicine": ["medicine", "medical science", "biotechnology"],
            "medical science": ["medicine", "medical science", "biotechnology"],
            "mechanical engineering": ["mechanical engineering", "engineering", "technology"],
            "electrical engineering": ["electrical engineering", "engineering", "technology"],
            "civil engineering": ["civil engineering", "engineering", "technology"],
            "law": ["law"],
        }

        expanded_terms = {normalized_user_major}
        for canonical, aliases in major_aliases.items():
            if canonical in normalized_user_major or normalized_user_major in aliases:
                expanded_terms.update(aliases)
                expanded_terms.add(canonical)

        if any(term in scholarship_major or scholarship_major in term for term in expanded_terms for scholarship_major in scholarship_majors):
            return 15

        if any("engineering" in scholarship_major for scholarship_major in scholarship_majors) and "engineering" in normalized_user_major:
            return 12
        if any("science" in scholarship_major for scholarship_major in scholarship_majors) and "science" in normalized_user_major:
            return 10

        return 0

    @staticmethod
    def _score_intake_fit(item: Dict[str, Any], intended_intake: Any) -> int:
        if not intended_intake:
            return 0

        intake_text = str(intended_intake).strip().lower()
        deadline = item.get("deadline")
        if not deadline:
            return 0

        if str(deadline).strip().lower() in {"rolling", "rolling deadlines", "tba", "open soon"}:
            return 6

        try:
            deadline_date = date.fromisoformat(str(deadline))
        except ValueError:
            return 0

        if "fall" in intake_text and deadline_date.month <= 12:
            return 6
        if "spring" in intake_text and deadline_date.month <= 10:
            return 4
        if "any" in intake_text:
            return 3
        return 0

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
        normalized_profile = GeminiService._normalize_user_profile(user_profile)
        reasons = []
        if item.get("country") in normalized_profile.get("target_countries", []) or item.get("country") == "Anywhere":
            reasons.append("it matches your target destination")
        if normalized_profile.get("degree_level") in [
            GeminiService._normalize_degree_level(level)
            for level in item.get("degreeLevels", [])
        ]:
            reasons.append("your degree level is eligible")

        user_percentage = normalized_profile.get("gpa_percentage", 0)
        if user_percentage >= item.get("minGPAPercentage", 0):
            reasons.append("your academics clear the typical cutoff")
        if normalized_profile.get("major") and any(
            str(option).lower() in str(normalized_profile.get("major", "")).lower()
            or str(normalized_profile.get("major", "")).lower() in str(option).lower()
            for option in item.get("majors", [])
        ):
            reasons.append("your major is closely aligned")
        if normalized_profile.get("english_test_type") and item.get("testScores"):
            reasons.append("your English-test profile supports eligibility")

        if not reasons:
            reasons.append("your profile aligns with several base eligibility criteria")

        return f"This is a {score}% match because " + ", ".join(reasons) + "."

    @staticmethod
    def _build_local_strategy(item: Dict[str, Any], user_profile: Dict[str, Any]) -> str:
        normalized_profile = GeminiService._normalize_user_profile(user_profile)
        strategies = []
        if item.get("essayRequired"):
            strategies.append("prepare a focused statement of purpose tied to impact and leadership")
        if normalized_profile.get("profile_highlight"):
            strategies.append("highlight your strongest achievement early in the application")
        if item.get("testScores"):
            if normalized_profile.get("english_test_type"):
                strategies.append("submit your English test score prominently anywhere the application allows supporting evidence")
            else:
                strategies.append("shortlist scholarships where English scores can be submitted later or are waived, then plan the test early")
        if normalized_profile.get("intended_intake"):
            strategies.append(f"prioritize applications that fit your {normalized_profile.get('intended_intake')} intake plan")
        if normalized_profile.get("current_degree"):
            strategies.append(f"use your {normalized_profile.get('current_degree')} background to explain academic readiness")
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
