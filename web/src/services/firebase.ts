import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fol-mishti.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fol-mishti',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fol-mishti.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '52117795903',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:52117795903:web:eff5d25a5b9515479ab48a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-TNCC96Q97J'
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key_here' &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key'
);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    }).catch(() => {});
  }).catch(() => {});
}

export default app;
