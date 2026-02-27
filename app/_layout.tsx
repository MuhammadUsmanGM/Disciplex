import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BASE } from '@/constants/theme';

export default function RootLayout() {
  const [checked, setChecked] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const val = await AsyncStorage.getItem('onboarding_complete');
        setInitialRoute(val === 'true' ? '/(tabs)' : '/onboarding');
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setInitialRoute('/onboarding');
      } finally {
        setChecked(true);
      }
    }
    checkOnboarding();
  }, []);

  if (!checked || initialRoute === null) {
    return <View style={{ flex: 1, backgroundColor: BASE }} />;
  }

  // Redirect to the initial route
  if (initialRoute === '/(tabs)') {
    return (
      <>
        <Redirect href="/(tabs)" />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Redirect href="/onboarding" />
      <StatusBar style="light" />
    </>
  );
}
