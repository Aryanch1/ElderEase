import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuroraBackground from '../components/AuroraBackground';
import BigDock from '../components/BigDock';
import ContactCard from '../components/ContactCard';
import { EmptyState, GhostButton, GlassCard, PrimaryButton, SectionHeader } from '../components/ui';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/**
 * Contacts — emergency contacts as large cards with a big green Call
 * button. One-tap call is the whole point — no nested menus. Primary
 * contact is flagged with a star chip and powers the SOS card on Today.
 */
export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { contacts, addContact, setPrimaryContact, deleteContact } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return setError('Please add a name.');
    if (phone.replace(/[^0-9]/g, '').length < 7) {
      return setError('Please add a full phone number.');
    }
    addContact({ name, relation, phone, primary: contacts.length === 0 });
    setName('');
    setRelation('');
    setPhone('');
    setError(null);
    setShowForm(false);
    setNotice(`${name.trim()} was added to your contacts.`);
  };

  return (
    <AuroraBackground>
      <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.title}>Emergency contacts</Text>
          <Text style={styles.subtitle}>
            Tap Call to reach them right away. Your primary contact is the
            one the SOS card on Today calls.
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View entering={FadeInDown.springify()}>
            <SectionHeader kicker="ONE TAP" title="Who to call" />
          </Animated.View>
          {contacts.length === 0 ? (
            <EmptyState
              glyph="📞"
              title="No contacts yet"
              body="Add the people you trust most — family, your doctor, a neighbour."
              actionLabel="Add a contact"
              onAction={() => setShowForm(true)}
            />
          ) : (
            contacts.map((contact, i) => (
              <View key={contact.id}>
                <ContactCard contact={contact} index={i} />
                <View style={styles.cardActions}>
                  {!contact.primary ? (
                    <GhostButton label="★ Make primary" onPress={() => setPrimaryContact(contact.id)} />
                  ) : null}
                  <GhostButton
                    label="Remove"
                    onPress={() => {
                      deleteContact(contact.id);
                      setNotice(`${contact.name} was removed.`);
                    }}
                  />
                </View>
              </View>
            ))
          )}

          {showForm ? (
            <GlassCard style={styles.form}>
              <Text style={styles.formTitle}>Add a contact</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={palette.muted}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                value={relation}
                onChangeText={setRelation}
                placeholder="Relation (Daughter, Doctor, Neighbor…)"
                placeholderTextColor={palette.muted}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                placeholderTextColor={palette.muted}
                keyboardType="phone-pad"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton label="Save contact" onPress={submit} />
              <GhostButton label="Cancel" onPress={() => setShowForm(false)} />
            </GlassCard>
          ) : (
            <PrimaryButton label="+ Add a contact" onPress={() => setShowForm(true)} />
          )}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.back} onPress={() => router.replace('/')}>
            ← Back to Today
          </Text>
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
  cardActions: { flexDirection: 'row', gap: 12, marginBottom: spacing.md, marginTop: -4 },
  form: { gap: 12, marginTop: spacing.md },
  formTitle: { ...type.sectionTitle, color: palette.ink },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: 24,
    color: palette.ink,
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  error: { ...type.bodyStrong, color: palette.error, textAlign: 'center' },
  notice: { ...type.bodyStrong, color: palette.success, marginTop: spacing.md, textAlign: 'center' },
  back: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.lg },
});
