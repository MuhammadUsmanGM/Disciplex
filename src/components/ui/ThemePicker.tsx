/**
 * Theme Picker Component
 * Allows users to select their accent color
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ACCENT_COLORS,
  BASE,
  BORDER,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  AccentColor,
} from '@/constants/theme';

interface ThemePickerProps {
  selectedColor: AccentColor;
  onSelectColor: (color: AccentColor) => void;
}

export function ThemePicker({ selectedColor, onSelectColor }: ThemePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {Object.entries(ACCENT_COLORS).map(([key, color]) => (
        <Pressable
          key={key}
          style={[
            styles.colorOption,
            selectedColor === key && styles.colorOptionSelected,
            { borderColor: color.primary },
          ]}
          onPress={() => onSelectColor(key as AccentColor)}
        >
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: color.primary },
            ]}
          />
          <Text
            style={[
              styles.colorName,
              selectedColor === key && styles.colorNameSelected,
            ]}
          >
            {color.name}
          </Text>
          {selectedColor === key && (
            <View style={[styles.selectedIndicator, { backgroundColor: color.primary }]} />
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: BORDER,
    gap: 8,
  },
  colorOptionSelected: {
    backgroundColor: BASE,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorName: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'ui-monospace',
  },
  colorNameSelected: {
    color: TEXT_PRIMARY,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: SURFACE,
  },
});
