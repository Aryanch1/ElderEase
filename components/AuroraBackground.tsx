import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { palette } from '../lib/theme';

/** Warm sunrise aurora background — cream to soft amber, with a sun glow. */
export default function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={palette.aurora} style={StyleSheet.absoluteFill} />
      <View style={styles.sunGlow} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.aurora[0] },
  sunGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(233, 161, 59, 0.22)',
  },
  content: { flex: 1 },
});
