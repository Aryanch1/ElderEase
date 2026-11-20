import { useWindowDimensions } from 'react-native';

/**
 * ElderEase design tokens — one consistent system for the whole app.
 *
 * Identity: "morning sun, large print." Sunrise amber (#C97A12) is the
 * one disciplined theme color on warm cream (#FFFBF2). DM Serif Display
 * is the display face — a serif, a first among the daily apps (all
 * previous apps used grotesques: Sora, Fraunces, Bricolage Grotesque,
 * Archivo, Space Grotesk). Atkinson Hyperlegible is the body face —
 * designed for low vision, the honest, fitting choice for this audience.
 * Type is BIG by design: body never below 18pt, tap targets at least
 * 56px. Home is a vertical day timeline, not a photo hero, ledger,
 * dashboard grid, ring or document trail.
 */

export const palette = {
  // Brand — one disciplined sunrise amber.
  primary: '#C97A12',
  primaryDeep: '#8A5208',
  primaryLight: '#E9A13B',
  primarySoft: '#FDEBC8',
  primaryPale: '#FFF6E3',
  // Sage green — "done / healthy" only.
  accent: '#4D7C0F',
  accentDeep: '#3A5E0B',
  accentSoft: '#EDF5DC',
  // SOS red — emergency only, never decoration.
  sos: '#B3261E',
  sosSoft: '#FCE8E6',
  // Neutrals (warm, ink-brown tinted so the whole UI feels one family).
  ink: '#2B2118',
  body: '#5C4A38',
  muted: '#8A7663',
  line: 'rgba(43, 33, 24, 0.12)',
  surface: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.66)',
  glassStrong: 'rgba(255, 255, 255, 0.82)',
  sheet: '#FFFDF8',
  // Aurora background stops — warm cream sunrise.
  aurora: ['#FFFBF2', '#FFF3DC', '#FDEBC8'] as const,
  // Status.
  warning: '#8A5208',
  warningSoft: '#FDEBC8',
  error: '#B3261E',
  errorSoft: '#FCE8E6',
  success: '#4D7C0F',
  successSoft: '#EDF5DC',
} as const;

/** Avatar colors (cycled by contact index). */
export const memberColors = [
  '#C97A12',
  '#4D7C0F',
  '#B3261E',
  '#3E6B8E',
  '#7C55A8',
  '#8A5208',
  '#5C4A38',
] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  card: 30,
  sheet: 38,
  pill: 999,
  input: 24,
} as const;

/**
 * Display typeface — DM Serif Display (bundled via
 * @expo-google-fonts/dm-serif-display, loaded in app/_layout.tsx).
 * Body — Atkinson Hyperlegible (bundled via
 * @expo-google-fonts/atkinson-hyperlegible).
 */
export const font = {
  display: 'DMSerifDisplay_400Regular',
  displayItalic: 'DMSerifDisplay_400Regular_Italic',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
  bodyItalic: 'AtkinsonHyperlegible_400Regular_Italic',
} as const;

/** Base type scale. Large = default; Extra large multiplies by 1.18 (see scaledType). */
export const type = {
  display: { fontFamily: font.display, fontSize: 48, lineHeight: 52 },
  displayWide: { fontFamily: font.display, fontSize: 56, lineHeight: 60 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  sectionTitle: { fontFamily: font.display, fontSize: 22, lineHeight: 28 },
  subtitle: { fontFamily: font.bodyBold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: font.body, fontSize: 18, lineHeight: 27, fontWeight: '400' as const },
  bodyStrong: { fontFamily: font.bodyBold, fontSize: 18, lineHeight: 27, fontWeight: '700' as const },
  caption: { fontFamily: font.bodyBold, fontSize: 14, lineHeight: 20, fontWeight: '700' as const, letterSpacing: 0.4 },
  label: { fontFamily: font.bodyBold, fontSize: 13, lineHeight: 17, fontWeight: '700' as const, letterSpacing: 1.2 },
  reminderTitle: { fontFamily: font.bodyBold, fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  reminderTime: { fontFamily: font.bodyBold, fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  weatherTemp: { fontFamily: font.display, fontSize: 40, lineHeight: 44 },
} as const;

export type TextSize = 'large' | 'xlarge';

/** Scale the base type tokens for the user's text-size choice. */
export function scaledType(textSize: TextSize) {
  if (textSize === 'large') return type;
  const factor = 1.18;
  const scale = (style: { fontSize: number; lineHeight: number }) => ({
    ...style,
    fontSize: Math.round(style.fontSize * factor),
    lineHeight: Math.round(style.lineHeight * factor),
  });
  return {
    ...type,
    display: scale(type.display),
    displayWide: scale(type.displayWide),
    title: scale(type.title),
    sectionTitle: scale(type.sectionTitle),
    subtitle: scale(type.subtitle),
    body: scale(type.body),
    bodyStrong: scale(type.bodyStrong),
    caption: scale(type.caption),
    label: scale(type.label),
    reminderTitle: scale(type.reminderTitle),
    reminderTime: scale(type.reminderTime),
    weatherTemp: scale(type.weatherTemp),
  };
}

export const shadows = {
  card: {
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    shadowColor: '#C97A12',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  float: {
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export type Breakpoint = 'compact' | 'medium' | 'wide' | 'desktop';

export interface Responsive {
  breakpoint: Breakpoint;
  width: number;
  /** Max width for the centered content column. */
  contentMaxWidth: number;
  /** Horizontal page padding. */
  pad: number;
  /** Columns for card grids. */
  columns: number;
  /** Two-pane list + detail layout (foldable unfolded / tablet / desktop). */
  twoPane: boolean;
  display: typeof type.display | typeof type.displayWide;
}

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  if (width < 600) {
    return {
      breakpoint: 'compact',
      width,
      contentMaxWidth: width,
      pad: 20,
      columns: 1,
      twoPane: false,
      display: type.display,
    };
  }
  if (width < 840) {
    return {
      breakpoint: 'medium',
      width,
      contentMaxWidth: 640,
      pad: 28,
      columns: 1,
      twoPane: false,
      display: type.displayWide,
    };
  }
  if (width < 1280) {
    return {
      breakpoint: 'wide',
      width,
      contentMaxWidth: 1024,
      pad: 32,
      columns: 2,
      twoPane: true,
      display: type.displayWide,
    };
  }
  return {
    breakpoint: 'desktop',
    width,
    contentMaxWidth: 1120,
    pad: 40,
    columns: 3,
    twoPane: true,
    display: type.displayWide,
  };
}
