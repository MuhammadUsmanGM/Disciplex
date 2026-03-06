/**
 * Disciplex — Configuration Management
 * Centralized configuration with validation and environment support
 */

import { Platform } from 'react-native';

// ============================================
// ENVIRONMENT TYPES
// ============================================

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: AppEnvironment;
  isDev: boolean;
  isProduction: boolean;
  
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // AI
  googleAiApiKey: string;
  
  // RevenueCat
  revenueCatApiKey: string;
  revenueCatAndroidKey: string;
  revenueCatIOSKey: string;
  
  // Expo
  expoProjectId: string;
  scheme: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  
  // App Info
  version: string;
  buildNumber: string;
  
  // API
  apiTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================
// VALIDATION
// ============================================

function validateConfig(config: Partial<AppConfig>): void {
  const errors: string[] = [];
  
  // Required in all environments
  if (!config.supabaseUrl) errors.push('EXPO_PUBLIC_SUPABASE_URL is required');
  if (!config.supabaseAnonKey) errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  
  // AI is required for production
  if (config.environment === 'production' && !config.googleAiApiKey) {
    errors.push('EXPO_PUBLIC_GOOGLE_AI_API_KEY is required for production');
  }
  
  // RevenueCat is required for production
  if (config.environment === 'production' && !config.revenueCatApiKey) {
    errors.push('EXPO_PUBLIC_REVENUECAT_API_KEY is required for production');
  }
  
  if (errors.length > 0) {
    const errorMessage = `Configuration Validation Failed:\n${errors.join('\n')}`;
    console.error(errorMessage);
    
    if (config.environment === 'production') {
      throw new Error(errorMessage);
    }
  }
}

// ============================================
// CONFIGURATION
// ============================================

const environment = (process.env.EXPO_PUBLIC_APP_ENV as AppEnvironment) || 'development';

const config: AppConfig = {
  environment,
  isDev: environment === 'development',
  isProduction: environment === 'production',
  
  // Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // AI
  googleAiApiKey: process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '',
  
  // RevenueCat
  revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  revenueCatIOSKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  
  // Expo
  expoProjectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID || '',
  scheme: process.env.EXPO_PUBLIC_SCHEME || 'disciplex',
  
  // Feature Flags
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'false',
  enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING !== 'false',
  
  // App Info (from package.json - will be updated at build time)
  version: '1.0.0',
  buildNumber: '1',
  
  // API Defaults
  apiTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Validate configuration
validateConfig(config);

// ============================================
// DERIVED CONFIGURATIONS
// ============================================

export const API_CONFIG = {
  timeout: config.apiTimeout,
  retryAttempts: config.retryAttempts,
  retryDelay: config.retryDelay,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': config.version,
    'X-Platform': Platform.OS,
  },
};

export const SUPABASE_CONFIG = {
  url: config.supabaseUrl,
  anonKey: config.supabaseAnonKey,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
};

export const REVENUECAT_CONFIG = {
  apiKey: config.revenueCatApiKey,
  androidKey: config.revenueCatAndroidKey,
  iosKey: config.revenueCatIOSKey,
};

export const AI_CONFIG = {
  apiKey: config.googleAiApiKey,
  model: 'gemini-pro',
  maxTokens: 500,
  temperature: 0.3, // Lower temperature for more analytical responses
};

export const NOTIFICATION_CONFIG = {
  enabled: config.enableAnalytics,
  reckoningSound: null, // No sound by default, as per spec
  milestoneSound: null,
};

// ============================================
// EXPORTS
// ============================================

export default config;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isConfigured(): boolean {
  return !!(config.supabaseUrl && config.supabaseAnonKey);
}

export function getEnvironment(): AppEnvironment {
  return config.environment;
}

export function isDevelopment(): boolean {
  return config.isDev;
}

export function isProduction(): boolean {
  return config.isProduction;
}

export function getApiBaseUrl(): string {
  // For future API endpoint configuration
  return config.supabaseUrl.replace('/rest/v1', '');
}

export function getFeatureFlag(flag: string): boolean {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const flagValue = process.env[`EXPO_PUBLIC_${flag.toUpperCase()}`];
  return flagValue === 'true';
}
