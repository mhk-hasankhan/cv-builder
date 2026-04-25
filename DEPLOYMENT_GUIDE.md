# Google Sign-In Integration & Deployment Guide

## ✅ Code Verification Complete

All files have been created and fixed correctly:
- ✅ Backend authentication middleware
- ✅ Google OAuth controller
- ✅ Database schema with users table
- ✅ Frontend auth store & login page
- ✅ Protected routes
- ✅ JWT token handling

---

## 📋 Files to Push to GitHub

### DO PUSH (these are safe):
```
✅ backend/middleware/auth.js
✅ backend/controllers/authController.js
✅ backend/routes/auth.js
✅ backend/database/db.js
✅ backend/routes/cvs.js (modified)
✅ backend/routes/coverLetters.js (modified)
✅ backend/controllers/cvsController.js (modified)
✅ backend/controllers/coverLettersController.js (modified)
✅ backend/server.js (modified)
✅ backend/package.json (modified)

✅ frontend/src/store/authStore.js
✅ frontend/src/pages/Login.jsx
✅ frontend/src/components/ui/ProtectedRoute.jsx
✅ frontend/src/App.jsx (modified)
✅ frontend/src/main.jsx (modified)
✅ frontend/src/utils/api.js (modified)
✅ frontend/src/components/ui/Layout.jsx (modified)
✅ frontend/package.json (modified)

✅ .gitignore (modified)
```

### DO NOT PUSH (contains secrets):
```
❌ backend/.env (NEVER commit - has GOOGLE_CLIENT_ID & JWT_SECRET)
❌ frontend/.env (NEVER commit - has VITE_GOOGLE_CLIENT_ID)
❌ backend/database/cvbuilder.db* (database file)
❌ backend/uploads/* (user uploads)
❌ node_modules/ (dependencies)
```

---

## 🚀 Netlify Deployment (Frontend Only)

### Step 1: Setup Frontend for Production

Update `frontend/.env.production`:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_URL=https://your-backend-api-url.com/api
```

Update `frontend/vite.config.js` (if you have one) to set the correct base URL.

### Step 2: Connect Frontend to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Choose GitHub, authorize, and select your repo
4. **Build settings:**
   - Build command: `npm run build` (or `npm --prefix frontend run build` if monorepo)
   - Publish directory: `frontend/dist`
5. **Environment variables:**
   - Add `VITE_GOOGLE_CLIENT_ID` = your-google-client-id
   - Add `VITE_API_URL` = your-backend-api-url
6. Click **Deploy**

### Step 3: Update CORS on Backend

Once you have your Netlify URL (e.g., `https://your-app.netlify.app`), update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.netlify.app'  // ← Add your Netlify URL
  ],
  credentials: true
}));
```

---

## 🖥️ Backend Deployment

### Option A: Deploy to Render.com (Recommended - Free tier available)

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. **Settings:**
   - Name: cv-builder-api
   - Environment: Node
   - Build command: `npm install`
   - Start command: `node backend/server.js`
   - Root directory: `backend/` (if using separate folders)
5. **Add Environment Variables:**
   - `GOOGLE_CLIENT_ID` = your-google-client-id
   - `JWT_SECRET` = long-random-secret (generate: `openssl rand -base64 32`)
   - `PORT` = 3001
6. Deploy and note your backend URL (e.g., `https://cv-builder-api.onrender.com`)

### Option B: Deploy to Railway or Vercel

Similar steps - just ensure:
- Node.js runtime
- Environment variables set
- Start command: `node backend/server.js`

---

## 🔐 Google OAuth Setup (Already Done, But Verify)

**Current Client ID:** Check your `.env` files

If you need to create a new one:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create/select a project
3. **APIs & Services → Credentials**
4. **Create OAuth 2.0 Client ID:**
   - Type: **Web application**
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (local dev)
     - `https://your-app.netlify.app` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (local dev)
     - `https://your-app.netlify.app` (production)
5. Copy Client ID

---

## 🔗 Update CORS for Production

After deploying, update `backend/server.js` CORS to match your Netlify domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',           // development
    'https://your-app.netlify.app',    // production netlify
    'https://cv-builder-co.netlify.app' // if different
  ],
  credentials: true
}));
```

---

## ✅ Pre-Deployment Checklist

- [ ] Google Client ID is working locally
- [ ] Both frontend and backend running on localhost
- [ ] Login works with Google OAuth
- [ ] CVs are scoped by user (other users can't see them)
- [ ] Logout works
- [ ] Export to PDF/DOCX works
- [ ] All environment variables are set in production
- [ ] CORS is configured for production domain
- [ ] Database backups (before deploying with real users)

---

## 🔧 Troubleshooting

### "Invalid Client ID" on Netlify
- Verify `VITE_GOOGLE_CLIENT_ID` is set in Netlify env vars
- Restart deployment after changing env vars
- Check that the domain is in Google Console authorized origins

### "CORS error" when frontend calls backend
- Ensure backend CORS includes your Netlify domain
- Redeploy backend after updating CORS

### JWT token expired
- Tokens expire in 7 days (set in `authController.js`)
- Users need to log out and log back in, or implement refresh tokens

### Database not persisting on Render/Railway
- SQLite stores data in a file, which doesn't persist across restarts
- **Recommended:** Migrate to PostgreSQL instead:
  ```bash
  npm install pg pg-promise
  ```
  Then update `db.js` to use PostgreSQL

---

## 📝 Final Steps

1. **Commit to GitHub:**
   ```bash
   git add .
   git commit -m "feat: add Google Sign-In authentication"
   git push origin main
   ```

2. **Deploy Backend** (Render, Railway, etc.)

3. **Deploy Frontend** (Netlify)

4. **Update Google Console** with production URLs

5. **Test everything** in production

Done! 🎉
