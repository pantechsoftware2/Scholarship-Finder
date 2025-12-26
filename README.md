# Scholarship Finder - Full Stack Application

A modern, AI-powered scholarship calculator for Indian students. The application uses Google Gemini API with search grounding to find real, active scholarships and provides personalized success probability and strategy tips.

## Features

🎓 **AI-Powered Scholarship Matching**
- Uses Google Gemini 2.0 Flash with search grounding
- Real-time scholarship verification
- Success probability calculation
- Personalized strategy tips

💼 **Lead Magnet Architecture**
- First scholarship shown for free
- Remaining results blurred until lead capture
- Instant email delivery of full report
- Direct integration with Google Sheets for lead management

🎨 **Modern UI/UX**
- Mobile-first responsive design
- Smooth animations and micro-interactions
- Progressive disclosure of information
- High-energy, optimistic vibe ("Spotify Wrapped" meets "Fintech Dashboard")

## Project Structure

```
scholarship_finder2/
├── frontend/                 # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS modules
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration
│   │   ├── models.py        # Data models
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
└── README.md
```

## Frontend Components

### 1. **InputForm** (`src/components/InputForm.js`)
Stage 1: User profile input
- Degree level selection
- GPA/Percentage input
- Target countries multi-select
- Major selection
- Optional test scores
- Work experience
- Profile highlights

### 2. **ProgressLog** (`src/components/ProgressLog.js`)
Loading state with animated progress
- Step-by-step indicator
- Progress bar
- Realistic timing (4-5 seconds)

### 3. **ResultsDisplay** (`src/components/ResultsDisplay.js`)
Stage 2: Results with lead gate
- Top scholarship fully visible with gold border
- Remaining scholarships blurred
- Modal unlock trigger on interaction
- Dynamic success probability badge

### 4. **LeadCapture** (`src/components/LeadCapture.js`)
Stage 3: Email/phone capture
- Form validation
- Scholarship preview
- Instant submission

### 5. **ThankYou** (`src/pages/ThankYou.js`)
Final confirmation page
- Success animation
- Next steps guidance
- WhatsApp contact CTA

## Backend Endpoints

### `/api/calculate-scholarships` (POST)
Calculates scholarships using Gemini API
**Request:**
```json
{
  "degree_level": "Masters",
  "gpa": 8.5,
  "gpa_scale": "10",
  "target_countries": ["USA", "Canada"],
  "major": "Computer Science",
  "test_scores": {"gre": 320},
  "work_experience_years": 2,
  "profile_highlight": "Published research paper"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary_probability": 78,
    "scholarships": [
      {
        "name": "Scholarship Name",
        "amount": "$50,000",
        "deadline": "2025-06-30",
        "match_score": 95,
        "one_liner_reason": "Your GPA and profile are a perfect fit",
        "strategy_tip": "Highlight your research experience in your essay"
      }
    ]
  }
}
```

### `/api/submit-lead` (POST)
Saves lead to Google Sheets and triggers email
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "user_profile": {...},
  "scholarship_results": {...}
}
```

### `/api/send-email` (POST)
Manual email trigger
**Request:**
```json
{
  "email": "recipient@example.com",
  "name": "John Doe",
  "scholarships": {...}
}
```

## Setup Instructions

### Backend Setup

1. **Create Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   # Copy .env.example to .env and fill in your credentials
   cp .env.example .env
   ```

4. **Run Server**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # .env already created with REACT_APP_API_URL
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Configuration

### Required Environment Variables

**Backend (.env)**
- `GOOGLE_API_KEY` - Your Gemini API key
- `GOOGLE_SHEETS_ID` - Your Google Sheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `GOOGLE_APPS_SCRIPT_URL` - Apps Script webhook URL
- `SMTP_USER` - Gmail address
- `SMTP_PASSWORD` - Gmail app password
- `SMTP_HOST` - SMTP server (smtp.gmail.com)
- `SMTP_PORT` - SMTP port (587)
- `FRONTEND_URL` - Frontend URL (http://localhost:3000)

**Frontend (.env)**
- `REACT_APP_API_URL` - Backend API URL (http://localhost:5000)

## Styling

The application uses a modern design system:

**Colors**
- Primary: #667eea (Purple)
- Primary Dark: #764ba2
- Success: #4CAF50 (Green)
- Text Primary: #333333
- Text Secondary: #666666
- Background Light: #f8f9fa

**Design Elements**
- Border radius: 12px-24px
- Shadows: Soft, layered
- Whitespace: Generous (40px+ padding)
- Animations: Smooth transitions (0.3s)

## API Integrations

### Google Gemini API
- Model: `gemini-2.0-flash`
- Temperature: 0.3 (Low creativity, high accuracy)
- Tools: Google Search Retrieval (Grounding)
- Response: JSON with scholarships array

### Google Sheets Integration
- Via Google Apps Script
- Automatic lead logging
- No database required

### Email Service
- SMTP: Gmail (with app password)
- Format: HTML templates with scholarship details
- Instant delivery on lead submission

## Performance Targets

- **Latency**: < 8 seconds for scholarship calculation
- **Load Time**: < 3 seconds initial page load
- **Lead Submission**: < 2 seconds
- **Mobile**: Optimized for 480px and above

## Security

- ✅ All API keys stored server-side
- ✅ CORS configured for frontend
- ✅ Input validation on all endpoints
- ✅ Email verification before sending reports
- ✅ No sensitive data in localStorage
- ✅ HTTPS recommended for production

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## Future Enhancements

- [ ] User authentication and login
- [ ] Saved profile management
- [ ] Application tracking dashboard
- [ ] Video tutorials for each scholarship
- [ ] A/B testing framework
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] SMS notifications

## Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Verify virtual environment is activated
- Check all dependencies in requirements.txt

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS settings in FastAPI
- Verify REACT_APP_API_URL in .env

### Email not sending
- Verify Gmail app password (not regular password)
- Check SMTP credentials in .env
- Ensure "Less secure app access" is enabled

### Gemini API errors
- Verify API key is valid
- Check API quotas in Google Cloud Console
- Ensure billing is enabled

## Support

For issues or feature requests, please contact the development team.

---

**Built with ❤️ for Indian students**
