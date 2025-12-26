# API Documentation - Scholarship Finder Backend

## Base URL
`http://localhost:5000`

## Health Check

### GET `/health`
Verify the API is running

**Response:**
```json
{
  "status": "healthy",
  "service": "Scholarship Finder API"
}
```

---

## Scholarship Calculation

### POST `/api/calculate-scholarships`
Calculate scholarships based on user profile using Google Gemini API with search grounding.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "degree_level": "Masters",
  "gpa": 8.5,
  "gpa_scale": "10",
  "target_countries": ["USA", "Canada"],
  "major": "Computer Science",
  "test_scores": {
    "gre": 320,
    "gmat": null,
    "ielts": 7.5
  },
  "work_experience_years": 2,
  "profile_highlight": "Published research paper on AI, 2 years IT experience"
}
```

**Query Parameters:** None

**Path Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary_probability": 78,
    "scholarships": [
      {
        "name": "Fulbright Scholarship",
        "amount": "$50,000",
        "deadline": "2025-06-30",
        "match_score": 95,
        "one_liner_reason": "Your GPA and research background are excellent matches for this program",
        "strategy_tip": "Highlight your published research and international collaboration experience in the diversity essay"
      },
      {
        "name": "Chevening Scholarship",
        "amount": "$40,000",
        "deadline": "2025-07-15",
        "match_score": 88,
        "one_liner_reason": "UK institutions value your technical skills and leadership",
        "strategy_tip": "Emphasize your work experience and how UK education will advance your career goals"
      },
      {
        "name": "DAAD Scholarship",
        "amount": "$45,000",
        "deadline": "2025-08-01",
        "match_score": 82,
        "one_liner_reason": "Germany values your CS background and work experience",
        "strategy_tip": "Focus on your contribution to technology and innovation in your essay"
      },
      {
        "name": "Vanier Canada Graduate Scholarship",
        "amount": "$60,000",
        "deadline": "2025-09-15",
        "match_score": 91,
        "one_liner_reason": "Canadian universities seek researchers with your profile",
        "strategy_tip": "Detail your research interests and how they align with Canadian institutions' priorities"
      },
      {
        "name": "Gates Cambridge Scholarship",
        "amount": "$55,000",
        "deadline": "2025-05-30",
        "match_score": 87,
        "one_liner_reason": "Your academic profile and work experience fit Cambridge standards",
        "strategy_tip": "Articulate your long-term vision for social impact and how Cambridge will enable it"
      }
    ]
  }
}
```

**Error Response (500):**
```json
{
  "detail": "Error calculating scholarships. Please try again."
}
```

**Important Notes:**
- The API uses Google Gemini 2.0 Flash model with search grounding enabled
- Temperature is set to 0.3 for high accuracy (low creativity)
- Response time typically 4-7 seconds
- Results are verified against Google Search to prevent hallucination
- Maximum 5 scholarships returned per request

---

## Lead Submission

### POST `/api/submit-lead`
Submit lead information and trigger email delivery

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 9876543210",
  "user_profile": {
    "degree_level": "Masters",
    "gpa": 8.5,
    "gpa_scale": "10",
    "target_countries": ["USA", "Canada"],
    "major": "Computer Science",
    "test_scores": {
      "gre": 320
    },
    "work_experience_years": 2,
    "profile_highlight": "Published research paper"
  },
  "scholarship_results": {
    "summary_probability": 78,
    "scholarships": [
      {
        "name": "Fulbright Scholarship",
        "amount": "$50,000",
        "deadline": "2025-06-30",
        "match_score": 95,
        "one_liner_reason": "Your profile matches well",
        "strategy_tip": "Highlight your research"
      }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead submitted successfully. Check your email for the full report!",
  "email": "john.doe@example.com"
}
```

**Error Response (400):**
```json
{
  "detail": "Missing required fields"
}
```

**Error Response (500):**
```json
{
  "detail": "Error submitting lead. Please try again."
}
```

**Important Notes:**
- Lead data is saved to Google Sheets asynchronously
- Email is sent in the background (doesn't block response)
- Email should arrive within 2 minutes
- Phone should be WhatsApp number for better engagement
- Check spam folder if email doesn't arrive in inbox

---

## Email Delivery

### POST `/api/send-email`
Manually trigger scholarship report email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "recipient@example.com",
  "name": "John Doe",
  "scholarships": {
    "summary_probability": 78,
    "scholarships": [
      {
        "name": "Fulbright Scholarship",
        "amount": "$50,000",
        "deadline": "2025-06-30",
        "match_score": 95,
        "one_liner_reason": "Your profile matches well",
        "strategy_tip": "Highlight your research"
      }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email queued for sending"
}
```

**Error Response (400):**
```json
{
  "detail": "Missing required fields"
}
```

**Error Response (500):**
```json
{
  "detail": "Error sending email"
}
```

---

## Data Models

### UserProfile
```python
{
  "degree_level": str,          # "Undergrad", "Masters", "PhD", "MBA"
  "gpa": float,                 # 0-10 or 0-100 based on scale
  "gpa_scale": str,             # "10" or "100"
  "target_countries": List[str], # ["USA", "UK", "Canada", etc.]
  "major": str,                 # "Computer Science", etc.
  "test_scores": Optional[dict], # {"gre": 320, "gmat": 720, "ielts": 7.5}
  "work_experience_years": int,  # 0, 1, 2, etc.
  "profile_highlight": str      # Max 140 characters
}
```

### Scholarship
```python
{
  "name": str,
  "amount": str,                # "$50,000" or "£40,000" etc.
  "deadline": str,              # "2025-06-30" or "30 Jun 2025"
  "match_score": int,           # 0-100
  "one_liner_reason": str,      # Why this scholarship matches
  "strategy_tip": str           # How to win this scholarship
}
```

### ScholarshipResult
```python
{
  "summary_probability": int,    # 0-100, overall success estimate
  "scholarships": List[Scholarship]
}
```

---

## CORS Configuration

The API is configured for the following origins:
- `http://localhost:3000` (Local frontend)
- `http://localhost:3001` (Alternate frontend port)
- Configured frontend URL from environment

All methods are allowed: GET, POST, PUT, DELETE, OPTIONS

---

## Error Handling

### Common Error Codes

**400 Bad Request**
- Missing required fields
- Invalid data format
- Validation failed

**500 Internal Server Error**
- API connection failed
- Email service error
- Database/Sheets error
- Gemini API error

**Example Error Response:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Currently no rate limiting is applied. For production deployment, consider:
- Max 100 requests per minute per IP
- Max 50 scholarship calculations per minute
- Max 1000 leads per day

---

## Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Calculate Scholarships:**
```bash
curl -X POST http://localhost:5000/api/calculate-scholarships \
  -H "Content-Type: application/json" \
  -d '{
    "degree_level": "Masters",
    "gpa": 8.5,
    "gpa_scale": "10",
    "target_countries": ["USA"],
    "major": "Computer Science",
    "test_scores": null,
    "work_experience_years": 0,
    "profile_highlight": "Test"
  }'
```

### Using Swagger UI
Visit: `http://localhost:5000/docs`

Interactive API documentation with try-it-out functionality.

### Using ReDoc
Visit: `http://localhost:5000/redoc`

Detailed API documentation view.

---

## Authentication

Currently no authentication is required. For production, implement:
- API key authentication
- JWT tokens
- OAuth 2.0
- Rate limiting per user

---

## Deployment

### Environment Variables Required
```
GOOGLE_API_KEY=your_key
GOOGLE_SHEETS_ID=your_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email
GOOGLE_PRIVATE_KEY=your_key
GOOGLE_APPS_SCRIPT_URL=your_url
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
PORT=5000
NODE_ENV=production
FRONTEND_URL=your_frontend_url
```

### Production Checklist
- [ ] Enable HTTPS
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure CORS properly
- [ ] Use production-grade WSGI server (Gunicorn)
- [ ] Set up error tracking (Sentry)
- [ ] Enable CORS properly for production domains

---

## Support

For API issues or questions, check:
1. QUICKSTART.md for setup issues
2. Troubleshooting section in README.md
3. Console logs for error details
4. Backend logs: `tail -f logs/backend.log`

---

**Last Updated:** December 26, 2025
