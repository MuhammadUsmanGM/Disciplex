import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BASE } from '@/constants/theme';

export default function RootLayout() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then((val) => {
      setChecked(true);
      if (val === 'true') {
        router.replace('/(tabs)' as never);
      } else {
        router.replace('/onboarding' as never);
      }
    });
  }, []);

  if (!checked) {
    return <View style={{ flex: 1, backgroundColor: BASE }} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
