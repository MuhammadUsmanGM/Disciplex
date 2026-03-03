import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { BASE, Colors, GOLD, SURFACE } from '@/constants/theme';
import { LiveBackground } from '@/src/components/ui/LiveBackground';
import { NavIcons } from '@/src/utils/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  // Force dark mode - Disciplex is always dark
  const isDark = true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BASE }} edges={['bottom']}>
      <LiveBackground />
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: SURFACE,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
          paddingHorizontal: 4,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 15 : 12,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          marginTop: 4,
          fontFamily: 'ui-monospace',
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarBackground: () => (
          <View style={[
            styles.tabBarBackground,
            { backgroundColor: SURFACE }
          ]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Home
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Insights
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="identity"
        options={{
          title: 'Debt',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Debt
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Identity
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
