import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useApp } from '../lib/store';
import { palette, radii, spacing, type } from '../lib/theme';
import { formatTime, REMINDER_KIND_GLYPHS, REMINDER_KIND_LABELS, type Reminder } from '../lib/types';
import { GlassCard, SpringPress } from './ui';

/** One reminder on the day timeline — big time, big title, big Done toggle. */
export default function ReminderCard({ reminder, index }: { reminder: Reminder; index: number }) {
  const router = useRouter();
  const { toggleReminderDone } = useApp();
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <GlassCard style={styles.card}>
        <Pressable onPress={() => router.push(`/reminder/${reminder.id}`)}>
          <View style={styles.row}>
            <View style={styles.timeBox}>
              <Text style={styles.time}>{formatTime(reminder.time)}</Text>
              <Text style={styles.kind}>
                {REMINDER_KIND_GLYPHS[reminder.kind]} {REMINDER_KIND_LABELS[reminder.kind]}
              </Text>
            </View>
            <View style={styles.main}>
              <Text style={[styles.title, reminder.done && styles.titleDone]}>{reminder.title}</Text>
              {reminder.note ? <Text style={styles.note}>{reminder.note}</Text> : null}
              {reminder.isDemo ? <Text style={styles.demo}>DEMO</Text> : null}
            </View>
          </View>
        </Pressable>
        <SpringPress
          onPress={() => toggleReminderDone(reminder.id)}
          haptic
          style={styles.doneWrap}
        >
          <View style={[styles.doneButton, reminder.done && styles.doneButtonDone]}>
            <Text style={[styles.doneLabel, reminder.done && styles.doneLabelDone]}>
              {reminder.done ? '✓ Done' : 'Mark done'}
            </Text>
          </View>
        </SpringPress>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  timeBox: { width: 118 },
  time: { ...type.reminderTime, color: palette.primaryDeep },
  kind: { ...type.caption, color: palette.muted, marginTop: 4 },
  main: { flex: 1 },
  title: { ...type.reminderTitle, color: palette.ink },
  titleDone: { color: palette.muted, textDecorationLine: 'line-through' },
  note: { ...type.body, color: palette.body, marginTop: 4 },
  demo: {
    ...type.label,
    color: palette.warning,
    marginTop: spacing.sm,
  },
  doneWrap: { marginTop: spacing.md },
  doneButton: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  doneButtonDone: { backgroundColor: palette.accentSoft },
  doneLabel: { color: palette.primaryDeep, fontSize: 18, fontWeight: '800' },
  doneLabelDone: { color: palette.accentDeep },
});
