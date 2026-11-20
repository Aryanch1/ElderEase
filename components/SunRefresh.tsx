import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '../lib/theme';

/**
 * Rising-sun refresh motif. `progress` (0–1) is scrubbed by the pull
 * distance: the sun disc rises and fills with amber. Past the
 * threshold, `refreshing` plays the ray-pulse loop until data returns.
 * On web the same animation is wired to a sun button in the header.
 */
export default function SunRefresh({
  progress,
  refreshing,
}: {
  progress: number;
  refreshing: boolean;
}) {
  const rays = useSharedValue(1);
  useEffect(() => {
    if (refreshing) {
      rays.value = withRepeat(
        withSequence(withTiming(1.25, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        false,
      );
    } else {
      rays.value = withTiming(1, { duration: 300 });
    }
  }, [refreshing, rays]);
  const rayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rays.value }, { translateY: -8 + progress * 26 }],
  }));
  const fill = Math.max(18, Math.round(233 - progress * 60));
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.sun, rayStyle]}>
        <View style={[styles.disc, { backgroundColor: `rgb(201, 122, ${fill})` }]} />
        <Text style={styles.face}>☀</Text>
      </Animated.View>
      <Text style={styles.label}>{refreshing ? 'Warming up your day…' : 'Pull to refresh'}</Text>
    </View>
  );
}

/** Header sun button (web): tap to refresh with a spring press. */
export function SunButton({ onPress, spinning }: { onPress: () => void; spinning: boolean }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    if (spinning) {
      spin.value = withRepeat(withTiming(360, { duration: 900 }), -1, false);
    } else {
      spin.value = withSpring(0, { damping: 14, stiffness: 300 });
    }
  }, [spinning, spin]);
  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Refresh"
      style={styles.button}
      hitSlop={8}
    >
      <Animated.View style={animated}>
        <Text style={styles.buttonText}>☀</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 12 },
  sun: { alignItems: 'center', height: 64, justifyContent: 'center', width: 64 },
  disc: {
    position: 'absolute',
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
  },
  face: { fontSize: 30, color: '#FFF6E3' },
  label: { color: palette.muted, fontSize: 14, fontWeight: '700', marginTop: 4 },
  button: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  buttonText: { fontSize: 28, color: palette.primaryDeep },
});
