/**
 * ElderEase runtime config.
 *
 * The AI companion is a Python serverless function (api/ask.py):
 * POST /api/ask. EXPO_PUBLIC_API_URL is the backend origin when it is
 * deployed (e.g. the deployed Vercel URL). When no endpoint answers,
 * the app falls back to its on-device demo answerer (lib/ask.ts) and
 * says DEMO honestly — reminders, contacts and weather keep working
 * either way.
 *
 * No Gemini key ever lives in this file or in app code; the key is
 * server-side only in the api/ask.py function (GEMINI_API_KEY).
 */

/** Backend origin, or '' when the backend is not deployed yet. */
export const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');

/**
 * Set to true once the Firebase project for ElderEase exists and the
 * values in lib/firebase.ts / lib/firebase.native.ts are the real web
 * config. No Firebase project exists yet — TODO-ELDEREASE placeholders
 * are in both files and wiring is a publish step, so this stays false.
 */
export const firebaseConfigured = false;
