import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../components/AuroraBackground';
import BigDock from '../components/BigDock';
import ReminderCard from '../components/ReminderCard';
import SunRefresh, { SunButton } from '../components/SunRefresh';
import WeatherStrip from '../components/WeatherStrip';
import { EmptyState, GlassCard, PrimaryButton, SpringPress } from '../components/ui';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';
import { daypart, formatDayLabel, greetingFor } from '../lib/types';
import { DEMO_WEATHER, fetchWeather, type WeatherInfo } from '../lib/weather';

/**
 * Home (Today) — a typographic greeting hero ("Good morning" in serif,
 * big date), a weather strip, an SOS card, and a vertical timeline of
 * today's reminders grouped Morning / Afternoon / Evening. No photo
 * hero, no ledger, no ring, no dashboard grid.
 */
export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const {
    user,
    guest,
    todayReminders,
    remainingToday,
    primaryContact,
    homeAddress,
    city,
    textSize,
  } = useApp();
  const [weather, setWeather] = useState<WeatherInfo>(DEMO_WEATHER);
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const [sosNotice, setSosNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchWeather(city).then((w) => {
      if (alive) setWeather(w);
    });
    return () => {
      alive = false;
    };
  }, [city]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const w = await fetchWeather(city);
    setWeather(w);
    // Brief beat so the rising-sun loop is visible, then settle.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRefreshing(false);
  }, [city]);

  const name = user?.name?.split(' ')[0] ?? (guest ? 'friend' : 'friend');
  const greeting = greetingFor();
  const sections: ('Morning' | 'Afternoon' | 'Evening')[] = ['Morning', 'Afternoon', 'Evening'];

  const callPrimary = () => {
    if (!primaryContact) {
      setSosNotice('No emergency contact yet — add one on the Contacts tab.');
      return;
    }
    const digits = primaryContact.phone.replace(/[^0-9+]/g, '');
    setSosNotice(`Calling ${primaryContact.name} now.`);
    void Linking.openURL(`tel:${digits}`);
  };

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <View>
            <Text style={styles.kicker}>ELDEREASE · TODAY</Text>
            <Text style={[styles.greeting, textSize === 'xlarge' ? styles.greetingXl : null]}>
              {greeting}, {name}
            </Text>
            <Text style={styles.date}>{formatDayLabel()}</Text>
          </View>
          <View style={styles.headerButtons}>
            <SunButton onPress={() => void onRefresh()} spinning={refreshing} />
            <SpringPress onPress={() => router.push('/settings')} haptic>
              <View style={styles.gear}>
                <Text style={styles.gearText}>⚙</Text>
              </View>
            </SpringPress>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} colors={[palette.primary]} tintColor={palette.primary} />
          }
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            setPull(y < 0 ? Math.min(1, -y / 120) : 0);
          }}
          scrollEventThrottle={16}
        >
          {(pull > 0 || refreshing) && <SunRefresh progress={pull} refreshing={refreshing} />}
          <Animated.View entering={FadeInDown.springify()}>
            <WeatherStrip weather={weather} cityName={city.name} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <GlassCard style={styles.sosCard}>
              <Text style={styles.sosTitle}>Need help right now?</Text>
              <SpringPress onPress={callPrimary} haptic style={styles.sosWrap}>
                <View style={styles.sosButton}>
                  <Text style={styles.sosLabel}>
                    📞 Call for help{primaryContact ? ` — ${primaryContact.name}` : ''}
                  </Text>
                </View>
              </SpringPress>
              <Text style={styles.sosNote}>
                Calls your primary contact. This app does not alert emergency services.
                {homeAddress ? ` Your home address: ${homeAddress}` : ''}
              </Text>
              {sosNotice ? <Text style={styles.sosNotice}>{sosNotice}</Text> : null}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <View style={styles.summaryRow}>
              <Text style={styles.summary}>
                {remainingToday === 0
                  ? 'All done for today. Well done.'
                  : `${remainingToday} thing${remainingToday === 1 ? '' : 's'} left today`}
              </Text>
              <Text style={styles.summaryCount}>
                {todayReminders.filter((x) => x.done).length} of {todayReminders.length} done
              </Text>
            </View>
          </Animated.View>

          {todayReminders.length === 0 ? (
            <EmptyState
              glyph="☀"
              title="Nothing scheduled yet"
              body="Add your first reminder and your day will appear here."
              actionLabel="Add a reminder"
              onAction={() => router.push('/reminder/new')}
            />
          ) : (
            sections.map((section) => {
              const items = todayReminders.filter((x) => daypart(x.time) === section);
              if (items.length === 0) return null;
              return (
                <View key={section} style={styles.section}>
                  <Text style={styles.sectionLabel}>{section.toUpperCase()}</Text>
                  {items.map((reminder, i) => (
                    <ReminderCard key={reminder.id} reminder={reminder} index={i} />
                  ))}
                </View>
              );
            })
          )}

          <View style={styles.addWrap}>
            <PrimaryButton label="+ Add a reminder" onPress={() => router.push('/reminder/new')} />
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
      <BigDock />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, alignSelf: 'center', width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
  },
  kicker: { ...type.label, color: palette.primary },
  greeting: { ...type.display, color: palette.ink, marginTop: 4 },
  greetingXl: { fontSize: 56, lineHeight: 60 },
  date: { ...type.body, color: palette.body, marginTop: 4 },
  headerButtons: { flexDirection: 'row', gap: spacing.sm, paddingTop: 4 },
  gear: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  gearText: { fontSize: 26, color: palette.primaryDeep },
  scroll: { paddingBottom: 16, paddingTop: 4 },
  sosCard: { marginBottom: spacing.md, backgroundColor: palette.sosSoft },
  sosTitle: { ...type.sectionTitle, color: palette.ink },
  sosWrap: { marginTop: spacing.md },
  sosButton: {
    alignItems: 'center',
    backgroundColor: palette.sos,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  sosLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  sosNote: { ...type.body, color: palette.body, marginTop: spacing.sm },
  sosNotice: { ...type.bodyStrong, color: palette.sos, marginTop: spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  summary: { ...type.bodyStrong, color: palette.ink },
  summaryCount: { ...type.body, color: palette.muted },
  section: { marginBottom: spacing.sm },
  sectionLabel: { ...type.label, color: palette.primary, marginBottom: spacing.sm },
  addWrap: { marginTop: spacing.md },
});
