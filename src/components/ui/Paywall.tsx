/**
 * Paywall Component
 * Disciplex Pro Tier upgrade screen
 * 
 * Reference: disciplex.md Section 7 - Monetization Strategy
 * - Free: Score visible, basic weekly summary
 * - Pro ($9.99/mo or $79.99/yr): AI Reckoning, Identity Debt, advanced analytics
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PACKAGE_TYPE } from 'react-native-purchases';

import {
  BASE,
  BORDER,
  GOLD,
  GOLD_SUBTLE,
  RED,
  SURFACE,
  SURFACE_2,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';
import { getSubscriptionPackages, formatPrice, PRICING } from '@/src/lib/payments';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (packageType: 'monthly' | 'yearly') => Promise<boolean>;
  restoring?: boolean;
}

interface SubscriptionPackage {
  type: 'monthly' | 'yearly';
  price: string;
  priceString: string;
  description: string;
}

export function Paywall({ visible, onClose, onPurchase, restoring }: PaywallProps) {
  const [selectedPackage, setSelectedPackage] = useState<'monthly' | 'yearly'>('yearly');
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const { monthly, yearly } = await getSubscriptionPackages();

      const loadedPackages: SubscriptionPackage[] = [
        {
          type: 'monthly',
          price: formatPrice(monthly?.priceString),
          priceString: monthly?.priceString ?? PRICING.MONTHLY,
          description: 'Billed monthly',
        },
        {
          type: 'yearly',
          price: formatPrice(yearly?.priceString),
          priceString: yearly?.priceString ?? PRICING.YEARLY,
          description: `${PRICING.YEARLY_SAVINGS} — Billed annually`,
        },
      ];

      setPackages(loadedPackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
      // Fallback to default pricing
      setPackages([
        {
          type: 'monthly',
          price: PRICING.MONTHLY,
          priceString: PRICING.MONTHLY,
          description: 'Billed monthly',
        },
        {
          type: 'yearly',
          price: PRICING.YEARLY,
          priceString: PRICING.YEARLY,
          description: `${PRICING.YEARLY_SAVINGS} — Billed annually`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await onPurchase(selectedPackage);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Disciplex Pro</Text>
            <Text style={styles.subtitle}>
              The only app that tells you the truth about who you are becoming.
            </Text>
          </View>

          {/* Score Preview */}
          <View style={styles.scorePreview}>
            <Text style={styles.previewScore}>68</Text>
            <Text style={styles.previewLabel}>DRIFTING</Text>
            <View style={styles.previewDivider} />
            <Text style={styles.previewVerdict}>
              "Your data does not support your identity claim this week."
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What You Get</Text>

            <FeatureItem
              icon="⚖"
              title="Weekly AI Reckoning"
              description="Cold, analytical verdict on your execution. No motivation — just truth."
            />

            <FeatureItem
              icon="📊"
              title="Identity Debt Engine"
              description="Track the accumulating cost of missed non-negotiables."
            />

            <FeatureItem
              icon="📈"
              title="Advanced Analytics"
              description="30-day trends, volatility index, bottleneck detection."
            />

            <FeatureItem
              icon="📤"
              title="Unlimited Share Cards"
              description="Export your reckoning. Let the data speak."
            />

            <FeatureItem
              icon="📚"
              title="Reckoning Archive"
              description="Full history of every verdict. Track your transformation."
            />
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GOLD} />
              </View>
            ) : (
              <View style={styles.packageContainer}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.type}
                    style={[
                      styles.packageCard,
                      selectedPackage === pkg.type && styles.packageCardSelected,
                    ]}
                    onPress={() => setSelectedPackage(pkg.type)}
                  >
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageType}>
                        {pkg.type === 'monthly' ? 'Monthly' : 'Yearly'}
                      </Text>
                      {pkg.type === 'yearly' && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>Save 33%</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.packagePrice}>{pkg.price}</Text>
                    <Text style={styles.packageDescription}>{pkg.description}</Text>

                    {selectedPackage === pkg.type && (
                      <View style={styles.selectedIndicator}>
                        <View style={styles.selectedDot} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing || loading}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#0A0A0A" />
              ) : (
                <Text style={styles.ctaText}>
                  Start Pro — {selectedPackage === 'monthly' ? '$9.99/mo' : '$79.99/yr'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.ctaSubtext}>
              Cancel anytime. No questions asked.
            </Text>
          </View>

          {/* Restore */}
          <TouchableOpacity style={styles.restoreButton} onPress={onClose}>
            <Text style={styles.restoreText}>Already Pro? Restore</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Free tier includes: Score display, habit logging, basic weekly summary.
            </Text>
            <Text style={styles.footerText}>
              Pro is for those serious about execution.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE_2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 20,
    fontWeight: '400',
  },

  // Title
  titleSection: {
    marginBottom: 24,
  },
  title: {
    color: GOLD,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
  },

  // Score Preview
  scorePreview: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  previewScore: {
    color: TEXT_PRIMARY,
    fontSize: 72,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    letterSpacing: -2,
  },
  previewLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginTop: 4,
    marginBottom: 16,
  },
  previewDivider: {
    width: 60,
    height: 2,
    backgroundColor: BORDER,
    marginBottom: 16,
  },
  previewVerdict: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Features
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
  },

  // Pricing
  pricingSection: {
    marginBottom: 24,
  },
  pricingTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  packageContainer: {
    gap: 12,
  },
  packageCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: GOLD,
    backgroundColor: GOLD_SUBTLE,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageType: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  savingsBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savingsText: {
    color: '#0A0A0A',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  packagePrice: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  packageDescription: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontFamily: 'ui-monospace',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  selectedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GOLD,
  },

  // CTA
  ctaSection: {
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaSubtext: {
    color: TEXT_MUTED,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'ui-monospace',
  },

  // Restore
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  restoreText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: 'ui-monospace',
  },

  // Footer
  footer: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'ui-monospace',
  },
});
