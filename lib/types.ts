/** ElderEase shared types. Dates are 'YYYY-MM-DD' strings; times are 'HH:MM' (24h). */

export type ReminderKind = 'medicine' | 'appointment' | 'call' | 'meal' | 'walk' | 'custom';

export const REMINDER_KINDS: ReminderKind[] = [
  'medicine',
  'appointment',
  'call',
  'meal',
  'walk',
  'custom',
];

export const REMINDER_KIND_LABELS: Record<ReminderKind, string> = {
  medicine: 'Medicine',
  appointment: 'Appointment',
  call: 'Call',
  meal: 'Meal',
  walk: 'Walk',
  custom: 'Custom',
};

export const REMINDER_KIND_GLYPHS: Record<ReminderKind, string> = {
  medicine: '💊',
  appointment: '🗓',
  call: '📞',
  meal: '🍽',
  walk: '🚶',
  custom: '✦',
};

export type Repeat = 'once' | 'daily' | 'weekdays';

export const REPEAT_LABELS: Record<Repeat, string> = {
  once: 'Once',
  daily: 'Every day',
  weekdays: 'Weekdays',
};

export interface Reminder {
  id: string;
  title: string;
  kind: ReminderKind;
  /** 'HH:MM' 24-hour time. */
  time: string;
  /** 'YYYY-MM-DD' — the day this reminder belongs to. */
  date: string;
  repeat: Repeat;
  note: string;
  done: boolean;
  /** Epoch milliseconds the reminder was added. */
  createdAt: number;
  /** Seeded demo content — clearable from Settings. */
  isDemo?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  /** Phone number, e.g. (555) 010-1234. Demo contacts use fictional 555 numbers. */
  phone: string;
  primary: boolean;
  /** Epoch milliseconds the contact was added. */
  createdAt: number;
  /** Seeded demo content — clearable from Settings. */
  isDemo?: boolean;
}

export interface AskHistoryEntry {
  id: string;
  question: string;
  answer: string;
  source: 'live' | 'demo';
  /** Epoch milliseconds the question was asked. */
  at: number;
}

export type AskSource = 'live' | 'demo';

export interface AskResponse {
  answer: string;
  source: AskSource;
}

export interface CityOption {
  name: string;
  /** Latitude. */
  lat: number;
  /** Longitude. */
  lon: number;
}

export const CITIES: CityOption[] = [
  { name: 'Glassboro, NJ', lat: 39.7026, lon: -75.1119 },
  { name: 'Philadelphia, PA', lat: 39.9526, lon: -75.1652 },
  { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  { name: 'Newark, NJ', lat: 40.7357, lon: -74.1724 },
  { name: 'Cherry Hill, NJ', lat: 39.9345, lon: -75.0306 },
  { name: 'Camden, NJ', lat: 39.9259, lon: -75.1196 },
  { name: 'Trenton, NJ', lat: 40.2206, lon: -74.7597 },
  { name: 'Atlantic City, NJ', lat: 39.3643, lon: -74.4229 },
];

export const DEFAULT_CITY = CITIES[0];

export interface WeatherInfo {
  /** Temperature in Fahrenheit. */
  tempF: number;
  /** Plain-words condition, e.g. 'Clear sky'. */
  condition: string;
  /** WMO weather code from Open-Meteo. */
  code: number;
  /** 'live' when it came from Open-Meteo, 'demo' when it is the fallback. */
  source: 'live' | 'demo';
}

/** 'YYYY-MM-DD' for today in local time. */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** '8:00 AM' from a 'HH:MM' time string. */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** 'Friday, November 20, 2026' from a Date. */
export function formatDayLabel(d = new Date()): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** 'Good morning' / 'Good afternoon' / 'Good evening' by local hour. */
export function greetingFor(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Morning / Afternoon / Evening section for a 'HH:MM' time. */
export function daypart(time: string): 'Morning' | 'Afternoon' | 'Evening' {
  const h = Number(time.split(':')[0]);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
