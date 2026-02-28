import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, GOLD, SURFACE } from '@/constants/theme';
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
          backgroundColor: isDark ? SURFACE : '#FFFFFF',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 12,
          paddingHorizontal: 16,
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
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          fontFamily: 'ui-monospace',
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBackground: () => (
          <View style={[
            styles.tabBarBackground,
            { backgroundColor: isDark ? SURFACE : '#FFFFFF' }
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
          href: null, // Hide from tab bar
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
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
