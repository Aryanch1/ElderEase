# ElderEase

A big-text daily companion for older adults and their caregivers: today's reminders on a calm timeline, a plain-words weather summary, one-tap emergency contacts, and an AI companion that answers everyday questions in large, simple language. Big text is the feature, not a setting.

**Live web:** TBD (deploy in progress — see Vercel)
**Figma design:** https://www.figma.com/design/OR09xTgOrPMHVqpGYVK4AQ
**GitHub:** https://github.com/Aryanch1/ElderEase

## Who it helps

Older adults who want a calm, readable day plan, and the family members and caregivers who help them stay on top of medicine, appointments, and calls — without small text, nested menus, or confusing screens.

## Features

- **Today timeline** — a vertical timeline of today's reminders grouped Morning / Afternoon / Evening, with big times, big titles, and a satisfying Mark done toggle.
- **Typographic greeting hero** — "Good morning" in DM Serif Display with the big date; no photo hero.
- **Weather strip** — current temperature and a plain-words "dress for the day" line from Open-Meteo (free, no key), always labelled LIVE or DEMO.
- **SOS card** — one big red "Call for help" button that calls the primary contact, with an optional home address shown for reading to responders. The app does not alert emergency services; in a real emergency, call 911 directly.
- **Ask (AI companion)** — ask in plain words; answers in large type with short sentences. Suggested questions, question history with one-tap re-use, and "Make a reminder from this". Every answer carries a LIVE/DEMO badge and a "Not medical advice — ask your doctor or pharmacist" disclaimer.
- **Emergency contacts** — large cards with a big green Call button; primary contact flagged with a star.
- **Accounts** — sign in with Google or email/password (or continue as a guest for this visit only). Signed-in users stay signed in; profile photo, display name, and password reset live in Settings.
- **Text size** — Large or Extra large, scaling all type tokens.
- **Rising-sun refresh** — a sun disc rises and fills with amber as you pull; on web the same animation is wired to a sun button in the header.
- **Responsive** — phones 5–7 inch, foldable folded, foldable unfolded/tablet two-pane, and desktop centred shell.

## Tech stack

- React Native + Expo SDK 58, TypeScript (one codebase for Android, iOS, and web)
- Python serverless function (`api/ask.py`) calling Google Gemini (gemini-3.5-flash-lite) — key server-side only via `GEMINI_API_KEY`
- Firebase Authentication + Firestore (per-user data under `users/{uid}`, owner-only rules)
- DM Serif Display + Atkinson Hyperlegible (bundled via `@expo-google-fonts`), Reanimated spring animations, expo-blur frosted glass (two-layer structure on Android)

## How to run

```bash
npm install
npx expo start            # Android / iOS via Expo Go
npx expo start --web      # web
npx expo export --platform web   # static web build in dist/
```

Set `EXPO_PUBLIC_API_URL` to the deployed backend origin to enable live AI answers; without it the app uses an honest on-device demo answerer labelled DEMO. Firebase wiring is a publish step: fill in the `TODO-ELDEREASE` placeholders in `lib/firebase.ts` / `lib/firebase.native.ts` and set `firebaseConfigured = true` in `lib/config.ts`.

## Demo data

The first launch seeds clearly-labelled DEMO content (5 reminders, 3 contacts with fictional 555 numbers, 3 sample questions). Clear it anytime from Settings → Clear demo data.

## License

MIT License — Copyright (c) 2026 Aryanmouli Cherupalli
