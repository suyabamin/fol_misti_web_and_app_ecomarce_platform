# Fol Mishti (ফল মিষ্টি) — Deployment Guide

## 1. Hosting Strategy
- **Frontend:** Vercel (or Firebase Hosting)
- **Backend:** Firebase Cloud Functions (TypeScript)
- **Database:** Google Cloud Firestore
- **Storage/Media:** Cloudinary

---

## 2. Deploying Frontend to Vercel

### 2.1 Commercial Plan Terms Check
> [!IMPORTANT]
> Verify that your Vercel plan meets the commercial licensing terms for an e-commerce website. Vercel Hobby accounts are intended for personal/non-commercial projects; for commercial e-commerce stores, a Vercel Pro account or Firebase Hosting should be used.

### 2.2 Deployment Steps via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Navigate to `web/` and build:
   ```bash
   cd web
   npm run build
   vercel
   ```
3. Set Root Directory: `web`
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variables in Vercel Project Settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## 3. Alternative: Deploying Frontend to Firebase Hosting
Firebase Hosting can serve the production build directly:
```bash
# In the root folder:
firebase deploy --only hosting
```
Configured in `firebase.json` with `web/dist` and single-page application rewrites to `/index.html`.

---

## 4. Deploying Backend Cloud Functions & Firestore
```bash
# Deploy Firestore security rules and composite indexes
firebase deploy --only firestore

# Build and deploy backend Cloud Functions
cd functions
npm run build
cd ..
firebase deploy --only functions
```
