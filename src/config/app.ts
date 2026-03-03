/**
 * Disciplex — App Configuration (Expo)
 * Centralized app metadata and build configuration
 */

import { Platform } from 'react-native';

// ============================================
// APP METADATA
// ============================================

export const APP_INFO = {
  name: 'Disciplex',
  displayName: 'Disciplex — Identity OS',
  version: '1.0.0',
  buildNumber: '1',
  bundleId: 'com.disciplex.app',
  androidPackageName: 'com.disciplex.app',
  scheme: 'disciplex',
  url: 'https://disciplex.app',
  privacyPolicyUrl: 'https://disciplex.app/privacy',
  termsOfServiceUrl: 'https://disciplex.app/terms',
  supportUrl: 'https://github.com/MuhammadUsmanGM/Disciplex/issues',
  githubUrl: 'https://github.com/MuhammadUsmanGM/Disciplex',
};

// ============================================
// APP STORE CONFIGURATION
// ============================================

export const APP_STORE = {
  ios: {
    bundleId: APP_INFO.bundleId,
    appStoreId: '', // Fill after first submission
    minimumOsVersion: '15.0',
    requiresFullAccess: false,
  },
  android: {
    packageName: APP_INFO.androidPackageName,
    versionCode: 1,
    minimumSdkVersion: 26, // Android 8.0
    targetSdkVersion: 34,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
    ],
  },
};

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  // Core Features
  enableIdentityClaims: true,
  enableHabitTracking: true,
  enableScoreCalculation: true,
  enableIdentityDebt: true,
  
  // AI Features
  enableAIReckoning: true,
  enableBottleneckDetection: true,
  enableWeeklyVerdict: true,
  
  // Social Features
  enableShareCards: true,
  enableSocialSharing: true,
  
  // Premium Features (gated by subscription)
  enableUnlimitedHabits: true,
  enableAdvancedAnalytics: true,
  enableReckoningArchive: true,
  
  // Experimental (disabled by default)
  enableWidgets: false,
  enableWatchApp: false,
  enableWebSync: false,
};

// ============================================
// SUBSCRIPTION CONFIGURATION
// ============================================

export const SUBSCRIPTION = {
  // Pricing
  monthlyPrice: 9.99,
  yearlyPrice: 79.99,
  currency: 'USD',
  
  // Product IDs (RevenueCat)
  products: {
    ios: {
      monthly: 'disciplex_pro_monthly',
      yearly: 'disciplex_pro_yearly',
    },
    android: {
      monthly: 'disciplex_pro_monthly',
      yearly: 'disciplex_pro_yearly',
    },
  },
  
  // Trial Configuration
  freeTrialDays: 0, // No free trial as per spec
  trialRequiresPaymentMethod: false,
  
  // Features by Tier
  freeTier: {
    maxHabits: 3,
    aiReckoning: false,
    identityDebt: false,
    advancedAnalytics: false,
    shareCardsPerMonth: 1,
    reckoningArchive: false,
  },
  proTier: {
    maxHabits: -1, // Unlimited
    aiReckoning: true,
    identityDebt: true,
    advancedAnalytics: true,
    shareCardsPerMonth: -1, // Unlimited
    reckoningArchive: true,
  },
};

// ============================================
// NOTIFICATION CONFIGURATION
// ============================================

export const NOTIFICATIONS = {
  // Reckoning Notifications
  reckoning: {
    enabled: true,
    defaultTime: '20:00', // 8 PM
    defaultDay: 'sunday',
    sound: null, // No sound as per spec
    badge: true,
  },
  
  // Milestone Notifications
  milestone: {
    enabled: true,
    sevenDayMilestone: true,
    thirtyDayMilestone: true,
    sound: null,
  },
  
  // Reminder Notifications (minimal as per spec)
  reminders: {
    enabled: false, // Disabled by default - Disciplex doesn't nag
    defaultTime: null,
  },
  
  // Critical Alerts (Identity Debt)
  critical: {
    enabled: true,
    sound: null,
    alwaysShow: true,
  },
};

// ============================================
// ANALYTICS CONFIGURATION
// ============================================

export const ANALYTICS = {
  enabled: true,
  
  // Events to track
  events: {
    // Onboarding
    onboardingStarted: 'onboarding_started',
    onboardingCompleted: 'onboarding_completed',
    onboardingAbandoned: 'onboarding_abandoned',
    
    // Habits
    habitCreated: 'habit_created',
    habitToggled: 'habit_toggled',
    habitDeleted: 'habit_deleted',
    
    // Scores
    scoreViewed: 'score_viewed',
    scoreCalculated: 'score_calculated',
    debtAccumulated: 'debt_accumulated',
    debtCleared: 'debt_cleared',
    
    // Reckoning
    reckoningRequested: 'reckoning_requested',
    reckoningViewed: 'reckoning_viewed',
    reckoningShared: 'reckoning_shared',
    
    // Subscription
    paywallViewed: 'paywall_viewed',
    subscriptionStarted: 'subscription_started',
    subscriptionCompleted: 'subscription_completed',
    subscriptionRestored: 'subscription_restored',
    
    // Retention
    appOpened: 'app_opened',
    sessionStarted: 'session_started',
    sessionEnded: 'session_ended',
  },
  
  // User Properties
  userProperties: {
    identityClaim: 'identity_claim',
    habitCount: 'habit_count',
    averageScore: 'average_score',
    subscriptionTier: 'subscription_tier',
    daysActive: 'days_active',
  },
};

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================

export const PERFORMANCE = {
  // Animation
  animationDuration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Loading
  loadingTimeout: 30000, // 30 seconds
  skeletonAnimationDuration: 1000,
  
  // Caching
  cacheTimeout: {
    short: 60000, // 1 minute
    medium: 300000, // 5 minutes
    long: 3600000, // 1 hour
  },
  
  // Network
  networkTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Offline
  offlineMode: true,
  syncInterval: 60000, // 1 minute
};

// ============================================
// UI CONFIGURATION
// ============================================

export const UI = {
  // Typography
  fonts: {
    mono: 'ui-monospace',
    sans: 'system-ui',
    rounded: 'ui-rounded',
    serif: 'ui-serif',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: { elevation: 2, opacity: 0.1 },
    md: { elevation: 4, opacity: 0.15 },
    lg: { elevation: 8, opacity: 0.2 },
    xl: { elevation: 12, opacity: 0.25 },
  },
  
  // Haptics
  haptics: {
    enabled: true,
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    success: 'success',
    error: 'error',
    warning: 'warning',
  },
};

// ============================================
// PLATFORM DETECTION
// ============================================

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;

export const platformName = isIOS ? 'iOS' : isAndroid ? 'Android' : isWeb ? 'Web' : 'Unknown';

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSubscriptionProductId(platform: 'ios' | 'android', tier: 'monthly' | 'yearly'): string {
  return SUBSCRIPTION.products[platform][tier];
}

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] as boolean;
}

export function getMaxHabitsForTier(tier: 'free' | 'pro'): number {
  return tier === 'free' 
    ? SUBSCRIPTION.freeTier.maxHabits 
    : SUBSCRIPTION.proTier.maxHabits;
}

export function canAccessFeature(
  feature: 'aiReckoning' | 'identityDebt' | 'advancedAnalytics' | 'reckoningArchive',
  tier: 'free' | 'pro'
): boolean {
  return tier === 'pro' ? SUBSCRIPTION.proTier[feature] : (SUBSCRIPTION.freeTier as any)[feature];
}
