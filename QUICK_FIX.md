# 🚀 Quick Fix: Google Sheets Not Saving Data

## The Problem ❌
- "Lead submitted successfully" appears ✅
- But data NOT saving to Google Sheets ❌
- Works locally but fails on Vercel 🔴

## Why? 🤔
**Missing environment variables on Vercel**

Your backend needs to know:
- Where the Apps Script is: `GOOGLE_APPS_SCRIPT_URL`
- How to send emails: `SMTP_USER`, `SMTP_PASSWORD`
- API keys: `GOOGLE_API_KEY`

## The Fix ✅ (5 minutes)

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com
2. Click your **Backend Project** (scholarship-finder-backend-seven)
3. Click **Settings** → **Environment Variables**

### Step 2: Copy & Paste These Variables
Click "Add New" for each one:

| Name | Value |
|------|-------|
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbwf6kDzsLDZu8oqBih_QAPuNm1McG4O0P0LBb5k2Mvmf5gtUDa8RwgAOQ7XEQogrTLS/exec` |
| `GOOGLE_API_KEY` | `AIzaSyBASL5pJZ0jPMwwY75HZbV_5IJ5zjuX49I` |
| `GOOGLE_SHEETS_ID` | `1cQfQHxBTN8_7pT2VDr8An-MpebXuppJLG7GTzLqp9Ew` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `scholarship-account@gen-lang-client-0120926774.iam.gserviceaccount.com` |
| `SMTP_USER` | `pantechsoftware2@gmail.com` |
| `SMTP_PASSWORD` | `mmywbfoykfzuaboe` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `FRONTEND_URL` | `https://scholarship-finder-rouge.vercel.app` |

For each:
- Paste name
- Paste value
- Select: ✓ Production ✓ Preview ✓ Development
- Click "Add"

### Step 3: Redeploy Backend
```bash
cd backend
vercel --prod
```

### Step 4: Test
1. Go to https://scholarship-finder-rouge.vercel.app
2. Fill form and submit
3. Check Google Sheet → Data should appear! 🎉

## Verify It Works 🔍
Check Vercel Logs:
1. Vercel Dashboard → Deployments → Latest
2. Click "Runtime Logs"
3. Look for: ✅ "Lead successfully saved to Google Sheets"

## If Still Not Working? 🆘
1. Redeploy again: `vercel --prod`
2. Check all environment variables are set (not empty)
3. Check Google Apps Script URL is valid
4. Look at Vercel Runtime Logs for error messages

## What Changed? ✨
- Better error messages in logs
- Fallback to local JSON if Apps Script fails
- Data is always saved (either Sheets or local)
- More debugging info available

---
**Status**: Ready to deploy! 🚀
