import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from './firebase';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { sampleQuestions } from './ask';
import { firebaseConfigured } from './config';
import { signInWithGoogle } from './google';
import type { TextSize } from './theme';
import {
  DEFAULT_CITY,
  todayKey,
  type AskHistoryEntry,
  type CityOption,
  type Contact,
  type Reminder,
  type ReminderKind,
  type Repeat,
} from './types';

const REMINDERS_KEY = 'elderease:reminders:v1';
const CONTACTS_KEY = 'elderease:contacts:v1';
const ASK_HISTORY_KEY = 'elderease:ask-history:v1';
const SEEDED_KEY = 'elderease:seeded:v1';
const TEXT_SIZE_KEY = 'elderease:text-size:v1';
const CITY_KEY = 'elderease:city:v1';
const ADDRESS_KEY = 'elderease:home-address:v1';
const HISTORY_LIMIT = 20;

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  /** 'google.com' or 'password' — how this account signs in. */
  provider: string | null;
}

export interface AppState {
  reminders: Reminder[];
  contacts: Contact[];
  askHistory: AskHistoryEntry[];
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  city: CityOption;
  setCity: (city: CityOption) => void;
  homeAddress: string;
  setHomeAddress: (address: string) => void;
  /** Today's reminders, time order. */
  todayReminders: Reminder[];
  /** Today's reminders not yet done. */
  remainingToday: number;
  primaryContact: Contact | undefined;
  user: AuthUser | null;
  authReady: boolean;
  guest: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  setAvatarData: (dataUrl: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  addReminder: (input: {
    title: string;
    kind: ReminderKind;
    time: string;
    date: string;
    repeat: Repeat;
    note: string;
  }) => Reminder;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  toggleReminderDone: (id: string) => void;
  deleteReminder: (id: string) => void;
  addContact: (input: { name: string; relation: string; phone: string; primary?: boolean }) => Contact;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  setPrimaryContact: (id: string) => void;
  addAskHistory: (entry: Omit<AskHistoryEntry, 'id' | 'at'>) => void;
  clearHistory: () => void;
  clearDemoData: () => void;
  reminderById: (id: string) => Reminder | undefined;
  contactById: (id: string) => Contact | undefined;
}

const AppContext = createContext<AppState | null>(null);

function loadJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** First-run demo content so the timeline and contacts show data immediately. */
function seedDemo(): { reminders: Reminder[]; contacts: Contact[]; askHistory: AskHistoryEntry[] } {
  const now = Date.now();
  const today = todayKey();
  const reminders: Reminder[] = [
    { id: 'demo-rem-1', title: 'Take morning medicine', kind: 'medicine', time: '08:00', date: today, repeat: 'daily', note: 'One tablet with breakfast.', done: false, createdAt: now - 5 * 60000, isDemo: true },
    { id: 'demo-rem-2', title: 'Morning walk', kind: 'walk', time: '10:30', date: today, repeat: 'daily', note: 'A gentle walk around the block.', done: false, createdAt: now - 4 * 60000, isDemo: true },
    { id: 'demo-rem-3', title: 'Drink some water', kind: 'custom', time: '14:00', date: today, repeat: 'daily', note: 'A full glass of water.', done: false, createdAt: now - 3 * 60000, isDemo: true },
    { id: 'demo-rem-4', title: 'Call Maya', kind: 'call', time: '16:00', date: today, repeat: 'daily', note: 'Check in with Maya.', done: false, createdAt: now - 2 * 60000, isDemo: true },
    { id: 'demo-rem-5', title: 'Take dinner medicine', kind: 'medicine', time: '19:00', date: today, repeat: 'daily', note: 'One tablet with dinner.', done: false, createdAt: now - 60000, isDemo: true },
  ];
  const contacts: Contact[] = [
    { id: 'demo-con-1', name: 'Maya', relation: 'Daughter', phone: '(555) 010-1234', primary: true, createdAt: now - 5 * 60000, isDemo: true },
    { id: 'demo-con-2', name: 'Dr. Patel', relation: 'Doctor', phone: '(555) 010-5678', primary: false, createdAt: now - 4 * 60000, isDemo: true },
    { id: 'demo-con-3', name: 'Joe', relation: 'Neighbor', phone: '(555) 010-9012', primary: false, createdAt: now - 3 * 60000, isDemo: true },
  ];
  const askHistory: AskHistoryEntry[] = sampleQuestions().map((q, i) => ({
    id: `demo-ask-${i}`,
    question: q,
    answer: 'Demo answer — ask this question on the Ask screen to see the companion answer it.',
    source: 'demo' as const,
    at: now - (3 - i) * 60000,
  }));
  return { reminders, contacts, askHistory };
}

async function upsertProfile(u: User): Promise<void> {
  if (!firebaseConfigured) return;
  try {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    const base = {
      displayName: u.displayName ?? '',
      email: u.email ?? '',
      photoURL: u.photoURL ?? '',
      lastLoginAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(ref, base, { merge: true });
    }
  } catch {
    // Sync is best-effort; the app keeps working offline.
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [askHistory, setAskHistory] = useState<AskHistoryEntry[]>([]);
  const [textSize, setTextSizeState] = useState<TextSize>('large');
  const [city, setCityState] = useState<CityOption>(DEFAULT_CITY);
  const [homeAddress, setHomeAddressState] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [guest, setGuest] = useState(false);
  const remindersRef = useRef<Reminder[]>([]);
  const contactsRef = useRef<Contact[]>([]);
  const askHistoryRef = useRef<AskHistoryEntry[]>([]);
  const historyLoadedRef = useRef(false);
  const unsubsRef = useRef<(() => void)[]>([]);

  // Local data loads once at startup; first launch seeds demo content.
  useEffect(() => {
    void (async () => {
      const [rRaw, cRaw, aRaw, seeded, tsRaw, cityRaw, addrRaw] = await Promise.all([
        AsyncStorage.getItem(REMINDERS_KEY),
        AsyncStorage.getItem(CONTACTS_KEY),
        AsyncStorage.getItem(ASK_HISTORY_KEY),
        AsyncStorage.getItem(SEEDED_KEY),
        AsyncStorage.getItem(TEXT_SIZE_KEY),
        AsyncStorage.getItem(CITY_KEY),
        AsyncStorage.getItem(ADDRESS_KEY),
      ]);
      const r = loadJson<Reminder[]>(rRaw);
      const c = loadJson<Contact[]>(cRaw);
      const a = loadJson<AskHistoryEntry[]>(aRaw);
      if (tsRaw === 'large' || tsRaw === 'xlarge') setTextSizeState(tsRaw);
      const savedCity = loadJson<CityOption>(cityRaw);
      if (savedCity) setCityState(savedCity);
      if (addrRaw) setHomeAddressState(addrRaw);
      if (r && r.length > 0) {
        setReminders(r);
        setContacts(c ?? []);
        setAskHistory(a ?? []);
      } else if (!seeded) {
        const demo = seedDemo();
        setReminders(demo.reminders);
        setContacts(demo.contacts);
        setAskHistory(demo.askHistory);
        await AsyncStorage.setItem(SEEDED_KEY, '1');
      }
      historyLoadedRef.current = true;
    })();
  }, []);

  // Local mirrors.
  useEffect(() => {
    remindersRef.current = reminders;
    AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders)).catch(() => undefined);
  }, [reminders]);
  useEffect(() => {
    contactsRef.current = contacts;
    AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)).catch(() => undefined);
  }, [contacts]);
  useEffect(() => {
    askHistoryRef.current = askHistory;
    if (!historyLoadedRef.current) return;
    AsyncStorage.setItem(ASK_HISTORY_KEY, JSON.stringify(askHistory)).catch(() => undefined);
  }, [askHistory]);
  useEffect(() => {
    AsyncStorage.setItem(TEXT_SIZE_KEY, textSize).catch(() => undefined);
  }, [textSize]);
  useEffect(() => {
    AsyncStorage.setItem(CITY_KEY, JSON.stringify(city)).catch(() => undefined);
  }, [city]);
  useEffect(() => {
    AsyncStorage.setItem(ADDRESS_KEY, homeAddress).catch(() => undefined);
  }, [homeAddress]);

  // Auth state: profile write, cloud subscriptions.
  // Readiness waits for Firebase to finish restoring any persisted
  // session from storage — the gate must not decide "signed out" (and
  // show Welcome) before the saved session has had its chance to load.
  useEffect(() => {
    let alive = true;
    void auth.authStateReady().then(() => {
      if (alive) setAuthReady(true);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      for (const fn of unsubsRef.current) fn();
      unsubsRef.current = [];
      if (!u) {
        setUser(null);
        return;
      }
      setUser({
        uid: u.uid,
        name: u.displayName,
        email: u.email,
        photo: u.photoURL,
        provider: u.providerData[0]?.providerId ?? null,
      });
      void upsertProfile(u);
      if (!firebaseConfigured) return;

      const subscribe = <T,>(
        colName: string,
        apply: (items: T[]) => void,
        local: () => T[],
        idOf: (item: T) => string,
      ) => {
        const col = collection(db, 'users', u.uid, colName);
        unsubsRef.current.push(
          onSnapshot(
            col,
            (snap) => {
              apply(snap.docs.map((d) => d.data() as T));
            },
            () => undefined,
          ),
        );
        // One-time merge: anything saved locally before sign-in joins the account.
        void (async () => {
          try {
            const cloud = await getDocs(col);
            const cloudIds = new Set(cloud.docs.map((d) => d.id));
            for (const item of local()) {
              const id = idOf(item);
              if (!cloudIds.has(id)) {
                await setDoc(
                  doc(db, 'users', u.uid, colName, id),
                  item as unknown as Record<string, unknown>,
                );
              }
            }
          } catch {
            // Best-effort merge only.
          }
        })();
      };
      subscribe<Reminder>('reminders', setReminders, () => remindersRef.current, (r) => r.id);
      subscribe<Contact>('contacts', setContacts, () => contactsRef.current, (c) => c.id);
      subscribe<AskHistoryEntry>('askHistory', setAskHistory, () => askHistoryRef.current, (h) => h.id);

      // Profile doc: a custom avatar / edited name stored there overrides
      // the auth copy.
      void (async () => {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUser((prev) =>
              prev && prev.uid === u.uid
                ? {
                    ...prev,
                    name: (data.displayName as string) || prev.name,
                    photo: (data.photoData as string) || prev.photo,
                  }
                : prev,
            );
          }
        } catch {
          // Keep the auth profile.
        }
      })();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const todayReminders = useMemo(
    () =>
      reminders
        .filter((r) => r.date === todayKey())
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reminders],
  );

  const remainingToday = useMemo(
    () => todayReminders.filter((r) => !r.done).length,
    [todayReminders],
  );

  const primaryContact = useMemo(
    () => contacts.find((c) => c.primary) ?? contacts[0],
    [contacts],
  );

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = name.trim();
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
        setUser({
          uid: cred.user.uid,
          name: cleanName,
          email: cred.user.email,
          photo: null,
          provider: 'password',
        });
        void upsertProfile({ ...cred.user, displayName: cleanName } as User);
      }
    },
    [],
  );

  const updateDisplayName = useCallback(async (name: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const clean = name.trim();
    await updateProfile(currentUser, { displayName: clean });
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { displayName: clean }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, name: clean } : prev));
  }, []);

  const setAvatarData = useCallback(async (dataUrl: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { photoData: dataUrl }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
  }, []);

  const sendPasswordReset = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return;
    await sendPasswordResetEmail(auth, currentUser.email);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // Back to the welcome screen — the gate routes there as soon as the
    // user is signed out and not a guest.
    setGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    // Deliberately NOT persisted: guest lasts for this visit only, so the
    // next open asks for sign-in again. A signed-in user, by contrast,
    // stays signed in (Firebase Auth persistence).
    setGuest(true);
  }, []);

  const syncDoc = useCallback(
    (colName: string, id: string, data: unknown) => {
      if (!user || !firebaseConfigured) return;
      void setDoc(doc(db, 'users', user.uid, colName, id), data).catch(() => undefined);
    },
    [user],
  );

  const deleteDocCloud = useCallback(
    (colName: string, id: string) => {
      if (!user || !firebaseConfigured) return;
      void deleteDoc(doc(db, 'users', user.uid, colName, id)).catch(() => undefined);
    },
    [user],
  );

  const setTextSize = useCallback((size: TextSize) => setTextSizeState(size), []);
  const setCity = useCallback((c: CityOption) => setCityState(c), []);
  const setHomeAddress = useCallback((address: string) => setHomeAddressState(address), []);

  const addReminder = useCallback(
    (input: {
      title: string;
      kind: ReminderKind;
      time: string;
      date: string;
      repeat: Repeat;
      note: string;
    }): Reminder => {
      const reminder: Reminder = {
        id: uid('rem'),
        title: input.title.trim(),
        kind: input.kind,
        time: input.time,
        date: input.date,
        repeat: input.repeat,
        note: input.note.trim(),
        done: false,
        createdAt: Date.now(),
      };
      setReminders((prev) => [...prev, reminder]);
      syncDoc('reminders', reminder.id, reminder);
      return reminder;
    },
    [syncDoc],
  );

  const updateReminder = useCallback(
    (id: string, patch: Partial<Reminder>) => {
      setReminders((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
        const updated = next.find((r) => r.id === id);
        if (updated) syncDoc('reminders', id, updated);
        return next;
      });
    },
    [syncDoc],
  );

  const toggleReminderDone = useCallback(
    (id: string) => {
      setReminders((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
        const updated = next.find((r) => r.id === id);
        if (updated) syncDoc('reminders', id, updated);
        return next;
      });
    },
    [syncDoc],
  );

  const deleteReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      deleteDocCloud('reminders', id);
    },
    [deleteDocCloud],
  );

  const addContact = useCallback(
    (input: { name: string; relation: string; phone: string; primary?: boolean }): Contact => {
      const contact: Contact = {
        id: uid('con'),
        name: input.name.trim(),
        relation: input.relation.trim() || 'Contact',
        phone: input.phone.trim(),
        primary: Boolean(input.primary),
        createdAt: Date.now(),
      };
      setContacts((prev) => {
        const next = contact.primary
          ? prev.map((c) => ({ ...c, primary: false }))
          : prev;
        return [...next, contact];
      });
      syncDoc('contacts', contact.id, contact);
      return contact;
    },
    [syncDoc],
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<Contact>) => {
      setContacts((prev) => {
        const next = prev.map((c) => {
          if (c.id !== id) return patch.primary ? { ...c, primary: false } : c;
          return { ...c, ...patch };
        });
        const updated = next.find((c) => c.id === id);
        if (updated) syncDoc('contacts', id, updated);
        return next;
      });
    },
    [syncDoc],
  );

  const deleteContact = useCallback(
    (id: string) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      deleteDocCloud('contacts', id);
    },
    [deleteDocCloud],
  );

  const setPrimaryContact = useCallback(
    (id: string) => {
      setContacts((prev) => {
        const next = prev.map((c) => ({ ...c, primary: c.id === id }));
        const updated = next.find((c) => c.id === id);
        if (updated) syncDoc('contacts', id, updated);
        return next;
      });
    },
    [syncDoc],
  );

  const addAskHistory = useCallback(
    (entry: Omit<AskHistoryEntry, 'id' | 'at'>) => {
      const full: AskHistoryEntry = { ...entry, id: uid('ask'), at: Date.now() };
      setAskHistory((prev) => [full, ...prev].slice(0, HISTORY_LIMIT));
      syncDoc('askHistory', full.id, full);
    },
    [syncDoc],
  );

  const clearHistory = useCallback(() => {
    setAskHistory([]);
    if (user && firebaseConfigured) {
      void (async () => {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'askHistory'));
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        } catch {
          // The subscription will reconcile the visible list.
        }
      })();
    }
  }, [user]);

  const clearDemoData = useCallback(() => {
    const demoReminderIds = new Set(remindersRef.current.filter((r) => r.isDemo).map((r) => r.id));
    const demoContactIds = new Set(contactsRef.current.filter((c) => c.isDemo).map((c) => c.id));
    setReminders((prev) => prev.filter((r) => !r.isDemo));
    setContacts((prev) => prev.filter((c) => !c.isDemo));
    setAskHistory((prev) => prev.filter((h) => !h.id.startsWith('demo-ask')));
    if (user && firebaseConfigured) {
      for (const id of demoReminderIds) {
        void deleteDoc(doc(db, 'users', user.uid, 'reminders', id)).catch(() => undefined);
      }
      for (const id of demoContactIds) {
        void deleteDoc(doc(db, 'users', user.uid, 'contacts', id)).catch(() => undefined);
      }
    }
  }, [user]);

  const reminderById = useCallback(
    (id: string) => reminders.find((r) => r.id === id),
    [reminders],
  );

  const contactById = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts],
  );

  const value = useMemo<AppState>(
    () => ({
      reminders,
      contacts,
      askHistory,
      textSize,
      setTextSize,
      city,
      setCity,
      homeAddress,
      setHomeAddress,
      todayReminders,
      remainingToday,
      primaryContact,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      addReminder,
      updateReminder,
      toggleReminderDone,
      deleteReminder,
      addContact,
      updateContact,
      deleteContact,
      setPrimaryContact,
      addAskHistory,
      clearHistory,
      clearDemoData,
      reminderById,
      contactById,
    }),
    [
      reminders,
      contacts,
      askHistory,
      textSize,
      setTextSize,
      city,
      setCity,
      homeAddress,
      setHomeAddress,
      todayReminders,
      remainingToday,
      primaryContact,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      addReminder,
      updateReminder,
      toggleReminderDone,
      deleteReminder,
      addContact,
      updateContact,
      deleteContact,
      setPrimaryContact,
      addAskHistory,
      clearHistory,
      clearDemoData,
      reminderById,
      contactById,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
