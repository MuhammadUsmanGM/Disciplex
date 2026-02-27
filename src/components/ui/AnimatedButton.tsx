/**
 * AnimatedButton Component
 * Premium button with haptic feedback and smooth animations
 */

import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

import { GOLD, SURFACE_2, TEXT_PRIMARY } from '@/constants/theme';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

export function AnimatedButton({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  haptic = true,
}: AnimatedButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const handlePressIn = async () => {
    if (disabled || loading) return;
    setPressed(true);
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setPressed(false);
  };

  const handlePressWrapper = () => {
    if (disabled || loading) return;
    onPress();
  };

  const buttonStyles = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    size === 'sm' && styles.sm,
    size === 'md' && styles.md,
    size === 'lg' && styles.lg,
    disabled && styles.disabled,
    style,
  ];

  return (
    <MotiView
      style={buttonStyles}
      from={{ scale: 1 }}
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: 'spring' as const, damping: 20, stiffness: 300 }}
    >
      <Pressable
        onPress={handlePressWrapper}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: GOLD,
  },
  secondary: {
    backgroundColor: SURFACE_2,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: GOLD,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
});
