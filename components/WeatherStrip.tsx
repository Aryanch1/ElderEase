import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { dressLine, type WeatherInfo } from '../lib/weather';
import { palette, spacing, type } from '../lib/theme';
import { GlassCard, DemoBadge, LiveBadge } from './ui';

/** Weather strip — big temperature, plain-words condition, dress line, honest source badge. */
export default function WeatherStrip({
  weather,
  cityName,
}: {
  weather: WeatherInfo;
  cityName: string;
}) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.temp}>{weather.tempF}°F</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
          <Text style={styles.city}>{cityName}</Text>
        </View>
        <View style={styles.badge}>{weather.source === 'live' ? <LiveBadge /> : <DemoBadge />}</View>
      </View>
      <Text style={styles.dress}>{dressLine(weather)}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  temp: { ...type.weatherTemp, color: palette.ink },
  condition: { ...type.bodyStrong, color: palette.primaryDeep, marginTop: 2 },
  city: { ...type.body, color: palette.muted, marginTop: 2 },
  badge: { paddingTop: 6 },
  dress: { ...type.body, color: palette.body, marginTop: spacing.sm },
});
