# Vercel Environment Variables Setup

## Problem
After deploying to Vercel, the "Lead submitted successfully" message appears, but the data is NOT being saved to Google Sheets. This is because the environment variables are not configured in Vercel.

## Solution
You need to add the following environment variables to your **Vercel Backend Project**:

### Required Environment Variables

#### 1. **Google Apps Script URL** (REQUIRED for Google Sheets)
```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwf6kDzsLDZu8oqBih_QAPuNm1McG4O0P0LBb5k2Mvmf5gtUDa8RwgAOQ7XEQogrTLS/exec
```

#### 2. **Google Gemini API Key** (REQUIRED for Scholarship Calculation)
```
GOOGLE_API_KEY=AIzaSyBASL5pJZ0jPMwwY75HZbV_5IJ5zjuX49I
```

#### 3. **Google Sheets Integration**
```
GOOGLE_SHEETS_ID=1cQfQHxBTN8_7pT2VDr8An-MpebXuppJLG7GTzLqp9Ew
GOOGLE_SERVICE_ACCOUNT_EMAIL=scholarship-account@gen-lang-client-0120926774.iam.gserviceaccount.com
```

#### 4. **Email Configuration** (REQUIRED for Email Notifications)
```
SMTP_USER=pantechsoftware2@gmail.com
SMTP_PASSWORD=mmywbfoykfzuaboe
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### 5. **Server Configuration**
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://scholarship-finder-rouge.vercel.app
```

## Steps to Add Environment Variables to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Select your **Backend Project** (`scholarship-finder-backend-seven`)
3. Click **Settings** → **Environment Variables**
4. Add each variable one by one:
   - Click **Add New**
   - Paste variable name (e.g., `GOOGLE_APPS_SCRIPT_URL`)
   - Paste variable value
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Add**

### Method 2: Via Vercel CLI

```bash
cd backend
vercel env add GOOGLE_APPS_SCRIPT_URL
vercel env add GOOGLE_API_KEY
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add FRONTEND_URL
```

## Verification Steps

After adding environment variables:

1. **Redeploy** your backend:
   ```bash
   cd backend
   vercel --prod
   ```

2. **Test the API** by submitting a lead from the frontend
3. **Check Vercel Logs** for any errors:
   - Go to **Deployments** → Latest → **Runtime Logs**
   - Look for `✅ Lead successfully saved to Google Sheets` message

## Fallback System

The application now includes a **fallback mechanism**:
- If Apps Script fails → Data is saved to `backend/app/data/leads.json`
- If email fails → User still sees success message
- Errors are logged in Vercel Runtime Logs for debugging

## Important Notes

⚠️ **DO NOT commit `.env` files to GitHub**
- The `.env` file is in `.gitignore` for security
- Use Vercel dashboard to manage production secrets

✅ **Always redeploy after changing environment variables**
- Environment variables don't take effect until you redeploy
- Use `vercel --prod` for production deployment

## Debugging

If data still isn't saving to Google Sheets:

1. **Check Google Apps Script URL is correct**
   - Open the URL in browser - should show a Google Sheets API response

2. **Check Vercel Logs**
   - Look for error messages starting with ❌
   - Screenshot and share with support if needed

3. **Check Google Sheets permissions**
   - Verify service account has edit access to the sheet

4. **Verify Frontend URL**
   - Make sure FRONTEND_URL matches your deployed frontend URL

## Support
If you encounter issues after setting up environment variables, check:
- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- Vercel Runtime Logs for detailed error messages
