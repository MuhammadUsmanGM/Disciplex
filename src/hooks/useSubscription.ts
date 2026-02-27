/**
 * useSubscription Hook
 * Manages subscription state, paywall display, and purchase flow
 */

import { useEffect, useCallback, useState } from 'react';
import { PACKAGE_TYPE } from 'react-native-purchases';

import {
  getSubscriptionStatus,
  initializeRevenueCat,
  isProUser,
  purchaseMonthly,
  purchaseYearly,
  restorePurchases,
  SubscriptionStatus,
  TIERS,
  Tier,
} from '@/src/lib/payments';

interface UseSubscriptionReturn {
  isPro: boolean;
  tier: Tier;
  loading: boolean;
  showPaywall: boolean;
  purchaseError: string | null;
  refreshStatus: () => Promise<void>;
  purchasePro: (packageType: 'monthly' | 'yearly') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
}

/**
 * Hook for managing subscription state and purchase flow
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isPro: false,
    tier: TIERS.FREE,
  });
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  /**
   * Refresh subscription status from RevenueCat
   */
  const refreshStatus = useCallback(async () => {
    try {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize RevenueCat and load subscription status
   */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // Note: RevenueCat is initialized in _layout.tsx after auth
      // Here we just load the status
      await refreshStatus();
    };

    init();
  }, [refreshStatus]);

  /**
   * Purchase Pro subscription
   */
  const purchasePro = useCallback(
    async (packageType: 'monthly' | 'yearly'): Promise<boolean> => {
      setPurchaseError(null);

      try {
        const result =
          packageType === 'monthly'
            ? await purchaseMonthly()
            : await purchaseYearly();

        if (result.success) {
          await refreshStatus();
          setShowPaywall(false);
          return true;
        } else {
          setPurchaseError('Purchase failed. Please try again.');
          return false;
        }
      } catch (error: any) {
        if (error.userCancelled) {
          return false;
        }
        setPurchaseError(error.message || 'Purchase failed');
        return false;
      }
    },
    [refreshStatus],
  );

  /**
   * Restore purchases
   */
  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await restorePurchases();
      
      if (customerInfo) {
        const activeEntitlements = Object.keys(customerInfo.entitlements.active);
        if (activeEntitlements.length > 0) {
          await refreshStatus();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }, [refreshStatus]);

  return {
    isPro: subscriptionStatus.isPro,
    tier: subscriptionStatus.tier,
    loading,
    showPaywall,
    purchaseError,
    refreshStatus,
    purchasePro,
    restorePurchases: restore,
    setShowPaywall,
  };
}
