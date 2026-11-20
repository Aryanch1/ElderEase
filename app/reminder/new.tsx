import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../../components/AuroraBackground';
import { Chip, GhostButton, GlassCard, PrimaryButton, SectionHeader } from '../../components/ui';
import { useApp } from '../../lib/store';
import { palette, spacing, type, useResponsive } from '../../lib/theme';
import {
  REMINDER_KINDS,
  REMINDER_KIND_LABELS,
  REPEAT_LABELS,
  todayKey,
  type ReminderKind,
  type Repeat,
} from '../../lib/types';

/**
 * Add / edit reminder — full-screen takeover: title, kind chips, time,
 * repeat, note, Save. Visible in-place confirmation on save.
 */
export default function ReminderFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; kind?: string; title?: string }>();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { reminderById, addReminder, updateReminder } = useApp();
  const existing = params.id ? reminderById(params.id) : undefined;
  const [title, setTitle] = useState(existing?.title ?? params.title ?? '');
  const [kind, setKind] = useState<ReminderKind>(
    existing?.kind ?? (params.kind as ReminderKind) ?? 'custom',
  );
  const [hour, setHour] = useState(existing ? existing.time.split(':')[0] : '09');
  const [minute, setMinute] = useState(existing ? existing.time.split(':')[1] : '00');
  const [repeat, setRepeat] = useState<Repeat>(existing?.repeat ?? 'daily');
  const [note, setNote] = useState(existing?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const save = () => {
    if (!title.trim()) return setError('Please give the reminder a title.');
    const h = Number(hour);
    const m = Number(minute);
    if (!Number.isFinite(h) || h < 0 || h > 23 || !Number.isFinite(m) || m < 0 || m > 59) {
      return setError('Please enter a time between 00:00 and 23:59.');
    }
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (existing) {
      updateReminder(existing.id, { title, kind, time, repeat, note });
    } else {
      addReminder({ title, kind, time, date: todayKey(), repeat, note });
    }
    setError(null);
    setNotice(existing ? 'Reminder updated.' : 'Reminder saved — see it on the Today tab.');
  };

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.title}>{existing ? 'Edit reminder' : 'Add a reminder'}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <GlassCard style={styles.card}>
            <SectionHeader kicker="WHAT" title="What is it?" />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="For example: Take morning medicine"
              placeholderTextColor={palette.muted}
            />
            <View style={styles.chips}>
              {REMINDER_KINDS.map((k) => (
                <Chip key={k} label={REMINDER_KIND_LABELS[k]} selected={kind === k} onPress={() => setKind(k)} />
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <SectionHeader kicker="WHEN" title="What time?" />
            <View style={styles.timeRow}>
              <TextInput
                style={styles.timeInput}
                value={hour}
                onChangeText={(v) => setHour(v.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="09"
                placeholderTextColor={palette.muted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.colon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={minute}
                onChangeText={(v) => setMinute(v.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="00"
                placeholderTextColor={palette.muted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeHint}>24-hour time, e.g. 08:00 is 8 in the morning.</Text>
            </View>
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.chips}>
              {(['once', 'daily', 'weekdays'] as Repeat[]).map((rep) => (
                <Chip key={rep} label={REPEAT_LABELS[rep]} selected={repeat === rep} onPress={() => setRepeat(rep)} />
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <SectionHeader kicker="NOTE" title="A short note (optional)" />
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="For example: One tablet with breakfast."
              placeholderTextColor={palette.muted}
              multiline
            />
          </GlassCard>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <PrimaryButton label={existing ? 'Save changes' : 'Save reminder'} onPress={save} />
          <View style={{ height: 12 }} />
          <GhostButton label="← Back to Today" onPress={() => router.replace('/')} />
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, alignSelf: 'center', width: '100%' },
  header: { paddingBottom: spacing.sm },
  title: { ...type.title, color: palette.ink },
  scroll: { paddingBottom: 16, paddingTop: 4 },
  card: { marginBottom: spacing.md },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: 24,
    color: palette.ink,
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  noteInput: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.md },
  timeRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  timeInput: {
    backgroundColor: palette.primaryPale,
    borderRadius: 24,
    color: palette.ink,
    fontSize: 24,
    fontWeight: '700',
    minHeight: 64,
    textAlign: 'center',
    width: 88,
  },
  colon: { fontSize: 28, fontWeight: '700', color: palette.ink },
  timeHint: { ...type.body, color: palette.body, flex: 1 },
  label: { ...type.bodyStrong, color: palette.ink, marginTop: spacing.lg },
  error: { ...type.bodyStrong, color: palette.error, marginBottom: spacing.md, textAlign: 'center' },
  notice: { ...type.bodyStrong, color: palette.success, marginBottom: spacing.md, textAlign: 'center' },
});
