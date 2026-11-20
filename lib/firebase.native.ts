import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from '@firebase/app';
import * as firebaseAuth from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';

/**
 * Firebase wiring for ElderEase — native (Android/iOS). Metro picks this
 * file over firebase.ts on native.
 *
 * Native imports the scoped @firebase/* packages on purpose: they ship
 * a real React Native build (the umbrella 'firebase/auth' entry does
 * not — it resolves to the browser build, whose sessions are kept in
 * memory only, so users were signed out every time the app closed).
 *
 * Firebase project elderease-6390f is configured below. Email/Password +
 * Google sign-in are enabled (email-link OFF); add the Vercel domain
 * to Firebase authorized domains.
 *
 * The config values below are Firebase's public app identifiers — they
 * are designed to ship in client code. Access is controlled by Firebase
 * Authentication plus the Firestore security rules (each user can only
 * read and write their own /users/<uid> tree). No admin keys or secrets
 * live here; the Gemini key stays server-side in the /api/ask (Python serverless)
 * function.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCdGO8yYUHtI3OFPxeEXLvg9lcSXCvjv6g',
  authDomain: 'elderease-6390f.firebaseapp.com',
  projectId: 'elderease-6390f',
  storageBucket: 'elderease-6390f.firebasestorage.app',
  messagingSenderId: '495779872699',
  appId: '1:495779872699:web:236215e5ed2d97bccfce9e',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). */
export const GOOGLE_WEB_CLIENT_ID = '495779872699-ekj7dp508k089desd4g7fmajh634om0f.apps.googleusercontent.com';

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth(): firebaseAuth.Auth {
  // Persist the session in AsyncStorage so the user stays signed in
  // between app launches, like every other app.
  const getPersistence = (
    firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: unknown) => firebaseAuth.Persistence;
    }
  ).getReactNativePersistence;
  if (getPersistence) {
    try {
      return firebaseAuth.initializeAuth(firebaseApp, {
        persistence: getPersistence(AsyncStorage),
      });
    } catch {
      // Already initialized (fast refresh) — fall through to getAuth.
    }
  }
  return firebaseAuth.getAuth(firebaseApp);
}

export const auth = createAuth();
export const db = getFirestore(firebaseApp);

export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  type User,
} from '@firebase/auth';

export {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@firebase/firestore';
