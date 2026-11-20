import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radii, spacing } from '../lib/theme';
import { SpringPress } from './ui';

const TABS = [
  { route: '/', label: 'Today', glyph: '☀' },
  { route: '/ask', label: 'Ask', glyph: '💬' },
  { route: '/contacts', label: 'Contacts', glyph: '📞' },
] as const;

/**
 * Big-button dock — the ElderEase navigation. A solid warm-cream bar
 * with three oversized labeled buttons, each at least 64px tall with
 * a large glyph above a large text label. Deliberately chunkier and
 * text-first, unlike every previous app's tab bar.
 */
export default function BigDock() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const current = segments[0] ?? '';
  const activeRoute =
    current === '' || current === 'index'
      ? '/'
      : current === 'ask'
        ? '/ask'
        : current === 'contacts'
          ? '/contacts'
          : null;
  if (activeRoute === null) return null;
  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab) => {
        const active = tab.route === activeRoute;
        return (
          <SpringPress
            key={tab.route}
            onPress={() => router.replace(tab.route as never)}
            style={styles.press}
          >
            <View style={[styles.button, active && styles.buttonActive]}>
              <Text style={[styles.glyph, active && styles.glyphActive]}>{tab.glyph}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </View>
          </SpringPress>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: palette.sheet,
    borderTopColor: palette.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -4px 24px rgba(43,33,24,0.08)' } : {}),
  },
  press: { flex: 1 },
  button: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radii.card,
    justifyContent: 'center',
    minHeight: 64,
    paddingVertical: 6,
  },
  buttonActive: { backgroundColor: palette.primarySoft },
  glyph: { color: palette.muted, fontSize: 26 },
  glyphActive: { color: palette.primaryDeep },
  label: { color: palette.muted, fontSize: 17, fontWeight: '800', marginTop: 2 },
  labelActive: { color: palette.primaryDeep },
});
