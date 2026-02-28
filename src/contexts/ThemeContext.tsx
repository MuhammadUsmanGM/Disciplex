/**
 * Theme Context
 * Manages user-selected accent color theme
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { ACCENT_COLORS, AccentColor, GOLD } from '@/constants/theme';

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  accentPrimary: string;
  accentDim: string;
  accentSubtle: string;
  accentGlow: string;
  accentName: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'disciplex_accent_color';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>('gold');

  useEffect(() => {
    // Load saved theme
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved && ACCENT_COLORS[saved as AccentColor]) {
        setAccentColorState(saved as AccentColor);
      }
    });
  }, []);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    AsyncStorage.setItem(THEME_KEY, color);
  };

  const selectedColor = ACCENT_COLORS[accentColor];

  const value = {
    accentColor,
    setAccentColor,
    accentPrimary: selectedColor.primary,
    accentDim: selectedColor.dim,
    accentSubtle: selectedColor.subtle,
    accentGlow: selectedColor.glow,
    accentName: selectedColor.name,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Get current accent color value (for use outside React)
 */
export async function getAccentColor(): Promise<AccentColor> {
  const saved = await AsyncStorage.getItem(THEME_KEY);
  if (saved && ACCENT_COLORS[saved as AccentColor]) {
    return saved as AccentColor;
  }
  return 'gold';
}
