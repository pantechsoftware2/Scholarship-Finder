# Scholarship Finder - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 14+ and npm (for frontend)
- Google Gemini API key
- Gmail account with app password enabled

---

## **WINDOWS Users**

### Step 1: Start Backend
```bash
# Open Command Prompt or PowerShell
# Navigate to project directory
cd Scholarship_Finder2

# Run the startup script
run_backend.bat
```

The backend will start automatically on `http://localhost:5000`

### Step 2: Start Frontend (New Terminal)
```bash
# Open another Command Prompt or PowerShell
# Navigate to project directory
cd Scholarship_Finder2

# Run the startup script
run_frontend.bat
```

The frontend will open automatically on `http://localhost:3000`

---

## **macOS/Linux Users**

### Step 1: Start Backend
```bash
# Open terminal
cd Scholarship_Finder2

# Make script executable
chmod +x run_backend.sh

# Run the startup script
./run_backend.sh
```

The backend will start on `http://localhost:5000`

### Step 2: Start Frontend (New Terminal)
```bash
# Open another terminal
cd Scholarship_Finder2

# Make script executable
chmod +x run_frontend.sh

# Run the startup script
./run_frontend.sh
```

The frontend will open on `http://localhost:3000`

---

## **Manual Setup (if scripts don't work)**

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

---

## **Configuration**

### Backend (.env file)

Located at: `backend/.env`

Replace with your actual credentials:

```env
# Google Gemini API
GOOGLE_API_KEY=your_actual_gemini_api_key

# Google Sheets (Optional for MVP)
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_APPS_SCRIPT_URL=your_apps_script_url

# Email Configuration
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env file)

Located at: `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## **How to Get Your Credentials**

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to `backend/.env`

### Gmail App Password
1. Enable 2-factor authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password
4. Use this in `SMTP_PASSWORD` (not your regular password)

### Google Sheets (Optional)
1. Create a new Google Sheet
2. Share it with the service account email
3. Get the sheet ID from the URL

---

## **Testing the Application**

### Test Inputs
Use these test values to verify everything works:

**Degree:** Masters  
**GPA:** 8.5 (out of 10)  
**Major:** Computer Science  
**Countries:** USA, Canada  
**Test Score:** GRE - 320  
**Work Experience:** 2 years  
**Highlight:** "Published research paper on AI"

---

## **Troubleshooting**

### Backend won't start
- ✅ Ensure Python 3.8+ is installed: `python --version`
- ✅ Virtual environment is activated (should see `(venv)` in terminal)
- ✅ All dependencies installed: `pip list | grep fastapi`

### Frontend won't load
- ✅ Node.js installed: `node --version`
- ✅ Port 3000 is not in use
- ✅ Backend is running before frontend

### API Connection Error
- ✅ Check that backend is running on `http://localhost:5000`
- ✅ Check `REACT_APP_API_URL` in frontend `.env`
- ✅ CORS is enabled in FastAPI (already configured)

### Email not sending
- ✅ Use app password, not regular Gmail password
- ✅ 2FA enabled on Google account
- ✅ Less secure app access enabled (if needed)

### Gemini API errors
- ✅ API key is valid and active
- ✅ Billing is enabled on Google Cloud
- ✅ API quotas not exceeded

---

## **Project Structure**

```
Scholarship_Finder2/
├── frontend/                    # React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── pages/              # Page components
│   │   ├── styles/             # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── services/           # Business logic
│   │   ├── config.py
│   │   ├── models.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── README.md                    # Full documentation
├── run_backend.bat             # Windows backend script
├── run_backend.sh              # macOS/Linux backend script
├── run_frontend.bat            # Windows frontend script
└── run_frontend.sh             # macOS/Linux frontend script
```

---

## **Key Features**

✅ **AI-Powered**: Uses Google Gemini with search grounding  
✅ **Mobile-First**: Fully responsive design  
✅ **Lead Magnet**: Progressive disclosure with blur effect  
✅ **Email Integration**: Instant report delivery  
✅ **No Database**: Direct Google Sheets integration  
✅ **Fast**: Results in <8 seconds  

---

## **Next Steps**

1. ✅ Start the backend and frontend
2. ✅ Open http://localhost:3000
3. ✅ Fill in the scholarship calculator form
4. ✅ See the blurred results
5. ✅ Enter your email to unlock
6. ✅ Check your email for the report

---

## **Need Help?**

- Read the full README.md for detailed documentation
- Check the troubleshooting section above
- Verify all credentials are correct in .env files
- Ensure both backend and frontend are running

---

**Happy scholarship hunting! 🎓**
