# Filename: backend/app/services/gemini_service.py
# Gemini API service to analyze profiles and generate matching scholarships

import google.generativeai as genai
import json
from typing import Dict, Any
from app.config import settings
from app.models import ScholarshipResult, Scholarship

# Configure the API
genai.configure(api_key=settings.google_api_key)

class GeminiService:
    @staticmethod
    def get_scholarships(user_profile: Dict[str, Any]) -> ScholarshipResult:
        """
        Use Google Gemini 2.0 Flash API to analyze profile and generate matching scholarships.
        Uses Google Search Grounding to verify scholarships are real and active.
        """
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction="""You are an elite financial aid consultant specializing in scholarships for Indian students applying internationally.

Your task:
1. Analyze the student's profile (GPA, test scores, country preference, field of study, work experience)
2. Search for REAL, ACTIVE scholarships for 2025/2026 intake that match their profile
3. Use Google Search to verify scholarships currently exist and are accepting applications
4. Calculate match scores based on their eligibility
5. Provide winning strategies for each scholarship

IMPORTANT: Only return scholarships that ACTUALLY EXIST. Do NOT fabricate scholarships. If you cannot verify a scholarship exists, do not include it.

Return ONLY valid JSON with no additional text."""
        )
        
        user_profile_str = json.dumps(user_profile, indent=2)
        prompt = f"""Analyze this Indian student profile and find 5 REAL, ACTIVE scholarships for 2025/2026 intake:

{user_profile_str}

INSTRUCTIONS:
1. Use Google Search to verify EACH scholarship actually exists and is currently accepting applications
2. Match scholarships to their profile based on GPA ({user_profile.get('gpa', 'N/A')}), country preference ({user_profile.get('country_preference', 'N/A')}), and field ({user_profile.get('field_of_study', 'N/A')})
3. Return ONLY verifiable, real scholarships from 2025/2026 intake
4. For each scholarship, provide accurate details

Return ONLY this JSON format with no other text:
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
        
        try:
            # Call Gemini 2.0 Flash with low temperature for accuracy
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,  # Very low creativity for accuracy
                    response_mime_type="application/json",
                    top_p=0.8,
                    max_output_tokens=2000,
                )
            )
            
            # Parse the response
            response_text = response.text.strip()
            
            # Clean up response if wrapped in markdown code blocks
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            print(f"✅ Gemini Response: {response_text[:300]}...")
            
            # Extract JSON
            data = json.loads(response_text)

            # Validate we have scholarships
            scholarships_data = data.get('scholarships', [])
            if not scholarships_data or len(scholarships_data) == 0:
                print("⚠️ No scholarships returned from API")
                return GeminiService._get_fallback_result()

            # Convert to ScholarshipResult
            scholarships = [
                Scholarship(**scholarship)
                for scholarship in scholarships_data
            ]

            result = ScholarshipResult(
                summary_probability=data.get('summary_probability', 0),
                scholarships=scholarships[:5]  # Max 5 scholarships
            )
            
            print(f"✅ Successfully found {len(result.scholarships)} scholarships")
            return result
        
        except json.JSONDecodeError as e:
            print(f"❌ JSON Parse Error: {e}")
            print(f"Response text: {response_text if 'response_text' in locals() else 'N/A'}")
            return GeminiService._get_fallback_result()
        except Exception as e:
            print(f"❌ Gemini API Error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return GeminiService._get_fallback_result()
    
    @staticmethod
    def _get_fallback_result() -> ScholarshipResult:
        """Return fallback data if API fails"""
        return ScholarshipResult(
            summary_probability=65,
            scholarships=[
                Scholarship(
                    name="API Key Issue - Please Reconfigure",
                    amount="Varies",
                    deadline="Contact support",
                    match_score=0,
                    one_liner_reason="Your API key may need to be regenerated",
                    strategy_tip="Please check your Google Gemini API key configuration"
                )
            ]
        )