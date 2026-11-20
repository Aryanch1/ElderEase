import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../components/AuroraBackground';
import { Chip, GhostButton, GlassCard, PrimaryButton, SectionHeader } from '../components/ui';
import { firebaseConfigured } from '../lib/config';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';
import { CITIES } from '../lib/types';

/**
 * Settings — profile editor (photo as resized base64 on users/{uid},
 * display name, email + sign-in method, password-reset email, sign out),
 * text-size choice (Large / Extra large), home city for weather, home
 * address (optional, shown on the SOS card), clear demo data, clear
 * history, About (version read from app.json only), Help link.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const {
    user,
    guest,
    textSize,
    setTextSize,
    city,
    setCity,
    homeAddress,
    setHomeAddress,
    updateDisplayName,
    setAvatarData,
    sendPasswordReset,
    signOut,
    clearHistory,
    clearDemoData,
  } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [address, setAddress] = useState(homeAddress);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The version label reads the single version source (app.json) —
  // never a hand-typed string.
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const resized = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 256 } }],
      { base64: true, format: ImageManipulator.SaveFormat.JPEG },
    );
    if (resized.base64) {
      await setAvatarData(`data:image/jpeg;base64,${resized.base64}`);
      setNotice('Profile photo updated.');
    }
  };

  const saveName = async () => {
    if (!name.trim()) return setError('Please type a name first.');
    setBusy(true);
    try {
      await updateDisplayName(name);
      setNotice('Name saved.');
      setError(null);
    } catch {
      setError('Could not save the name. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setBusy(true);
    try {
      await sendPasswordReset();
      setNotice('Password reset email sent — check your inbox.');
      setError(null);
    } catch {
      setError('Could not send the reset email. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveAddress = () => {
    setHomeAddress(address.trim());
    setNotice('Home address saved. It shows on the SOS card.');
  };

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <SectionHeader kicker="ACCOUNT" title="Your profile" />
          {user ? (
            <GlassCard style={styles.card}>
              <View style={styles.profileRow}>
                {user.photo ? (
                  <Image source={{ uri: user.photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarLetter}>
                      {(user.name ?? '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.profileMain}>
                  <Text style={styles.profileName}>{user.name ?? 'No name yet'}</Text>
                  <Text style={styles.profileEmail}>{user.email ?? ''}</Text>
                  <Text style={styles.profileMethod}>
                    Signed in with {user.provider === 'google.com' ? 'Google' : 'email and password'}
                  </Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={palette.muted}
                autoCapitalize="words"
              />
              <PrimaryButton label="Save name" onPress={() => void saveName()} loading={busy} />
              <GhostButton label="Change photo" onPress={() => void pickPhoto()} />
              {user.provider === 'password' ? (
                <GhostButton label="Send password reset email" onPress={() => void resetPassword()} />
              ) : null}
              <GhostButton
                label="Sign out"
                onPress={() => {
                  void signOut();
                  router.replace('/welcome');
                }}
              />
            </GlassCard>
          ) : (
            <GlassCard style={styles.card}>
              <Text style={styles.body}>
                {guest
                  ? 'You are using ElderEase as a guest. Your reminders stay on this device.'
                  : 'You are not signed in.'}
              </Text>
              <PrimaryButton label="Go to sign-in" onPress={() => router.replace('/welcome')} />
            </GlassCard>
          )}

          <SectionHeader kicker="READING" title="Text size" />
          <GlassCard style={styles.card}>
            <View style={styles.chips}>
              <Chip label="Large" selected={textSize === 'large'} onPress={() => setTextSize('large')} />
              <Chip label="Extra large" selected={textSize === 'xlarge'} onPress={() => setTextSize('xlarge')} />
            </View>
            <Text style={styles.body}>Extra large makes all text about one fifth bigger.</Text>
          </GlassCard>

          <SectionHeader kicker="WEATHER" title="Home city" />
          <GlassCard style={styles.card}>
            <View style={styles.chips}>
              {CITIES.map((c) => (
                <Chip key={c.name} label={c.name} selected={city.name === c.name} onPress={() => setCity(c)} />
              ))}
            </View>
            <Text style={styles.body}>Weather on the Today screen is for {city.name}.</Text>
          </GlassCard>

          <SectionHeader kicker="SAFETY" title="Home address (optional)" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>
              Shown on the SOS card so you can read it to someone helping you.
            </Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street and town"
              placeholderTextColor={palette.muted}
            />
            <PrimaryButton label="Save address" onPress={saveAddress} />
          </GlassCard>

          <SectionHeader kicker="DATA" title="Demo data and history" />
          <GlassCard style={styles.card}>
            <GhostButton
              label="Clear demo data"
              onPress={() => {
                clearDemoData();
                setNotice('Demo reminders, contacts and questions were removed.');
              }}
            />
            <GhostButton
              label="Clear question history"
              onPress={() => {
                clearHistory();
                setNotice('Question history was cleared.');
              }}
            />
            <Text style={styles.body}>
              Demo data is clearly labelled DEMO. Your own reminders and
              contacts are never touched by these buttons.
            </Text>
          </GlassCard>

          <SectionHeader kicker="ABOUT" title="About ElderEase" />
          <GlassCard style={styles.card}>
            <Text style={styles.body}>ElderEase version {version}</Text>
            <Text style={styles.body}>
              A big-text daily companion: reminders, weather, emergency
              contacts, and a plain-words AI companion. General information
              only — not medical advice.
            </Text>
            <Text style={styles.body}>
              {firebaseConfigured
                ? 'Accounts are connected.'
                : 'Accounts are not set up yet — guest mode works fully until then.'}
            </Text>
            <GhostButton label="Help — how the app works" onPress={() => router.push('/help')} />
            <GhostButton label="← Back to Today" onPress={() => router.replace('/')} />
          </GlassCard>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
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
  card: { gap: 12, marginBottom: spacing.lg },
  body: { ...type.body, color: palette.body },
  profileRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { borderRadius: 40, height: 80, width: 80 },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarLetter: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  profileMain: { flex: 1 },
  profileName: { ...type.reminderTitle, color: palette.ink },
  profileEmail: { ...type.body, color: palette.body, marginTop: 2 },
  profileMethod: { ...type.caption, color: palette.muted, marginTop: 4 },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: 24,
    color: palette.ink,
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notice: { ...type.bodyStrong, color: palette.success, marginTop: spacing.md, textAlign: 'center' },
  error: { ...type.bodyStrong, color: palette.error, marginTop: spacing.md, textAlign: 'center' },
});
