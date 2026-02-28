import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AnimatedSplashScreen } from '@/src/components/ui/AnimatedSplashScreen';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { configureNotifications } from '@/src/lib/notifications';
import { initializeRevenueCat } from '@/src/lib/payments';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized, initialize } = useAuthStore();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    initialize();
    configureNotifications(); // Configure notification channels on app start
    AsyncStorage.getItem('onboarding_complete').then((val) => {
      setOnboardingComplete(val === 'true');
      setOnboardingChecked(true);
    });
  }, [initialize]);

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      initializeRevenueCat(session.user.id);
    }
  }, [session?.user?.id]);

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

  // Ensure routing system catches up before unmounting splash
  const isDataReady = initialized && onboardingChecked;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />

          {(!isDataReady || !splashDone) && (
            <AnimatedSplashScreen onAnimationComplete={() => setSplashDone(true)} />
          )}
        </>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
