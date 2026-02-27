import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BASE } from '@/constants/theme';
import { configureNotifications } from '@/src/lib/notifications';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized, initialize } = useAuthStore();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    initialize();
    configureNotifications(); // Configure notification channels on app start
    AsyncStorage.getItem('onboarding_complete').then((val) => {
      setOnboardingComplete(val === 'true');
      setOnboardingChecked(true);
    });
  }, [initialize]);

  useEffect(() => {
    if (!initialized || !onboardingChecked) return;

    const inAuthGroup = segments[0] === ('(auth)' as never);
    
    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login' as never);
      }
    } else {
      if (inAuthGroup) {
        if (onboardingComplete) {
          router.replace('/(tabs)' as never);
        } else {
          router.replace('/onboarding' as never);
        }
      }
    }
  }, [session, initialized, onboardingChecked, onboardingComplete, segments, router]);

  if (!initialized || !onboardingChecked) {
    return <View style={{ flex: 1, backgroundColor: BASE }} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
