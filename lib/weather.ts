import type { CityOption, WeatherInfo } from './types';

export type { WeatherInfo } from './types';

const WMO_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy with frost',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

/** Demo weather — clearly labelled DEMO, never presented as live. */
export const DEMO_WEATHER: WeatherInfo = {
  tempF: 54,
  condition: 'Partly cloudy',
  code: 2,
  source: 'demo',
};

/**
 * Fetch current conditions from Open-Meteo (free, no key) for the
 * chosen city. Any failure — network, bad response, timeout — falls
 * back to the demo weather labelled DEMO, never a fake "live" reading.
 */
export async function fetchWeather(city: CityOption): Promise<WeatherInfo> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      '&current=temperature_2m,weather_code&temperature_unit=fahrenheit';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return DEMO_WEATHER;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (typeof temp !== 'number' || typeof code !== 'number') return DEMO_WEATHER;
    return {
      tempF: Math.round(temp),
      condition: WMO_LABELS[code] ?? 'Changing weather',
      code,
      source: 'live',
    };
  } catch {
    return DEMO_WEATHER;
  }
}

/** One plain-words "dress for the day" line from a weather reading. */
export function dressLine(weather: WeatherInfo): string {
  const t = weather.tempF;
  const condition = weather.condition.toLowerCase();
  let line: string;
  if (t <= 32) {
    line = 'It is freezing today. Wear a warm coat, hat, and gloves.';
  } else if (t <= 50) {
    line = 'It is cold today. Wear a warm coat and layers.';
  } else if (t <= 65) {
    line = 'It is mild today. A light jacket is a good idea.';
  } else if (t <= 80) {
    line = 'It is warm today. Light clothes are fine.';
  } else {
    line = 'It is hot today. Wear light clothes, a hat, and drink water often.';
  }
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    line += ' Take a raincoat or umbrella.';
  } else if (condition.includes('snow')) {
    line += ' Wear shoes with a good grip.';
  }
  return line;
}
