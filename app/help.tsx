import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../components/AuroraBackground';
import { GhostButton, GlassCard, SectionHeader } from '../components/ui';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/** Help — how the app works, in large plain language. */
export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.title}>How ElderEase works</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <SectionHeader kicker="YOUR DAY" title="Today" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              The Today screen shows your reminders in order: morning,
              afternoon, then evening. Tap a reminder to see the details.
              Tap Mark done when you have done it — the card softens and
              the count at the top goes down.
            </Text>
          </GlassCard>

          <SectionHeader kicker="QUESTIONS" title="Ask" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              Type a question in plain words, or tap one of the suggested
              questions. Answers are short and simple. Every answer says
              whether it is LIVE or DEMO. ElderEase gives general
              information only — it is not medical advice. Always ask your
              doctor or pharmacist about your own medicine.
            </Text>
          </GlassCard>

          <SectionHeader kicker="SAFETY" title="Contacts and SOS" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              The Contacts tab holds the people you trust. Tap Call to
              phone them right away. The big red Call for help button on
              Today calls your primary contact.
            </Text>
            <Text style={styles.bodyStrong}>
              In a real emergency, call 911 directly. This app does not
              alert emergency services.
            </Text>
          </GlassCard>

          <SectionHeader kicker="YOUR DATA" title="Accounts and privacy" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              You can sign in with Google or an email and password, or
              continue as a guest. Signed-in users stay signed in. Guests
              are asked to sign in again next time. Your reminders and
              contacts live on your device, or in your own account when
              signed in. No one else can see them.
            </Text>
          </GlassCard>

          <SectionHeader kicker="SUPPORT" title="Need help with the app?" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              Ask a family member or caregiver to help you with Settings.
              Text size, home city, and your home address can all be
              changed there. Demo data can be cleared there too.
            </Text>
            <GhostButton label="← Back to Today" onPress={() => router.replace('/')} />
          </GlassCard>
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
  card: { marginBottom: spacing.lg },
  body: { ...type.body, color: palette.body },
  bodyStrong: { ...type.bodyStrong, color: palette.ink, marginTop: spacing.sm },
});
