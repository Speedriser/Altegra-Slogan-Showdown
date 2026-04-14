import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Helpful console hint if env vars are missing (common on first deploy).
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Slogan Showdown] Firebase config missing. Copy .env.example to .env and fill in VITE_FIREBASE_* values.'
  );
}

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

/**
 * Sign in anonymously and resolve with a stable uid.
 * Caches the promise so repeated callers share the same sign-in.
 */
let authPromise: Promise<User> | null = null;
export function ensureAuth(): Promise<User> {
  if (authPromise) return authPromise;
  authPromise = new Promise<User>((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
    signInAnonymously(auth).catch((err) => {
      unsub();
      reject(err);
    });
  });
  return authPromise;
}
