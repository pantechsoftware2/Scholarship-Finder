# ✅ Deployment Checklist

## Issue: Leads Not Saving to Google Sheets After Vercel Deploy

### Part 1: Add Environment Variables (2 minutes)

- [ ] Open https://vercel.com
- [ ] Go to Backend Project: `scholarship-finder-backend-seven`
- [ ] Click Settings → Environment Variables
- [ ] Add `GOOGLE_APPS_SCRIPT_URL`:
  ```
  https://script.google.com/macros/s/AKfycbwf6kDzsLDZu8oqBih_QAPuNm1McG4O0P0LBb5k2Mvmf5gtUDa8RwgAOQ7XEQogrTLS/exec
  ```
- [ ] Add `GOOGLE_API_KEY`:
  ```
  AIzaSyBASL5pJZ0jPMwwY75HZbV_5IJ5zjuX49I
  ```
- [ ] Add `GOOGLE_SHEETS_ID`:
  ```
  1cQfQHxBTN8_7pT2VDr8An-MpebXuppJLG7GTzLqp9Ew
  ```
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`:
  ```
  scholarship-account@gen-lang-client-0120926774.iam.gserviceaccount.com
  ```
- [ ] Add `SMTP_USER`:
  ```
  pantechsoftware2@gmail.com
  ```
- [ ] Add `SMTP_PASSWORD`:
  ```
  mmywbfoykfzuaboe
  ```
- [ ] Add `SMTP_HOST`:
  ```
  smtp.gmail.com
  ```
- [ ] Add `SMTP_PORT`:
  ```
  587
  ```
- [ ] Add `FRONTEND_URL`:
  ```
  https://scholarship-finder-rouge.vercel.app
  ```

### Part 2: Redeploy Backend (1 minute)

```bash
cd backend
vercel --prod
```

- [ ] Wait for deployment to complete (green checkmark)
- [ ] Note the deployment URL (should be https://scholarship-finder-backend-seven.vercel.app)

### Part 3: Test (2 minutes)

- [ ] Open https://scholarship-finder-rouge.vercel.app
- [ ] Enter profile info and click "Calculate Scholarships"
- [ ] Click "Unlock Full List"
- [ ] Fill in form (Name, Email, Phone)
- [ ] Click "Submit"
- [ ] Should see "Lead submitted successfully"
- [ ] Check email inbox - should receive report email
- [ ] Go to Google Sheet - should see new row with data

### Part 4: Verify (1 minute)

- [ ] Open Vercel Dashboard
- [ ] Go to Backend Project → Deployments → Latest
- [ ] Click "Runtime Logs"
- [ ] Should see messages with ✅ and "Lead successfully saved to Google Sheets"
- [ ] No ❌ error messages should appear

### Part 5: Troubleshooting (If Still Not Working)

If data still not appearing in Google Sheet:

- [ ] Check all 9 environment variables are set (not empty) in Vercel
- [ ] Redeploy again: `vercel --prod`
- [ ] Clear browser cache: Press `Ctrl+Shift+Delete`
- [ ] Test with different email address
- [ ] Check Vercel Runtime Logs for error messages
- [ ] Check if Google Sheet link is correct
- [ ] Verify Apps Script URL is valid (paste in browser)

### Common Error Messages & Fixes

| Error | Fix |
|-------|-----|
| `GOOGLE_APPS_SCRIPT_URL not configured` | Add `GOOGLE_APPS_SCRIPT_URL` env var to Vercel |
| `HTTP Error 404` | Apps Script URL is wrong or script is not published |
| `request timed out` | Apps Script is slow (normal), wait and retry |
| `Email not received` | SMTP credentials are wrong, use app password not account password |
| Still shows success but no sheet data | Check Vercel logs, may be local fallback mode |

---

**Time Estimate**: 5-10 minutes total

**Success Indicator**: ✅ Google Sheet has new data row when you submit a lead

**Get Help**: Check the README or `QUICK_FIX.md` for more details
