/**
 * Disciplex Payment System — RevenueCat Integration
 * Handles Pro Tier subscriptions ($9.99/month or $79.99/year)
 *
 * Reference: disciplex.md Section 7 - Monetization Strategy
 */

import { Platform } from 'react-native';
import { Constants } from 'expo-constants';
import Purchases, {
  CustomerInfo,
  PACKAGE_TYPE,
  PurchasesOffering,
  PurchasesStoreProduct,
} from 'react-native-purchases';

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

// Subscription tiers
export const TIERS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

// Pricing info
export const PRICING = {
  MONTHLY: '$9.99/month',
  YEARLY: '$79.99/year',
  YEARLY_SAVINGS: 'Save 33%',
} as const;

/**
 * Initialize RevenueCat SDK
 * Call this on app start after auth is initialized
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('RevenueCat: Skipping initialization on Web platform.');
    return;
  }

  // Skip RevenueCat in Expo Go (native modules not available)
  if (Constants.expoConfig) {
    console.log('RevenueCat: Skipping initialization in Expo Go. Use a development build.');
    return;
  }

  if (!REVENUECAT_API_KEY) {
    console.log('RevenueCat: API key not configured.');
    return;
  }

  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });
    console.log('RevenueCat initialized for user:', userId);
  } catch (error) {
    // Silently fail in development
    console.log('RevenueCat: Initialization skipped (Expo Go or invalid key)');
  }
}

/**
 * Set the app user ID (call when user logs in/out)
 */
export async function setAppUserId(userId: string): Promise<void> {
  if (!REVENUECAT_API_KEY) return;

  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Failed to set app user ID:', error);
  }
}

/**
 * Log out the current user from RevenueCat
 */
export async function logOutFromRevenueCat(): Promise<void> {
  if (!REVENUECAT_API_KEY) return;
  
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to log out from RevenueCat:', error);
  }
}

/**
 * Get current customer info (subscription status)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === 'web' || !REVENUECAT_API_KEY) return null;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user has active Pro subscription
 */
export async function isProUser(): Promise<boolean> {
  if (!REVENUECAT_API_KEY) return false;

  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    // Check for any active entitlement (Pro)
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    return activeEntitlements.length > 0;
  } catch (error) {
    console.error('Failed to check Pro status:', error);
    return false;
  }
}

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!REVENUECAT_API_KEY) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Get monthly and yearly packages from current offering
 */
export async function getSubscriptionPackages(): Promise<{
  monthly: PurchasesStoreProduct | null;
  yearly: PurchasesStoreProduct | null;
}> {
  const offering = await getOfferings();

  if (!offering) {
    return { monthly: null, yearly: null };
  }

  const monthlyPackage = offering.availablePackages.find(
    (pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY
  );
  const yearlyPackage = offering.availablePackages.find(
    (pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL
  );

  return {
    monthly: monthlyPackage?.product ?? null,
    yearly: yearlyPackage?.product ?? null,
  };
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(
  packageType: PACKAGE_TYPE,
): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  if (!REVENUECAT_API_KEY) {
    return { success: false };
  }

  try {
    const offering = await getOfferings();
    if (!offering) {
      throw new Error('No offerings available');
    }

    const pkg = offering.availablePackages.find(
      (p) => p.packageType === packageType
    );
    if (!pkg) {
      throw new Error(`Package ${packageType} not found`);
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return { success: false };
    }
    console.error('Purchase failed:', error);
    return { success: false };
  }
}

/**
 * Purchase monthly subscription
 */
export async function purchaseMonthly(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  return purchasePackage(PACKAGE_TYPE.MONTHLY);
}

/**
 * Purchase yearly subscription
 */
export async function purchaseYearly(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  return purchasePackage(PACKAGE_TYPE.ANNUAL);
}

/**
 * Restore purchases (for users who reinstalled app)
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!REVENUECAT_API_KEY) return null;

  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return null;
  }
}

/**
 * Get subscription status details
 */
export interface SubscriptionStatus {
  isPro: boolean;
  tier: Tier;
  expirationDate?: string;
  willRenew?: boolean;
  originalPurchaseDate?: string;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isPro: false,
    tier: TIERS.FREE,
  };

  if (!REVENUECAT_API_KEY) {
    return defaultStatus;
  }

  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) {
      return defaultStatus;
    }

    const activeEntitlements = Object.keys(customerInfo.entitlements.active);

    if (activeEntitlements.length === 0) {
      return defaultStatus;
    }

    // Get the first active entitlement (Pro)
    const entitlement = customerInfo.entitlements.active[activeEntitlements[0]];

    return {
      isPro: true,
      tier: TIERS.PRO,
      expirationDate: entitlement.expirationDate ?? undefined,
      willRenew: entitlement.willRenew,
      originalPurchaseDate: entitlement.originalPurchaseDate ?? undefined,
    };
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return defaultStatus;
  }
}

/**
 * Format price from product
 */
export function formatPrice(priceString?: string): string {
  if (!priceString) return PRICING.MONTHLY;
  return priceString;
}

/**
 * Calculate savings percentage for yearly vs monthly
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - yearlyPrice;
  return Math.round((savings / monthlyTotal) * 100);
}
