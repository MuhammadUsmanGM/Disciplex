/**
 * Disciplex — Comprehensive TypeScript Types
 * Production-ready type definitions for type safety
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export type TonePreference = 'analytical' | 'brutal';

export interface User {
  id: string;
  email: string | null;
  identity_claim: string | null;
  refuse_to_be: string | null;
  tone_preference: TonePreference;
  reckoning_time: string | null; // HH:MM format
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string | null;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthState {
  session: AuthSession | null;
  initialized: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ============================================
// HABIT TYPES
// ============================================

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  is_non_negotiable: boolean;
  weight: number;
  created_at: string;
  updated_at?: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  completed: boolean;
  logged_at: string;
  late_logged: boolean;
}

export interface HabitWithStatus extends Habit {
  completedToday: boolean;
  lateToday: boolean;
  completionRate?: number;
}

export interface DebtEntry {
  id: string;
  date: string;
  type: 'miss' | 'late' | 'penalty' | 'clearance';
  label: string;
  amount: number;
}

export interface DebtLedger {
  id: string;
  user_id: string;
  date: string;
  type: 'miss' | 'late' | 'penalty' | 'clearance';
  label: string;
  amount: number;
  created_at: string;
}

// ============================================
// SCORE TYPES
// ============================================

export interface DailyScore {
  date: string;
  score: number;
  adjustedScore: number;
  identityDebt: number;
}

export interface ScoreRecord {
  id: string;
  user_id: string;
  date: string;
  daily_score: number;
  adjusted_score: number;
  alignment_score: number;
  identity_debt: number;
  volatility: number;
  created_at: string;
}

export interface ScoreCalculationResult {
  rawScore: number;
  weightedScore: number;
  adjustedScore: number;
  identityAlignment: number;
  finalAlignment: number;
  volatility: number;
}

export interface ScoreHistoryEntry {
  date: string;
  score: number;
  adjustedScore: number;
  identityDebt: number;
}

// ============================================
// RECKONING TYPES
// ============================================

export interface Reckoning {
  id: string;
  user_id: string;
  week_start: string;
  week_score: number;
  trend: number;
  bottleneck: string | null;
  verdict: string;
  directive: string;
  generated_at: string;
}

export interface ReckoningPayload {
  identityClaim: string;
  refuseToBe: string;
  weekScore: number;
  previousWeekScore: number;
  trend30d: number;
  volatilityIndex: number;
  identityAlignment: number;
  identityDebt: number;
  habits: HabitCompletionRate[];
}

export interface HabitCompletionRate {
  name: string;
  completionRate: number;
  isNonNegotiable: boolean;
}

export interface ReckoningState {
  loading: boolean;
  error: string | null;
  reckoning: Reckoning | null;
  generateReckoning: (payload: ReckoningPayload) => Promise<void>;
  reset: () => void;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionTier = 'free' | 'pro' | null;

export interface SubscriptionState {
  isPro: boolean;
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  purchasePro: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export interface PurchaseError {
  code: string;
  message: string;
  userCancelled?: boolean;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationPermission {
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface ScheduledNotification {
  id: string;
  type: 'reckoning' | 'milestone';
  scheduledTime: Date;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  permissionGranted: boolean;
  loading: boolean;
  milestone7DayReached: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleReckoning: (time: string, todayScore?: number) => Promise<void>;
  cancelReckoning: () => Promise<void>;
  scheduleMilestone: () => Promise<void>;
  checkAndScheduleMilestone: (scoreHistory: ScoreHistoryEntry[]) => void;
}

// ============================================
// THEME TYPES
// ============================================

export type AccentColor = 'gold' | 'blue' | 'purple' | 'green' | 'orange' | 'rose';

export interface ThemeColors {
  primary: string;
  dim: string;
  subtle: string;
  glow: string;
  name: string;
}

export interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  accentName: string;
  isDark: boolean;
}

// ============================================
// ONBOARDING TYPES
// ============================================

export interface OnboardingData {
  identity_claim: string;
  refuse_to_be: string;
  non_negotiables: [string, string, string];
  tone_preference: TonePreference;
  reckoning_time: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  validation?: (data: Partial<OnboardingData>) => boolean;
}

// ============================================
// UI TYPES
// ============================================

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  onPress?: () => void;
  accessibilityLabel?: string;
}

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface AnalyticsClient {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  screen: (screenName: string, properties?: Record<string, any>) => void;
}

// ============================================
// API & DATABASE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];
