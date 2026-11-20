# ElderEase — Design Spec (app #7, 2026-11-20)

Daily companion for older adults and their caregivers: today's reminders on a
big, calm timeline, a plain-words weather summary, one-tap emergency
contacts, and an AI companion that answers everyday questions in large,
simple language. Big text is the feature, not a setting.

Figma file: https://www.figma.com/design/OR09xTgOrPMHVqpGYVK4AQ
("ElderEase — Daily App"). Repo: https://github.com/Aryanch1/ElderEase
(created at publish time). Live web link: TBD at publish time.

## Distinct identity (DISTINCT INTERFACE rule — must not read as any previous app)

- **Previous apps to differ from:** FridgeToMeal (deep green, photo hero,
  frosted panel, floating pill tab bar), MediGuide (teal, capsule refresh,
  glass pill tab bar), SplitEase (navy + gold ledger, top segmented tabs),
  PlantDoctor (terracotta + sage dashboard grid, flat labeled tab bar, arch
  tiles), CivicHelper (stamp red + postmark blue document timeline, dark ink
  tab bar with raised red + button), BudgetBuddy (violet + lime, budget ring
  data hero, flat white tab bar, slim white left rail).
- **ElderEase identity:** "morning sun, large print." A warm sunrise
  palette, a serif display face, a hyperlegible body face, and a vertical
  day timeline as the home structure. NO photo hero, NO frosted panel over a
  photo, NO floating pill tab bar, NO ledger, NO dashboard grid, NO ring
  data hero, NO document timeline.
- **Layout structure:** home is a vertical timeline of today (Morning /
  Afternoon / Evening sections) with large reminder cards; a typographic
  greeting hero (huge serif "Good morning" + big date + weather strip),
  never a photo. Detail screens are full-screen takeovers with a large
  back button, not overlapping sheets.
- **Navigation:** a solid warm-cream bottom "big-button dock" — three
  oversized labeled buttons (Today, Ask, Contacts), each at least 64px tall
  with a large text label under a large icon. Settings is a large gear
  button in the header. This is deliberately chunkier and text-first,
  unlike every previous tab bar.
- **Hero treatment:** typographic only. The sun motif is a designed
  graphic (a rising-sun arc drawn with shapes/gradient), not a photo.
- **Display font:** DM Serif Display (serif — a first among the daily
  apps; previous apps all used grotesques: Sora, Fraunces, Bricolage
  Grotesque, Archivo, Space Grotesk). Body font: Atkinson Hyperlegible
  (designed for low vision — the honest, fitting choice for this audience),
  via @expo-google-fonts/dm-serif-display and
  @expo-google-fonts/atkinson-hyperlegible.
- **Refresh motif:** a rising sun — a sun disc rises and fills with amber
  as the user pulls; on release it plays its loop (gentle rays pulse),
  then the timeline settles with a spring and cards re-enter staggered.
  On web, the same animation is wired to a sun button in the header.

## Tokens (lib/theme.ts — one system, no one-off styles)

- Palette (one disciplined theme color: sunrise amber):
  - primary `#C97A12` (deep amber, readable on cream), primaryDeep `#8A5208`,
    primaryLight `#E9A13B`, primarySoft `#FDEBC8`, primaryPale `#FFF6E3`
  - accent (done/healthy only): sage green `#4D7C0F`, accentSoft `#EDF5DC`
  - SOS red (emergency only, never decoration): `#B3261E`, sosSoft `#FCE8E6`
  - ink `#2B2118`, body `#5C4A38`, muted `#8A7663`
  - surface `#FFFFFF`, background cream `#FFFBF2`, sheet `#FFFDF8`
  - line `rgba(43, 33, 24, 0.12)`, glass `rgba(255, 255, 255, 0.66)`
  - aurora: `['#FFFBF2', '#FFF3DC', '#FDEBC8']`
- Type (BIG by design — this audience reads large print):
  - display (DM Serif Display): 48/52, titles 30/36, section titles 22/28
  - body (Atkinson Hyperlegible 400): 18/27 minimum; bodyStrong 18/27 bold
  - labels/captions: never below 14; section labels 13/17 bold, letterSpacing 1.2
  - reminder card title 22, time 20 bold, weather temp 40 display
- Spacing: 8-point grid (xs 4, sm 8, md 16, lg 24, xl 32, xxl 48).
- Radii: cards 30, sheets 38, inputs 24, pills 999. Buttons fully round.
- Shadows: soft warm card shadow (ink, 10/0.10/24), amber glow on the
  primary CTA (primary, 8/0.30/18).
- Buttons: primary = amber gradient fill + glass edge highlight + soft
  amber glow; secondary = frosted-glass pill. Every tappable element:
  Reanimated spring press to ~0.95 with overshoot settle, glow tightens,
  light haptic on primary actions (mobile only). Chips pop (scale bounce)
  when selected. Loading states animate (bouncing dots) — never frozen.
  Disabled states visibly softer. Tap targets at least 56px on this app
  (above the 44px floor) — big-button dock, SOS, reminder done buttons.

## Screens (full flow — nothing is an afterthought)

1. **Splash** — warm cream, rising-sun mark, "ElderEase" in DM Serif
   Display, gentle sun-rise entrance.
2. **Welcome** (signed-out gate) — exactly four options: Continue with
   Google; Create account (display name + email + password + confirm
   password, match check); Log in (email/password) with Forgot password
   (reset email); Continue without an account. Large type, one option per
   big card.
3. **Home (Today)** — greeting hero ("Good morning, [name]" in serif,
   big date), weather strip (current temp + condition + one "dress for the
   day" line, source labelled Live or Demo), SOS card (big red "Call for
   help" — one tap calls the primary contact; below it, small text: "Calls
   your primary contact. This app does not alert emergency services."),
   timeline of today's reminders grouped Morning / Afternoon / Evening,
   each card: time (big), title, kind chip (Medicine / Appointment / Call /
   Meal / Walk / Custom), Done toggle (big, satisfying check), tap opens
   the reminder detail takeover. Empty state: "Nothing scheduled yet —
   add your first reminder" with a big Add button. Header: sun refresh
   button (web) + settings gear.
4. **Add / edit reminder** — full-screen takeover: title, kind chips,
   time picker (large), repeat (Once / Every day / Weekdays), note field,
   Save (primary pill). Visible in-place confirmation on save.
5. **Reminder detail** — takeover: big time + title, kind, note, repeat,
   Mark done / Edit / Delete actions.
6. **Ask (AI companion)** — big input ("Ask in plain words…"), suggested
   question chips ("What does my prescription label mean?", "How do I
   prepare for a doctor visit?", "What should I wear today?"), answer in
   large type with short sentences, a "Not medical advice — ask your
   doctor or pharmacist" disclaimer on every answer, and a "Make a
   reminder from this" action when the answer contains a time or task.
   History of past questions, one-tap re-use, clear-history in Settings.
   DEMO vs LIVE AI badge, always honest.
7. **Contacts** — emergency contacts as large cards (big initials avatar,
   name 22pt, relation, big green Call button using tel:). Primary contact
   flagged with a star chip. Add/edit contact takeover (name, relation,
   phone). One-tap call is the whole point — no nested menus.
8. **Settings** — profile editor (photo as resized base64 on users/{uid},
   display name, email + sign-in method, password-reset email for password
   accounts, sign out), text-size choice (Large / Extra large — scales the
   type tokens), home city for weather (small list, default Glassboro, NJ),
   home address (optional, shown on the SOS card for reading to
   responders), clear demo data, clear history, About (version read from
   app.json/package.json only), Help link.
9. **Help** — how the app works in large plain language, emergency
   guidance (when to call 911 directly), contact support note.
10. **Modals / toasts** — delete confirmations, save confirmations shown
    where the user is looking (scroll/highlight), error states with a next
    step. Loading skeletons while AI answers (never a frozen screen).

## Transitions / animation plan

- Splash: sun rises, title fades up (spring).
- Screen changes: slide_from_right (stack default), sheet takeovers
  spring up.
- Home cards: staggered rise on first paint and after refresh.
- Done toggle: check pops with a spring + sage fill; card softens.
- SOS: press compresses, haptic, then the call sheet.
- Refresh: sun disc rises/fills scrubbed by pull distance; release plays
  the ray-pulse loop; content springs back, cards re-enter staggered.
- Presses everywhere: scale ~0.95 + overshoot settle.

## Data & AI

- Reminders + contacts + ask history: per-user under users/{uid} when
  signed in (owner-only Firestore rules), on-device AsyncStorage always.
  Selections never persist across visits (fresh start); History IS saved
  (device + users/{uid} when signed in), one-tap re-use, clear-history.
- Seeded demo data (clearly labelled DEMO, clearable from Settings):
  5 reminders (Medicine 8:00 AM, Morning walk 10:30 AM, Call Maya 4:00 PM,
  Dinner medicine 7:00 PM, Water reminder 2:00 PM), 3 demo contacts
  (Maya — Daughter, Dr. Patel — Doctor, Joe — Neighbor) with fictional
  555 numbers, 3 sample questions.
- Weather: Open-Meteo (free, no key) current conditions for the chosen
  city; on any failure the app shows demo weather labelled DEMO, never a
  blank or a fake "live" reading.
- AI: Python serverless `api/ask.py` (even day-of-month rotation) calling
  Gemini gemini-3.5-flash-lite via the OpenAI-compatible endpoint, key
  server-side only (GEMINI_API_KEY). Prompt: plain words, short sentences,
  large-print friendly, general information only, never a diagnosis or a
  prescription change, always the "ask your doctor or pharmacist" line
  for health topics. Without a backend the app uses an honest on-device
  demo answerer (rule-based: medicine labels, appointment prep, weather
  dressing, general questions) and says DEMO.

## Accounts (standard system, from day one)

- Providers: Email/Password AND Google in Firebase Authentication
  (email-link OFF); app Vercel domain added to authorized domains at
  publish time.
- Welcome gate on every open (see screen 2). Session: signed-in users
  STAY signed in across opens (Firebase Auth persistence via the
  platform-split module — @firebase/* on native, umbrella on web;
  await auth.authStateReady() before marking auth-ready; verify the
  Android bundle contains @firebase/auth/dist/rn).
- Profile & settings per screen 8. Guest mode PER-VISIT ONLY.
- Firebase project does NOT exist yet — lib/firebase.ts and
  lib/firebase.native.ts carry TODO-ELDEREASE placeholders and
  firebaseConfigured=false in lib/config.ts; wiring is a publish step.
- NEVER write plaintext passwords anywhere (Firebase Auth only).

## Responsive (hard requirement)

- Phones 5–7 in (<600dp): single column, full-width cards, dock at the
  bottom, type scales across 320–480dp widths.
- Large phone / foldable folded (600–840dp): wider content cap, slightly
  larger type/spacing.
- Foldable unfolded & tablets (>=840dp): two-pane — timeline left,
  Ask/contacts detail right; primary actions clear of the center crease.
- Desktop web / PC (>=1280px): centered content shell (max ~1120),
  hover states, never a stretched phone UI.
- No horizontal scrolling, no overlap/truncation, tap targets >=56px,
  instant reflow on resize/rotation/unfold.

## FridgeToMeal lessons (baked in, never repeated)

- Auth readiness: await auth.authStateReady() first.
- Glass on Android: two-layer structure (outer view background+shadow,
  inner overflow-hidden clips the BlurView) on EVERY frosted surface.
- vercel.json ships "cleanUrls": true from day one; verify a /settings
  reload on the live site at publish time.
- One version source: app.json/package.json only; About reads it.
- Visible feedback: every state-changing tap confirms where the user is
  looking (scroll/highlight/confirm in place).

## Self-check (builder fills honestly before publishing)

- Home (quality / distinctness): 90% / 95%
- Ask (quality / distinctness): 88% / 92%
- Contacts (quality / distinctness): 88% / 90%
- Welcome / Add reminder / Detail (quality / distinctness): 88% / 90%
- Settings / Help (quality / distinctness): 85% / 85%
- Could any screen be mistaken for BudgetBuddy, CivicHelper or any
  earlier app? No. Sunrise amber on warm cream, DM Serif Display
  (the first serif display face among the daily apps), Atkinson
  Hyperlegible body, a vertical day timeline home, and a solid
  warm-cream big-button dock (Today / Ask / Contacts, 64px buttons)
  share no home structure, navigation chrome, or display font with
  BudgetBuddy (violet + lime, Space Grotesk, budget ring, flat white
  tab bar), CivicHelper (stamp red + postmark blue, Archivo, document
  timeline, dark ink bar), or any earlier app. Settings/Help reuse
  the standard account-screen pattern by design, but in ElderEase
  tokens (amber, serif titles, 18pt body, 56px targets).
- Responsive widths checked locally (static): code-level only.
  Breakpoints implemented per spec (<600 single column, 600–840
  wider cap, ≥840 two-pane, ≥1280 centred shell max 1120) and the
  web export serves every route, but the 360/390/430/600/840/1024/1440
  visual width checks were NOT done in a live browser in this build
  run — verify them on the live Vercel deploy at publish time.

Notes on the build (2026-11-20, local build run): the pull-to-refresh
sun motif is scrubbed from the iOS-style overscroll offset and plays
its ray-pulse loop while refreshing; on Android the stock
RefreshControl drives it (no overscroll offset), and on web the sun
button in the header runs the same animation. The demo answerer gives
the "ask your doctor or pharmacist" disclaimer on every answer,
including the what-to-wear branch. Weather falls back to labelled
DEMO weather on any Open-Meteo failure. The Android bundle contains
getReactNativePersistence (3x) and initializeAuth (5x) with zero
browser-only persistence markers — the React Native auth build;
the literal "@firebase/auth/dist/rn" path string does not appear in
Hermes bytecode because module paths are stripped at compile time.
No Firebase project exists yet (TODO-ELDEREASE placeholders,
firebaseConfigured=false); no Gemini key is configured, so the live
AI path returns 501 until GEMINI_API_KEY is set server-side.
