import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from '@expo-google-fonts/dm-serif-display';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from '@/lib/store';

/**
 * Sign-in gate: a signed-out user who hasn't chosen guest mode lands on
 * the Welcome screen first, and a fresh sign-in routes straight back
 * into the app.
 */
function Gate() {
  const { user, authReady, guest } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    const onWelcome = segments[0] === 'welcome';
    if (!user && !guest && !onWelcome) {
      router.replace('/welcome');
    } else if (user && onWelcome) {
      router.replace('/');
    }
  }, [user, guest, authReady, segments, router]);

  if (!authReady) {
    // Brief hold while Firebase restores any existing session.
    return <View style={{ flex: 1, backgroundColor: '#FFFBF2' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="index" />
      <Stack.Screen name="ask" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="reminder/new" />
      <Stack.Screen name="reminder/[id]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
    </Stack>
  );
}

export default function RootLayout() {
  // DM Serif Display is the display face for headlines and big numbers;
  // Atkinson Hyperlegible is the body face — hold on the warm cream
  // splash color until both are ready so no headline ever flashes in
  // the system font.
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
  });
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFBF2' }} />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <Gate />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
