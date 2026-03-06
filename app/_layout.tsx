import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';

import { AnimatedSplashScreen } from '@/src/components/ui/AnimatedSplashScreen';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { configureNotifications } from '@/src/lib/notifications';
import { initializeRevenueCat } from '@/src/lib/payments';
import { useAuthStore } from '@/src/store/useAuthStore';

type RootTab = '(tabs)' | 'onboarding' | 'vetting' | '(auth)';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized, initialize } = useAuthStore();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    const startApp = async () => {
      // 1. Initialize Auth
      await initialize();
      
      // 2. Initialize Notifications
      configureNotifications();

      // 3. Check Onboarding
      const val = await AsyncStorage.getItem('onboarding_complete');
      if (mounted) {
        setOnboardingComplete(val === 'true');
        setOnboardingChecked(true);
      }
    };

    startApp();

    return () => {
      mounted = false;
    };
  }, [initialize]); // initialize is stable from Zustand store

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      initializeRevenueCat(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!initialized || !onboardingChecked) return;

    const rootSegment = segments[0] as RootTab | undefined;
    const inAuthGroup = rootSegment === '(auth)';
    const inTabsGroup = rootSegment === '(tabs)';
    const inOnboarding = rootSegment === 'onboarding';

    if (!session) {
      // Not logged in: must be in (auth)
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Logged in: must be in (tabs) or onboarding
      if (inAuthGroup || (!inTabsGroup && !inOnboarding && rootSegment !== 'vetting')) {
        if (onboardingComplete) {
          router.replace('/vetting');
        } else {
          router.replace('/onboarding');
        }
      }
    }
  }, [
    session?.user?.id,
    initialized,
    onboardingChecked,
    onboardingComplete,
    segments[0], // Only depend on the top-level segment to avoid deep comparison loops
    router
  ]);

  // Ensure routing system catches up before unmounting splash
  const isDataReady = initialized && onboardingChecked;

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="vetting" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />

          {(!isDataReady || !splashDone) && (
            <AnimatedSplashScreen onAnimationComplete={handleSplashDone} />
          )}
        </>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
