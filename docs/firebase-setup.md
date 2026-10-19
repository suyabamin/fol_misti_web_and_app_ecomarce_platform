# Fol Mishti (ফল মিষ্টি) — Firebase Setup & Configuration Guide

## 1. Firebase Project Creation
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `fol-mishti` (or your preferred project ID).
3. Disable or enable Google Analytics according to your preference.
4. Set the default Cloud Resource location (recommended: `asia-south1` or `us-central1`).

---

## 2. Authentication Setup
1. In Firebase Console, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Enable **Email/Password**.
   - Enable **Google**:
     - Provide project support email.
     - Add authorized domains: `localhost`, `127.0.0.1`, and your production domain (e.g., `folmishti.vercel.app`).

---

## 3. Cloud Firestore Database Setup
1. Navigate to **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose **Production mode** (rules will be deployed from `firebase/firestore.rules`).
4. Select location (e.g. `asia-south1` for low latency in Bangladesh).
5. Deploy rules and indexes using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## 4. Cloud Functions Deployment
> [!IMPORTANT]
> Firebase Cloud Functions deployment requires the Firebase project to be on the **Blaze (Pay as you go)** plan.
1. Install Firebase CLI globally (if not installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Firebase account:
   ```bash
   firebase login
   ```
3. Initialize or link your project:
   ```bash
   firebase use --add
   ```
4. Build and deploy functions:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

---

## 5. Web App Registration & Environment Variables
1. In Firebase Console > **Project Settings > General > Your apps**, click the **Web icon (</>)**.
2. Register app as `Fol Mishti Web`.
3. Copy the Firebase configuration object and create `.env` in `web/` (refer to `web/.env.example`):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=fol-mishti.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=fol-mishti
   VITE_FIREBASE_STORAGE_BUCKET=fol-mishti.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

---

## 6. Initial Administrator Bootstrapping
To grant the initial admin privilege safely:
- Sign in once with `admin@folmishti.com` on the website.
- Call the Cloud Function `setAdminRole` with `{ targetUid: "<uid>", isAdmin: true }` or add a document with ID `<uid>` into the Firestore `admins` collection:
  ```text
  Collection: admins
  Document ID: <uid>
  Fields:
    uid: "<uid>"
    email: "admin@folmishti.com"
    assignedAt: [Server Timestamp]
  ```
