import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AuroraBackground from '../components/AuroraBackground';
import { GhostButton, GlassCard, PrimaryButton } from '../components/ui';
import { firebaseConfigured } from '../lib/config';
import { useApp } from '../lib/store';
import { palette, radii, spacing, type } from '../lib/theme';

type Mode = 'main' | 'signup' | 'login';

/**
 * Welcome gate — shown on every open to a signed-out, non-guest user.
 * Exactly four options: Continue with Google; Create account; Log in
 * (with Forgot password); Continue without an account.
 *
 * No photo hero here: ElderEase is a big-text companion, so the welcome
 * visual is a designed rising sun — an amber disc over a cream horizon,
 * drawn with views, in the app's sunrise identity.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const {
    signIn,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    continueAsGuest,
  } = useApp();
  const [mode, setMode] = useState<Mode>('main');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const friendly = (e: unknown): string => {
    if (!firebaseConfigured) {
      return 'Accounts are not set up for this app yet — please continue as a guest for now.';
    }
    const message = e instanceof Error ? e.message : 'Something went wrong. Try again.';
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
      return 'That email and password do not match. Try again or reset your password.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists — try logging in instead.';
    }
    if (message.includes('auth/invalid-email')) return 'That email address does not look right.';
    if (message.includes('auth/weak-password')) {
      return 'Choose a password of at least 6 characters.';
    }
    return message;
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(friendly(e));
    } finally {
      setBusy(false);
    }
  };

  const submitSignup = () => {
    if (!name.trim()) return setError('Please add your name.');
    if (password !== confirm) return setError('The two passwords do not match.');
    if (password.length < 6) return setError('Choose a password of at least 6 characters.');
    void run(() => signUpWithEmail(name, email, password));
  };

  const submitLogin = () => {
    void run(() => signInWithEmail(email, password));
  };

  const forgot = () => {
    if (!email.trim()) return setError('Type your email above first, then tap Forgot password.');
    void run(async () => {
      await resetPasswordForEmail(email);
      setNotice('Password reset email sent — check your inbox.');
    });
  };

  return (
    <AuroraBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.sunArt}>
            <View style={styles.sunDisc}>
              <Text style={styles.sunFace}>☀</Text>
            </View>
            <View style={styles.horizon} />
            <Text style={styles.sunWord}>ELDEREASE</Text>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <GlassCard style={styles.card}>
            <Text style={styles.kicker}>ELDEREASE</Text>
            <Text style={styles.title}>Your day, in large print.</Text>
            <Text style={styles.body}>
              Today&apos;s reminders, plain-words weather, one-tap emergency
              contacts, and a companion that answers everyday questions in
              large, simple language.
            </Text>

            {mode === 'main' ? (
              <View style={styles.actions}>
                <PrimaryButton label="Continue with Google" onPress={() => void run(signIn)} loading={busy} />
                <GhostButton label="Create account" onPress={() => setMode('signup')} />
                <GhostButton label="Log in" onPress={() => setMode('login')} />
                <GhostButton
                  label="Continue without an account"
                  onPress={() => {
                    continueAsGuest();
                    router.replace('/');
                  }}
                />
              </View>
            ) : (
              <View style={styles.actions}>
                {mode === 'signup' ? (
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={palette.muted}
                    autoCapitalize="words"
                  />
                ) : null}
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={palette.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={palette.muted}
                  secureTextEntry
                />
                {mode === 'signup' ? (
                  <TextInput
                    style={styles.input}
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Confirm password"
                    placeholderTextColor={palette.muted}
                    secureTextEntry
                  />
                ) : null}
                {mode === 'signup' ? (
                  <PrimaryButton label="Create my account" onPress={submitSignup} loading={busy} />
                ) : (
                  <PrimaryButton label="Log in" onPress={submitLogin} loading={busy} />
                )}
                {mode === 'login' ? (
                  <GhostButton label="Forgot password?" onPress={forgot} />
                ) : null}
                <GhostButton label="← Back" onPress={() => { setMode('main'); setError(null); setNotice(null); }} />
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {!firebaseConfigured ? (
              <Text style={styles.hint}>
                Sign-in is being set up — guest mode works fully until then.
              </Text>
            ) : null}
          </GlassCard>
        </Animated.View>
        <Text style={styles.disclaimer}>
          Your reminders stay yours — they live on your device, or in your
          account when signed in. ElderEase gives general information only,
          not medical advice.
        </Text>
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  sunArt: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radii.card,
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 220,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  sunDisc: {
    alignItems: 'center',
    backgroundColor: '#FFF6E3',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  sunFace: { fontSize: 56, color: palette.primary },
  horizon: {
    backgroundColor: palette.primaryDeep,
    borderRadius: 4,
    height: 6,
    marginTop: spacing.md,
    width: 180,
  },
  sunWord: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: spacing.sm,
  },
  card: { padding: spacing.lg },
  kicker: { ...type.label, color: palette.primary, marginBottom: 6 },
  title: { ...type.display, color: palette.ink, marginBottom: 10 },
  body: { ...type.body, color: palette.body, marginBottom: spacing.lg },
  actions: { gap: 12 },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  error: { ...type.bodyStrong, color: palette.error, marginTop: spacing.md, textAlign: 'center' },
  notice: { ...type.bodyStrong, color: palette.success, marginTop: spacing.md, textAlign: 'center' },
  hint: { ...type.caption, color: palette.muted, marginTop: spacing.md, textAlign: 'center' },
  disclaimer: { ...type.caption, color: palette.muted, marginTop: spacing.lg, textAlign: 'center' },
});
