import requests, json

url = 'http://localhost:5000/api/calculate-scholarships'
profile = {
    "degree_level": "Masters",
    "gpa": "8.5",
    "gpa_scale": "10",
    "target_countries": ["USA", "Canada"],
    "major": "Computer Science",
    "test_scores": {"gre": 320},
    "work_experience_years": 2,
    "profile_highlight": "Published research paper"
}

resp = requests.post(url, json=profile)
print('STATUS:', resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print('RESPONSE TEXT:', resp.text)
