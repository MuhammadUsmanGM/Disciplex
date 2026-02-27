/**
 * AnimatedCard Component
 * Premium card with subtle gradient border and reveal animation
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';

import {
  BASE,
  BORDER,
  BORDER_LIGHT,
  GOLD_GLOW,
  SHADOWS,
  SURFACE,
} from '@/constants/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'danger' | 'success';
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export function AnimatedCard({
  children,
  variant = 'default',
  animated = true,
  delay = 0,
  style,
}: AnimatedCardProps) {
  const cardStyles = [
    styles.base,
    variant === 'premium' && styles.premium,
    variant === 'danger' && styles.danger,
    variant === 'success' && styles.success,
    style,
  ];

  if (!animated) {
    return <MotiView style={cardStyles}>{children}</MotiView>;
  }

  return (
    <MotiView
      style={cardStyles}
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring' as const, damping: 20, stiffness: 100, delay }}
    >
      {children}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  premium: {
    borderColor: GOLD_GLOW,
    borderWidth: 1.5,
    ...SHADOWS.goldGlow,
  },
  danger: {
    borderColor: '#3A1A1A',
    backgroundColor: '#0F0A0A',
  },
  success: {
    borderColor: '#1A3A2A',
    backgroundColor: '#0A0F0D',
  },
});
