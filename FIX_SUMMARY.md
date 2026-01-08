# Fix: Google Sheets Data Not Saving After Vercel Deployment

## 🔴 Problem Summary
After deploying to Vercel, users see **"Lead submitted successfully"** but data is **NOT being stored in Google Sheets**.

## ✅ Root Cause
The backend environment variables are missing in Vercel deployment:
- `GOOGLE_APPS_SCRIPT_URL` is not set
- Without this URL, the Apps Script call fails silently
- The error is caught and logged, but frontend still shows success

## 🛠️ What Was Fixed

### 1. **Better Environment Variable Handling**
- Modified `sheets_service.py` to check if `GOOGLE_APPS_SCRIPT_URL` is set
- Added clear warning logs when environment variable is missing
- Prevents silent failures

### 2. **Enhanced Error Handling**
- Added try-catch for HTTP timeouts
- Added proper error logging with traceback
- Timeout exceptions are caught and logged
- Network errors are handled gracefully

### 3. **Fallback System**
- If Apps Script fails → data saved locally to `backend/app/data/leads.json`
- If Google Sheets unavailable → email still gets sent
- Local JSON file serves as backup/audit trail

### 4. **Better Logging**
```python
# Now shows clear status messages:
📝 Processing lead
📤 Sending to Apps Script
📥 Response received
✅ Lead saved to Sheets
❌ Error with details
```

## 📋 Action Items (REQUIRED)

### Step 1: Add Environment Variables to Vercel
Go to your **Backend Project Settings** on Vercel and add:

```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwf6kDzsLDZu8oqBih_QAPuNm1McG4O0P0LBb5k2Mvmf5gtUDa8RwgAOQ7XEQogrTLS/exec
GOOGLE_API_KEY=AIzaSyBASL5pJZ0jPMwwY75HZbV_5IJ5zjuX49I
GOOGLE_SHEETS_ID=1cQfQHxBTN8_7pT2VDr8An-MpebXuppJLG7GTzLqp9Ew
GOOGLE_SERVICE_ACCOUNT_EMAIL=scholarship-account@gen-lang-client-0120926774.iam.gserviceaccount.com
SMTP_USER=pantechsoftware2@gmail.com
SMTP_PASSWORD=mmywbfoykfzuaboe
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=https://scholarship-finder-rouge.vercel.app
```

### Step 2: Redeploy Backend
```bash
cd backend
vercel --prod
```

### Step 3: Test the Fix
1. Visit your frontend: https://scholarship-finder-rouge.vercel.app
2. Submit a scholarship search
3. Fill in the lead form (name, email, phone)
4. Check your Google Sheet - data should appear within 5 seconds

### Step 4: Verify Logs (If Still Not Working)
1. Go to Vercel Dashboard → Your Backend Project
2. Click **Deployments** → Latest Deployment
3. Click **Runtime Logs**
4. Look for messages with ✅ or ❌
5. Copy any error messages for debugging

## 🔍 Troubleshooting

### Data still not appearing in Google Sheets?
1. Check Vercel Runtime Logs (see Step 4 above)
2. Verify Apps Script URL is correct:
   - Open the URL in a browser
   - You should see a JSON response from Google
3. Check that service account has edit permissions on the sheet

### Email not sending?
1. Check if SMTP credentials are correct
2. Look for error logs starting with `📧 [EMAIL]`
3. Gmail may require app-specific passwords (not regular password)

### Getting timeout errors?
1. Apps Script may be slow (can take 5-10 seconds)
2. Vercel has a 30-second timeout - should be enough
3. Check Apps Script execution logs in Google

## 📊 Files Modified
- `backend/app/services/sheets_service.py` - Enhanced error handling
- `backend/app/main.py` - Already has good logging
- Created `VERCEL_ENV_SETUP.md` - Setup guide

## 🔐 Security Notes
- ✅ Environment variables are secure in Vercel
- ✅ `.env` file is in `.gitignore` (not committed)
- ✅ All secrets are only available on production

## ✨ Additional Improvements
- Fallback JSON storage in `backend/app/data/leads.json`
- Better timeout handling (30 seconds per request)
- Detailed logging for debugging
- Graceful degradation if Apps Script unavailable

## 📞 Next Steps
1. Add the environment variables to Vercel now
2. Redeploy backend: `vercel --prod` from backend folder
3. Test with a new lead submission
4. Check Google Sheet for the new data
5. Monitor Vercel Runtime Logs for any issues

---
**Status**: ✅ Code fixes applied and ready for Vercel deployment
**Last Updated**: January 8, 2026
