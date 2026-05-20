import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { darkPalette, lightPalette } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? darkPalette : lightPalette;
  const insets = useSafeAreaInsets();
  const bottomOffset = Platform.select({
    android: Math.max(insets.bottom, 10),
    ios: Math.max(insets.bottom - 8, 12),
    default: 12,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: 28,
          borderTopWidth: 1,
          bottom: bottomOffset,
          height: 72,
          left: 18,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          right: 18,
          shadowColor: palette.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 20,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="receipt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="analytics" color={color} />,
        }}
      />
    </Tabs>
  );
}
