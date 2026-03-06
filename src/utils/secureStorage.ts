/**
 * Disciplex — Secure Storage Utility
 * Encrypted storage for sensitive data with fallback to AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { logger, error as logError } from '@/src/utils/logger';

// Dynamically import expo-secure-store (may not be available in all environments)
// eslint-disable-next-line @typescript-eslint/no-require-imports
let ExpoSecureStore: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoSecureStore = require('expo-secure-store');
} catch {
  // expo-secure-store not available (web or missing dependency)
}

// Check if SecureStore is available (not available on web)
const IS_WEB = Platform.OS === 'web';
let secureStoreAvailable = !IS_WEB && !!ExpoSecureStore;

// ============================================
// TYPES
// ============================================

export interface SecureStorageOptions {
  requireAuthentication?: boolean;
  accessibleWhen?: 'always' | 'when_unlocked' | 'first_unlock' | 'after_first_unlock';
}

export interface StorageResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// ============================================
// CAPABILITY DETECTION
// ============================================

export async function checkSecureStorageAvailability(): Promise<boolean> {
  if (IS_WEB || !ExpoSecureStore) {
    secureStoreAvailable = false;
    return false;
  }

  try {
    // Check if SecureStore is available (not available on web)
    const isAvailable = await ExpoSecureStore.isAvailableAsync();
    secureStoreAvailable = isAvailable;
    logger.info('[SECURE_STORAGE] SecureStore availability:', isAvailable);
    return isAvailable;
  } catch (error) {
    logError('[SECURE_STORAGE] Failed to check SecureStore availability', error as Error);
    secureStoreAvailable = false;
    return false;
  }
}

// Initialize on module load
checkSecureStorageAvailability();

// ============================================
// ENCRYPTION HELPERS (Simple XOR for additional layer)
// ============================================

// Note: For most sensitive data, use a proper encryption library like react-native-encrypted-storage
function simpleEncrypt(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode
}

function simpleDecrypt(encrypted: string, key: string): string {
  const decoded = atob(encrypted); // Base64 decode
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

// ============================================
// SECURE STORAGE
// ============================================

const ENCRYPTION_KEY = 'disciplex_secure_key_v1'; // In production, derive from device identifiers

export async function setSecureItem(
  key: string,
  value: string,
  options?: SecureStorageOptions
): Promise<StorageResult<void>> {
  try {
    const encryptedValue = simpleEncrypt(value, ENCRYPTION_KEY);

    if (secureStoreAvailable && ExpoSecureStore) {
      await ExpoSecureStore.setItemAsync(key, encryptedValue, {
        keychainService: 'disciplex_keychain',
        requireAuthentication: options?.requireAuthentication ?? false,
        accessibleWhen: mapAccessibleWhen(options?.accessibleWhen),
      });
    } else {
      // Fallback to AsyncStorage (less secure)
      await AsyncStorage.setItem(`secure_${key}`, encryptedValue);
      logger.warn('[SECURE_STORAGE] Using AsyncStorage fallback - less secure');
    }
    
    logger.debug(`[SECURE_STORAGE] Set item: ${key}`);
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[SECURE_STORAGE] Failed to set item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function getSecureItem(
  key: string,
  options?: SecureStorageOptions
): Promise<StorageResult<string>> {
  try {
    let value: string | null = null;

    if (secureStoreAvailable && ExpoSecureStore) {
      value = await ExpoSecureStore.getItemAsync(key, {
        keychainService: 'disciplex_keychain',
        requireAuthentication: options?.requireAuthentication ?? false,
      });
    } else {
      // Fallback to AsyncStorage
      value = await AsyncStorage.getItem(`secure_${key}`);
    }
    
    if (!value) {
      return { success: true, data: null };
    }
    
    const decrypted = simpleDecrypt(value, ENCRYPTION_KEY);
    logger.debug(`[SECURE_STORAGE] Retrieved item: ${key}`);
    return { success: true, data: decrypted };
  } catch (error) {
    const err = error as Error;
    logError('[SECURE_STORAGE] Failed to get item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function deleteSecureItem(key: string): Promise<StorageResult<void>> {
  try {
    if (secureStoreAvailable && ExpoSecureStore) {
      await ExpoSecureStore.deleteItemAsync(key, {
        keychainService: 'disciplex_keychain',
      });
    } else {
      await AsyncStorage.removeItem(`secure_${key}`);
    }
    
    logger.debug(`[SECURE_STORAGE] Deleted item: ${key}`);
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[SECURE_STORAGE] Failed to delete item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function clearSecureStorage(): Promise<StorageResult<void>> {
  try {
    if (secureStoreAvailable) {
      // SecureStore doesn't have a clear all method, need to track keys separately
      await AsyncStorage.removeItem('secure_store_keys');
    } else {
      // Clear all secure_ prefixed items
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      await AsyncStorage.multiRemove(secureKeys);
    }
    
    logger.info('[SECURE_STORAGE] Cleared all secure storage');
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[SECURE_STORAGE] Failed to clear storage', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

// ============================================
// REGULAR AsyncStorage WRAPPERS
// ============================================

export async function setItem<T>(key: string, value: T): Promise<StorageResult<void>> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    logger.debug(`[STORAGE] Set item: ${key}`);
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to set item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function getItem<T>(key: string): Promise<StorageResult<T>> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) {
      return { success: true, data: null };
    }
    
    // Try to parse as JSON, fallback to string
    try {
      const parsed = JSON.parse(value) as T;
      return { success: true, data: parsed };
    } catch {
      return { success: true, data: value as unknown as T };
    }
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to get item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function removeItem(key: string): Promise<StorageResult<void>> {
  try {
    await AsyncStorage.removeItem(key);
    logger.debug(`[STORAGE] Removed item: ${key}`);
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to remove item', err, { key });
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function multiGet<T>(keys: string[]): Promise<StorageResult<Map<string, T>>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const map = new Map<string, T>();
    
    for (const [key, value] of pairs) {
      if (value !== null) {
        try {
          map.set(key, JSON.parse(value) as T);
        } catch {
          map.set(key, value as unknown as T);
        }
      }
    }
    
    return { success: true, data: map };
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to multi-get', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function multiSet<T>(entries: [string, T][]): Promise<StorageResult<void>> {
  try {
    const pairs = entries.map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ] as [string, string]);
    
    await AsyncStorage.multiSet(pairs);
    logger.debug(`[STORAGE] Multi-set ${entries.length} items`);
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to multi-set', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

export async function clearStorage(): Promise<StorageResult<void>> {
  try {
    await AsyncStorage.clear();
    logger.info('[STORAGE] Cleared all storage');
    return { success: true, data: null };
  } catch (error) {
    const err = error as Error;
    logError('[STORAGE] Failed to clear storage', err);
    return {
      success: false,
      data: null,
      error: err.message,
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapAccessibleWhen(
  accessibleWhen?: SecureStorageOptions['accessibleWhen']
): any | undefined {
  if (!accessibleWhen || !ExpoSecureStore) return undefined;

  switch (accessibleWhen) {
    case 'always':
      return ExpoSecureStore.Accessible?.ALWAYS;
    case 'when_unlocked':
      return ExpoSecureStore.Accessible?.WHEN_UNLOCKED;
    case 'first_unlock':
      return ExpoSecureStore.Accessible?.FIRST_UNLOCK_THIS;
    case 'after_first_unlock':
      return ExpoSecureStore.Accessible?.AFTER_FIRST_UNLOCK;
    default:
      return undefined;
  }
}

// ============================================
// SENSITIVE DATA KEYS
// ============================================

export const SECURE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  ENCRYPTION_KEY: 'encryption_key',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

// ============================================
// CONVENIENCE FUNCTIONS FOR AUTH
// ============================================

export async function saveAuthToken(token: string): Promise<StorageResult<void>> {
  return setSecureItem(SECURE_KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<StorageResult<string>> {
  return getSecureItem(SECURE_KEYS.AUTH_TOKEN);
}

export async function deleteAuthToken(): Promise<StorageResult<void>> {
  return deleteSecureItem(SECURE_KEYS.AUTH_TOKEN);
}

export async function saveRefreshToken(token: string): Promise<StorageResult<void>> {
  return setSecureItem(SECURE_KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken(): Promise<StorageResult<string>> {
  return getSecureItem(SECURE_KEYS.REFRESH_TOKEN);
}

export async function deleteRefreshToken(): Promise<StorageResult<void>> {
  return deleteSecureItem(SECURE_KEYS.REFRESH_TOKEN);
}
