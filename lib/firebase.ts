import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase wiring for ElderEase — web.
 *
 * No Firebase project exists yet — TODO-ELDEREASE placeholders below;
 * wiring is a publish step. Until the real config lands, the app runs
 * in full local/guest mode. When the project exists, enable
 * Email/Password + Google sign-in (email-link OFF) and add the Vercel
 * domain to Firebase authorized domains.
 *
 * The config values are Firebase's public app identifiers — they are
 * designed to ship in client code. Access is controlled by Firebase
 * Authentication plus the Firestore security rules (each user can only
 * read and write their own /users/<uid> tree). No admin keys or secrets
 * live here; the Gemini key stays server-side in the /api/ask (Python serverless)
 * function.
 *
 * Platform note: this file serves web (and tooling). Native builds use
 * firebase.native.ts instead, which imports the scoped @firebase/*
 * packages — the umbrella 'firebase/auth' entry has no React Native
 * build, so on Android/iOS it silently resolves to the browser build
 * whose sessions live in memory only and are lost when the app closes.
 * Every module imports its Auth/Firestore helpers from './firebase' so
 * each platform always gets one consistent set of Firebase modules.
 */
const firebaseConfig = {
  apiKey: 'TODO-ELDEREASE-API-KEY',
  authDomain: 'TODO-ELDEREASE.firebaseapp.com',
  projectId: 'TODO-ELDEREASE',
  storageBucket: 'TODO-ELDEREASE.firebasestorage.app',
  messagingSenderId: 'TODO-ELDEREASE-SENDER-ID',
  appId: 'TODO-ELDEREASE-APP-ID',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). */
export const GOOGLE_WEB_CLIENT_ID = 'TODO-ELDEREASE-GOOGLE-WEB-CLIENT-ID';

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = firebaseAuth.getAuth(firebaseApp);
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
} from 'firebase/auth';

export {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
