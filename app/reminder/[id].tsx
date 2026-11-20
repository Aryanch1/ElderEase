import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../../components/AuroraBackground';
import { EmptyState, GhostButton, GlassCard, PrimaryButton } from '../../components/ui';
import { useApp } from '../../lib/store';
import { palette, spacing, type, useResponsive } from '../../lib/theme';
import {
  formatTime,
  REMINDER_KIND_GLYPHS,
  REMINDER_KIND_LABELS,
  REPEAT_LABELS,
} from '../../lib/types';

/** Reminder detail — full-screen takeover: big time + title, kind, note, repeat, actions. */
export default function ReminderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { reminderById, toggleReminderDone, deleteReminder } = useApp();
  const reminder = reminderById(params.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!reminder) {
    return (
      <AuroraBackground>
        <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad, paddingTop: Math.max(insets.top, 12) }]}>
          <EmptyState
            glyph="☀"
            title="Reminder not found"
            body="It may have been deleted. Go back to Today to see your reminders."
            actionLabel="Back to Today"
            onAction={() => router.replace('/')}
          />
        </View>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.kicker}>
            {REMINDER_KIND_GLYPHS[reminder.kind]} {REMINDER_KIND_LABELS[reminder.kind].toUpperCase()}
          </Text>
          <Text style={styles.time}>{formatTime(reminder.time)}</Text>
          <Text style={styles.title}>{reminder.title}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <GlassCard style={styles.card}>
            <Text style={styles.row}>
              <Text style={styles.label}>Repeats: </Text>
              {REPEAT_LABELS[reminder.repeat]}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Status: </Text>
              {reminder.done ? 'Done ✓' : 'Not done yet'}
            </Text>
            {reminder.note ? (
              <Text style={styles.note}>{reminder.note}</Text>
            ) : (
              <Text style={styles.row}>No note for this reminder.</Text>
            )}
            {reminder.isDemo ? <Text style={styles.demo}>DEMO reminder</Text> : null}
          </GlassCard>

          <PrimaryButton
            label={reminder.done ? 'Mark not done' : 'Mark done'}
            onPress={() => {
              toggleReminderDone(reminder.id);
              setNotice(reminder.done ? 'Marked not done.' : 'Well done — marked as done.');
            }}
          />
          <View style={{ height: 12 }} />
          <GhostButton
            label="Edit reminder"
            onPress={() => router.push({ pathname: '/reminder/new', params: { id: reminder.id } })}
          />
          <View style={{ height: 12 }} />
          {confirmDelete ? (
            <GlassCard style={styles.deleteCard}>
              <Text style={styles.deleteText}>Delete this reminder for good?</Text>
              <PrimaryButton
                label="Yes, delete it"
                onPress={() => {
                  deleteReminder(reminder.id);
                  router.replace('/');
                }}
              />
              <View style={{ height: 12 }} />
              <GhostButton label="Keep it" onPress={() => setConfirmDelete(false)} />
            </GlassCard>
          ) : (
            <GhostButton label="Delete reminder" onPress={() => setConfirmDelete(true)} />
          )}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.back} onPress={() => router.replace('/')}>
            ← Back to Today
          </Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, alignSelf: 'center', width: '100%' },
  header: { paddingBottom: spacing.sm },
  kicker: { ...type.label, color: palette.primary },
  time: { ...type.weatherTemp, color: palette.primaryDeep, marginTop: 4 },
  title: { ...type.title, color: palette.ink, marginTop: 4 },
  scroll: { paddingBottom: 16, paddingTop: 4 },
  card: { marginBottom: spacing.md },
  row: { ...type.body, color: palette.body, marginBottom: spacing.sm },
  label: { ...type.bodyStrong, color: palette.ink },
  note: { ...type.body, color: palette.body, marginTop: spacing.sm },
  demo: { ...type.label, color: palette.warning, marginTop: spacing.sm },
  deleteCard: { gap: 12 },
  deleteText: { ...type.bodyStrong, color: palette.error, textAlign: 'center' },
  notice: { ...type.bodyStrong, color: palette.success, marginTop: spacing.md, textAlign: 'center' },
  back: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.lg },
});
