/**
 * Disciplex Design System — Color Tokens
 * 
 * These colors are not aesthetic choices. They are psychological instruments.
 * See: disciplex.md Section 4
 */

// Base Layer
export const BASE = '#0A0A0A';
export const SURFACE = '#111111';
export const SURFACE_2 = '#1A1A1A';
export const BORDER = '#2A2A2A';

// Text
export const TEXT_PRIMARY = '#F5F5F5';
export const TEXT_SECONDARY = '#888888';
export const TEXT_MUTED = '#3A3A3A';

// Gold — Premium Signal / Achievement
export const GOLD = '#C9A84C';
export const GOLD_DIM = '#A07830';
export const GOLD_SUBTLE = 'rgba(201, 168, 76, 0.10)';

// Red — Consequence Only / Debt / Failure
export const RED = '#CC0000';
export const RED_SUBTLE = 'rgba(204, 0, 0, 0.10)';

// Status
export const SUCCESS = '#2A7A4B';
export const WARNING = '#8A6A00';

// Theme Configuration
export const Colors = {
  dark: {
    background: BASE,
    surface: SURFACE,
    surface2: SURFACE_2,
    border: BORDER,
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    textMuted: TEXT_MUTED,
    tint: GOLD,
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_MUTED,
    tabIconSelected: GOLD,
    success: SUCCESS,
    warning: WARNING,
    error: RED,
  },
  light: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surface2: '#EEEEEE',
    border: '#DDDDDD',
    text: '#0A0A0A',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
    tint: GOLD_DIM,
    icon: '#666666',
    tabIconDefault: '#AAAAAA',
    tabIconSelected: GOLD_DIM,
    success: SUCCESS,
    warning: WARNING,
    error: RED,
  },
};

// Font Configuration
export const Fonts = {
  mono: 'ui-monospace', // Score displays — JetBrains Mono preferred
  sans: 'system-ui', // Body text
  rounded: 'ui-rounded', // Secondary UI elements
  serif: 'ui-serif', // Rarely used
};

// Score Color Coding (per spec Section 6)
export function getScoreColor(score: number): string {
  if (score >= 75) return GOLD;
  if (score >= 50) return TEXT_PRIMARY;
  return RED;
}

// Score Color Label
export function getScoreLabel(score: number): string {
  if (score >= 75) return 'Aligned';
  if (score >= 50) return 'Drifting';
  return 'Identity Gap';
}
