/**
 * Disciplex — Supabase Client
 * Production-ready Supabase configuration with retry logic and error handling
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import config, { SUPABASE_CONFIG } from '@/src/config';
import { logger, error as logError, trackError } from '@/src/utils/logger';

// ============================================
// TYPES
// ============================================

interface RetryOptions {
  attempts: number;
  delay: number;
  backoff: number;
}

interface QueryResult<T> {
  data: T | null;
  error: Error | PostgrestError | null;
  status: number;
}

// ============================================
// RETRY LOGIC
// ============================================

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  attempts: 3,
  delay: 1000,
  backoff: 2,
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  context: string = 'Unknown operation'
): Promise<T> {
  let lastError: Error | PostgrestError | null = null;
  
  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 1) {
        logger.info(`[RETRY] ${context} succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (err) {
      lastError = err as Error | PostgrestError;
      
      const isRetryable = isRetryableError(lastError);
      
      if (!isRetryable || attempt === options.attempts) {
        logError(
          `[SUPABASE] ${context} failed after ${attempt} attempt(s)`,
          lastError as Error,
          { attempt, maxAttempts: options.attempts }
        );
        throw lastError;
      }
      
      const delay = options.delay * Math.pow(options.backoff, attempt - 1);
      logger.warn(`[RETRY] ${context} failed, retrying in ${delay}ms (attempt ${attempt}/${options.attempts})`);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

function isRetryableError(err: Error | PostgrestError | null): boolean {
  if (!err) return false;
  
  // Network errors are retryable
  if (err.message.includes('network') || err.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors are retryable
  if (err.message.includes('timeout')) {
    return true;
  }
  
  // Check for specific error codes
  if ('code' in err && err.code) {
    const retryableCodes = ['500', '502', '503', '504', 'ETIMEDOUT', 'ECONNRESET'];
    return retryableCodes.includes(err.code);
  }
  
  return false;
}

// ============================================
// SUPABASE CLIENT
// ============================================

// Validate configuration
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  const errorMsg = 'Supabase configuration is missing. Check your .env file.';
  logError(errorMsg, new Error('Missing Supabase configuration'), { 
    hasUrl: !!SUPABASE_CONFIG.url, 
    hasAnonKey: !!SUPABASE_CONFIG.anonKey 
  });
  if (config.isProduction) {
    throw new Error(errorMsg);
  }
}

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ============================================
// WRAPPED QUERY FUNCTIONS WITH RETRY
// ============================================

/**
 * Execute a Supabase query with automatic retry logic
 */
export async function executeQuery<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>,
  context: string = 'Database query'
): Promise<QueryResult<T>> {
  try {
    const result = await withRetry(
      () => query,
      DEFAULT_RETRY_OPTIONS,
      context
    );
    
    if (result.error) {
      trackError(result.error as Error, {
        component: 'executeQuery',
        action: context,
      });
      
      return {
        data: null,
        error: result.error,
        status: 500,
      };
    }
    
    return {
      data: result.data,
      error: null,
      status: 200,
    };
  } catch (err) {
    const error = err as Error | PostgrestError;
    trackError(error as Error, {
      component: 'executeQuery',
      action: context,
    });
    
    return {
      data: null,
      error,
      status: 500,
    };
  }
}

// ============================================
// AUTH HELPERS
// ============================================

export async function signUp(email: string, password: string) {
  const result = await withRetry(
    () => supabase.auth.signUp({ email, password }),
    DEFAULT_RETRY_OPTIONS,
    'User signup'
  );
  return { data: result.data, error: result.error as any, status: result.error ? 500 : 200 };
}

export async function signIn(email: string, password: string) {
  const result = await withRetry(
    () => supabase.auth.signInWithPassword({ email, password }),
    DEFAULT_RETRY_OPTIONS,
    'User signin'
  );
  return { data: result.data, error: result.error as any, status: result.error ? 500 : 200 };
}

export async function signOut() {
  const result = await withRetry(
    () => supabase.auth.signOut(),
    DEFAULT_RETRY_OPTIONS,
    'User signout'
  );
  return { data: null, error: result.error as any, status: result.error ? 500 : 200 };
}

export async function getCurrentUser() {
  const result = await withRetry(
    () => supabase.auth.getUser(),
    DEFAULT_RETRY_OPTIONS,
    'Get current user'
  );
  return { data: result.data.user ? { user: result.data.user } : null, error: result.error as any, status: result.error ? 500 : 200 };
}

// ============================================
// EXPORTS
// ============================================

export type { SupabaseClient, PostgrestError, QueryResult, RetryOptions };
export { withRetry };
export default supabase;
