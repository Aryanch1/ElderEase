import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../components/AuroraBackground';
import BigDock from '../components/BigDock';
import { BouncingDots, Chip, DemoBadge, GlassCard, LiveBadge, PrimaryButton, SectionHeader } from '../components/ui';
import { ASK_DISCLAIMER, askCompanion, sampleQuestions } from '../lib/ask';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';
import type { AskSource } from '../lib/types';

/**
 * Ask — the AI companion. Big input, suggested question chips, answers
 * in large type with short sentences, a "not medical advice" disclaimer
 * on every answer, DEMO vs LIVE badge always honest, history with
 * one-tap re-use, and "Make a reminder from this" when the answer
 * contains a time or task.
 */
export default function AskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { askHistory, addAskHistory, addReminder } = useApp();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [source, setSource] = useState<AskSource>('demo');
  const [asked, setAsked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setNotice('Please type a question first.');
      return;
    }
    setBusy(true);
    setNotice(null);
    setAnswer(null);
    const result = await askCompanion(trimmed);
    setAnswer(result.answer);
    setSource(result.source);
    setAsked(trimmed);
    addAskHistory({ question: trimmed, answer: result.answer, source: result.source });
    setBusy(false);
  };

  const makeReminder = () => {
    if (!asked) return;
    addReminder({
      title: asked.length > 60 ? `${asked.slice(0, 57)}…` : asked,
      kind: 'custom',
      time: '09:00',
      date: new Date().toISOString().slice(0, 10),
      repeat: 'once',
      note: 'From the Ask companion.',
    });
    setNotice('Reminder added to today at 9:00 AM — see it on the Today tab.');
  };

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.title}>Ask in plain words</Text>
          <Text style={styles.subtitle}>
            Everyday questions, answered simply. General information only.
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View entering={FadeInDown.springify()}>
            <GlassCard style={styles.askCard}>
              <TextInput
                style={styles.input}
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask in plain words…"
                placeholderTextColor={palette.muted}
                multiline
                returnKeyType="go"
                onSubmitEditing={() => void ask(question)}
              />
              <View style={styles.askButton}>
                <PrimaryButton label="Ask" onPress={() => void ask(question)} loading={busy} />
              </View>
              <Text style={styles.chipsLabel}>Try one of these:</Text>
              <View style={styles.chips}>
                {sampleQuestions().map((q) => (
                  <Chip key={q} label={q} selected={false} onPress={() => void ask(q)} />
                ))}
              </View>
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            </GlassCard>
          </Animated.View>

          {busy ? (
            <GlassCard style={styles.answerCard}>
              <BouncingDots />
              <Text style={styles.thinking}>Thinking in plain words…</Text>
            </GlassCard>
          ) : null}

          {answer ? (
            <Animated.View entering={FadeInDown.springify()}>
              <GlassCard style={styles.answerCard}>
                <View style={styles.answerHead}>
                  {source === 'live' ? <LiveBadge /> : <DemoBadge />}
                  <Text style={styles.answerHeadText}>Answer</Text>
                </View>
                <Text style={styles.answer}>{answer}</Text>
                <Text style={styles.disclaimer}>{ASK_DISCLAIMER}</Text>
                <View style={styles.answerActions}>
                  <PrimaryButton label="Make a reminder from this" onPress={makeReminder} />
                </View>
              </GlassCard>
            </Animated.View>
          ) : null}

          {askHistory.length > 0 ? (
            <View style={styles.history}>
              <SectionHeader kicker="HISTORY" title="Past questions" />
              {askHistory.slice(0, 8).map((entry) => (
                <GlassCard key={entry.id} style={styles.historyCard}>
                  <Text style={styles.historyQ}>{entry.question}</Text>
                  <Text style={styles.historyMeta}>
                    {entry.source === 'live' ? 'LIVE' : 'DEMO'} · tap to ask again
                  </Text>
                  <Text
                    style={styles.historyReuse}
                    onPress={() => void ask(entry.question)}
                  >
                    Ask again →
                  </Text>
                </GlassCard>
              ))}
              <Text style={styles.historyHint}>
                Clear history anytime in Settings.
              </Text>
              <Text style={styles.back} onPress={() => router.replace('/')}>
                ← Back to Today
              </Text>
            </View>
          ) : null}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
      <BigDock />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, alignSelf: 'center', width: '100%' },
  header: { paddingBottom: spacing.sm },
  title: { ...type.title, color: palette.ink },
  subtitle: { ...type.body, color: palette.body, marginTop: 4 },
  scroll: { paddingBottom: 16, paddingTop: 4 },
  askCard: { marginBottom: spacing.md },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: 24,
    color: palette.ink,
    fontSize: 19,
    minHeight: 96,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  askButton: { marginTop: spacing.md },
  chipsLabel: { ...type.bodyStrong, color: palette.ink, marginTop: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.sm },
  notice: { ...type.bodyStrong, color: palette.primaryDeep, marginTop: spacing.md },
  answerCard: { marginBottom: spacing.md },
  thinking: { ...type.body, color: palette.body, marginTop: spacing.sm, textAlign: 'center' },
  answerHead: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  answerHeadText: { ...type.bodyStrong, color: palette.ink },
  answer: { ...type.body, color: palette.ink },
  disclaimer: { ...type.bodyStrong, color: palette.error, marginTop: spacing.md },
  answerActions: { marginTop: spacing.md },
  history: { marginTop: spacing.sm },
  historyCard: { marginBottom: spacing.sm },
  historyQ: { ...type.bodyStrong, color: palette.ink },
  historyMeta: { ...type.caption, color: palette.muted, marginTop: 4 },
  historyReuse: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.sm },
  historyHint: { ...type.caption, color: palette.muted, marginTop: spacing.sm },
  back: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.lg },
});
