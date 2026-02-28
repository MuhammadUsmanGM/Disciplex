/**
 * Reckoning Archive Screen
 * View all past Weekly AI Reckonings
 * Pro Feature - gated behind subscription
 */

import { supabase } from '@/src/lib/supabase';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Paywall } from '@/src/components/ui/Paywall';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  BASE,
  BORDER,
  GOLD,
  RED,
  SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';
import { FeatureIcons } from '@/src/utils/icons';

interface Reckoning {
  id: string;
  week_start: string;
  week_score: number;
  trend: number;
  bottleneck: string | null;
  verdict: string;
  directive: string;
  generated_at: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getWeekNumber = (dateStr: string) => {
  const startDate = new Date('2024-01-01'); // Approximate app launch
  const date = new Date(dateStr + 'T00:00:00');
  const diffWeeks = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
};

export default function ReckoningArchiveScreen() {
  const router = useRouter();
  const { isPro, showPaywall, setShowPaywall, purchasePro } = useSubscription();
  const [reckonings, setReckonings] = useState<Reckoning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPro) {
      loadReckonings();
    }
  }, [isPro]);

  const loadReckonings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reckonings')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Failed to load reckonings:', error);
    } else {
      setReckonings(data as Reckoning[]);
    }
    setLoading(false);
  };

  if (!isPro) {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.lockedContainer}>
            <FeatureIcons.Crown size={48} color={GOLD} />
            <Text style={styles.lockedTitle}>Pro Feature</Text>
            <Text style={styles.lockedSubtitle}>
              Reckoning Archive is available for Pro members only.
            </Text>
            <Text style={styles.lockedDescription}>
              View your complete history of weekly verdicts and track your transformation over time.
            </Text>
            <Pressable style={styles.upgradeButton} onPress={() => setShowPaywall(true)}>
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </Pressable>
          </View>
        </ScrollView>
        <Paywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPurchase={purchasePro}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Reckoning Archive</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reckonings.length}</Text>
            <Text style={styles.statLabel}>Total Reckonings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {reckonings.length > 0
                ? Math.round(reckonings.reduce((a, b) => a + b.week_score, 0) / reckonings.length)
                : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {reckonings.filter((r) => r.trend > 0).length}
            </Text>
            <Text style={styles.statLabel}>Positive Weeks</Text>
          </View>
        </View>

        {/* Reckonings List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Loading archive...</Text>
          </View>
        ) : reckonings.length === 0 ? (
          <View style={styles.emptyState}>
            <FeatureIcons.Trophy size={40} color={GOLD} />
            <Text style={styles.emptyTitle}>No reckonings yet</Text>
            <Text style={styles.emptySubtitle}>
              Your first Weekly Reckoning will appear here after generation.
            </Text>
          </View>
        ) : (
          reckonings.map((reckoning, index) => (
            <ReckoningItem
              key={reckoning.id}
              reckoning={reckoning}
              weekNumber={getWeekNumber(reckoning.week_start)}
              delay={index * 50}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReckoningItem({
  reckoning,
  weekNumber,
  delay,
}: {
  reckoning: Reckoning;
  weekNumber: number;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.reckoningCard,
        expanded && styles.reckoningCardExpanded,
      ]}
    >
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.reckoningHeader}>
        <View style={styles.reckoningInfo}>
          <Text style={styles.reckoningWeek}>Week {weekNumber}</Text>
          <Text style={styles.reckoningDate}>{formatDate(reckoning.week_start)}</Text>
        </View>
        <View style={styles.reckoningScoreContainer}>
          <Text style={[
            styles.reckoningScore,
            { color: reckoning.week_score >= 75 ? GOLD : reckoning.week_score >= 50 ? TEXT_PRIMARY : RED }
          ]}>
            {Math.round(reckoning.week_score)}
          </Text>
          <Text style={[
            styles.reckoningTrend,
            { color: reckoning.trend >= 0 ? GOLD : RED }
          ]}>
            {reckoning.trend >= 0 ? '+' : ''}{Math.round(reckoning.trend)}%
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.reckoningContent}>
          <View style={styles.verdictSection}>
            <Text style={styles.sectionLabel}>Verdict</Text>
            <Text style={styles.verdictText}>{reckoning.verdict}</Text>
          </View>

          <View style={styles.directiveSection}>
            <Text style={styles.sectionLabel}>Directive</Text>
            <Text style={styles.directiveText}>{reckoning.directive}</Text>
          </View>

          {reckoning.bottleneck && (
            <View style={styles.bottleneckSection}>
              <Text style={styles.sectionLabel}>Bottleneck</Text>
              <Text style={styles.bottleneckText}>{reckoning.bottleneck}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.expandIndicator}>
        <Text style={styles.expandText}>{expanded ? 'Show less' : 'Show more'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 60,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 4,
    fontFamily: 'ui-monospace',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Locked State
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockedTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  lockedSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  lockedDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 10,
  },
  upgradeButtonText: {
    color: BASE,
    fontSize: 16,
    fontWeight: '700',
  },

  // Reckoning Card
  reckoningCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reckoningCardExpanded: {
    borderColor: GOLD,
  },
  reckoningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reckoningInfo: {
    flex: 1,
  },
  reckoningWeek: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  reckoningDate: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  reckoningScoreContainer: {
    alignItems: 'flex-end',
  },
  reckoningScore: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  reckoningTrend: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'ui-monospace',
    marginTop: 2,
  },
  reckoningContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  verdictSection: {
    marginBottom: 16,
  },
  directiveSection: {
    marginBottom: 16,
  },
  bottleneckSection: {
    marginBottom: 0,
  },
  sectionLabel: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  verdictText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
  },
  directiveText: {
    color: GOLD,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bottleneckText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  expandIndicator: {
    marginTop: 12,
    alignItems: 'center',
  },
  expandText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontFamily: 'ui-monospace',
  },
});
