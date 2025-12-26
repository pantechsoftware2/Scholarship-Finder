#!/usr/bin/env python
"""Test Apps Script connection"""

import httpx
import asyncio
import json
from datetime import datetime

async def test_apps_script():
    url = "https://script.google.com/macros/s/AKfycbwf6kDzsLDZu8oqBih_QAPuNm1McG4O0P0LBb5k2Mvmf5gtUDa8RwgAOQ7XEQogrTLS/exec"
    
    test_payload = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+1234567890",
        "target_degree": "Masters",
        "gpa": "3.8",
        "countries": ["India", "USA"],
        "major": "Computer Science",
        "work_experience": "2",
        "test_scores_provided": "No"
    }
    
    try:
        print("📤 Sending test payload to Apps Script...")
        print(json.dumps(test_payload, indent=2))
        
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.post(
                url,
                json=test_payload,
                headers={"Content-Type": "application/json"}
            )
            print(f"\n📥 Status Code: {response.status_code}")
            print(f"📥 Response:\n{response.text}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print(f"✅ JSON Response: {json.dumps(result, indent=2)}")
                except:
                    print("⚠️ Response is not JSON")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_apps_script())
