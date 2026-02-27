import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, GOLD } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NavIcons } from '@/src/utils/icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#111111' : '#FFFFFF',
          borderTopColor: isDark ? '#2A2A2A' : '#E0E0E0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          fontFamily: 'ui-monospace',
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
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
          title: 'Identity',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Identity
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <NavIcons.Settings
              size={24}
              color={focused ? GOLD : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
