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
export const SURFACE_3 = '#222222';
export const BORDER = '#2A2A2A';
export const BORDER_LIGHT = '#3A3A3A';

// Glassmorphism effect tokens
export const GLASS_SURFACE = 'rgba(255, 255, 255, 0.04)';
export const GLASS_SURFACE_DARK = 'rgba(0, 0, 0, 0.2)';
export const GLASS_BORDER = 'rgba(255, 255, 255, 0.08)';
export const GLASS_BORDER_LIGHT = 'rgba(255, 255, 255, 0.12)';

// Text
export const TEXT_PRIMARY = '#F5F5F5';
export const TEXT_SECONDARY = '#888888';
export const TEXT_MUTED = '#3A3A3A';

// Gold — Premium Signal / Achievement
export const GOLD = '#C9A84C';
export const GOLD_DIM = '#A07830';
export const GOLD_SUBTLE = 'rgba(201, 168, 76, 0.10)';
export const GOLD_SUBTLE_2 = 'rgba(201, 168, 76, 0.20)';
export const GOLD_GLOW = 'rgba(201, 168, 76, 0.40)';

// Alternative Accent Colors (for custom themes)
export const ACCENT_COLORS = {
  gold: { primary: '#C9A84C', dim: '#A07830', subtle: 'rgba(201, 168, 76, 0.10)', glow: 'rgba(201, 168, 76, 0.40)', name: 'Gold' },
  blue: { primary: '#4A90D9', dim: '#2E6BA6', subtle: 'rgba(74, 144, 217, 0.10)', glow: 'rgba(74, 144, 217, 0.40)', name: 'Blue' },
  purple: { primary: '#9B59D9', dim: '#7239A6', subtle: 'rgba(155, 89, 217, 0.10)', glow: 'rgba(155, 89, 217, 0.40)', name: 'Purple' },
  green: { primary: '#27AE60', dim: '#1E8449', subtle: 'rgba(39, 174, 96, 0.10)', glow: 'rgba(39, 174, 96, 0.40)', name: 'Green' },
  orange: { primary: '#D97B2E', dim: '#A65E22', subtle: 'rgba(217, 123, 46, 0.10)', glow: 'rgba(217, 123, 46, 0.40)', name: 'Orange' },
  rose: { primary: '#D94A6E', dim: '#A63952', subtle: 'rgba(217, 74, 110, 0.10)', glow: 'rgba(217, 74, 110, 0.40)', name: 'Rose' },
};

export type AccentColor = keyof typeof ACCENT_COLORS;

// Red — Consequence Only / Debt / Failure
export const RED = '#CC0000';
export const RED_DIM = '#990000';
export const RED_SUBTLE = 'rgba(204, 0, 0, 0.10)';
export const RED_SUBTLE_2 = 'rgba(204, 0, 0, 0.20)';

// Status
export const SUCCESS = '#2A7A4B';
export const SUCCESS_SUBTLE = 'rgba(42, 122, 75, 0.15)';
export const WARNING = '#8A6A00';
export const WARNING_SUBTLE = 'rgba(138, 106, 0, 0.15)';

// Gradient Colors (for premium effects)
export const GRADIENTS = {
  gold: ['#C9A84C', '#A07830', '#C9A84C'],
  goldSubtle: ['rgba(201, 168, 76, 0.15)', 'rgba(201, 168, 76, 0.05)'],
  red: ['#CC0000', '#990000', '#CC0000'],
  surface: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'],
  card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)'],
};

// Shadow Effects (for depth)
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

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
