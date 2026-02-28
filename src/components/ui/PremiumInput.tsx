import { BORDER, GOLD, SURFACE, TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { useRef, useState } from 'react';
import {
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    View
} from 'react-native';

interface PremiumInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function PremiumInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  secureTextEntry,
  style,
  ...props
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      
      <MotiView
        animate={{
          borderColor: isFocused ? GOLD : error ? '#CC0000' : BORDER,
          backgroundColor: isFocused ? 'rgba(201, 168, 76, 0.03)' : SURFACE,
          transform: [{ scale: isFocused ? 1.01 : 1 }],
        }}
        transition={{ type: 'timing', duration: 250 }}
        style={[styles.inputWrapper, !!error && styles.inputError]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={isFocused ? '' : placeholder}
          placeholderTextColor={TEXT_MUTED}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          selectionColor={GOLD}
          {...props}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </MotiView>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'ui-monospace',
    paddingLeft: 4,
  },
  labelFocused: {
    color: GOLD,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#CC0000',
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 16,
    height: '100%',
    paddingVertical: 12,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  errorText: {
    color: '#CC0000',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'ui-monospace',
    paddingLeft: 4,
  },
  hintText: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 6,
    paddingLeft: 4,
  },
});
