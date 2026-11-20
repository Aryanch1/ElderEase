import * as Linking from 'expo-linking';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing, type } from '../lib/theme';
import type { Contact } from '../lib/types';
import { GlassCard, MemberAvatar, SpringPress } from './ui';

/** One emergency contact — big name, big green Call button. One tap calls. */
export default function ContactCard({ contact, index }: { contact: Contact; index: number }) {
  const call = () => {
    const digits = contact.phone.replace(/[^0-9+]/g, '');
    void Linking.openURL(`tel:${digits}`);
  };
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <MemberAvatar member={contact} index={index} size={72} />
        <View style={styles.main}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.relation}>{contact.relation}</Text>
          <Text style={styles.phone}>{contact.phone}</Text>
          {contact.primary ? <Text style={styles.primary}>★ Primary contact</Text> : null}
          {contact.isDemo ? <Text style={styles.demo}>DEMO</Text> : null}
        </View>
      </View>
      <SpringPress onPress={call} haptic style={styles.callWrap}>
        <View style={styles.callButton}>
          <Text style={styles.callLabel}>📞 Call {contact.name.split(' ')[0]}</Text>
        </View>
      </SpringPress>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  main: { flex: 1 },
  name: { ...type.reminderTitle, color: palette.ink },
  relation: { ...type.body, color: palette.body, marginTop: 2 },
  phone: { ...type.bodyStrong, color: palette.primaryDeep, marginTop: 4 },
  primary: { ...type.label, color: palette.primary, marginTop: spacing.sm },
  demo: { ...type.label, color: palette.warning, marginTop: 4 },
  callWrap: { marginTop: spacing.md },
  callButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  callLabel: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
});
