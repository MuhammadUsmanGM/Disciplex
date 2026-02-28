import { useSound } from '@/src/hooks/useSound';
import { useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BORDER,
  GOLD,
  RED,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  getScoreColor
} from '@/constants/theme';
import { ReckoningCard } from '@/src/components/reckoning/ReckoningCard';
import { ShareCardWrapper } from '@/src/components/reckoning/ShareCard';
import { IdentityIntegrity } from '@/src/components/ui/IdentityIntegrity';
import { Paywall } from '@/src/components/ui/Paywall';
import { SkeletonCard } from '@/src/components/ui/Skeleton';
import { TypewriterText } from '@/src/components/ui/TypewriterText';
import { buildReckoningPayload, useReckoning } from '@/src/hooks/useReckoning';
import { useSubscription } from '@/src/hooks/useSubscription';
import { detectBottleneck } from '@/src/lib/scoring';
import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';

const BAR_MAX_HEIGHT = 80;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getLast7DateStrings(): string[] {
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

function getDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export default function InsightsScreen() {
  const { habits, completions, scoreHistory, identityDebt, getLast7DayScores } = useHabitStore();
  const [identityClaim, setIdentityClaim] = useState<string>('');
  const [refuseToBe, setRefuseToBe] = useState<string>('');
  
  const { loading, error, reckoning, generateReckoning, reset } = useReckoning();
  const { isPro, showPaywall, setShowPaywall, purchasePro, purchaseError } = useSubscription();

  useFocusEffect(
    useCallback(() => {
      useHabitStore.getState().recalculateAndSaveScore();
    }, []),
  );

  // Load identity data
  useFocusEffect(
    useCallback(() => {
      const fetchIdentity = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('identity_claim, refuse_to_be')
            .eq('id', user.id)
            .single();
          if (data) {
            setIdentityClaim(data.identity_claim || '');
            setRefuseToBe(data.refuse_to_be || '');
          }
        }
      };
      fetchIdentity();
    }, []),
  );

  const last7Dates = getLast7DateStrings();

  // Build 7-day bar chart data
  const barData = last7Dates.map((date) => {
    const entry = scoreHistory.find((s) => s.date === date);
    return {
      date,
      label: getDayLabel(date),
      score: entry?.score ?? null,
    };
  });

  // Trend: compare last 7 avg vs prior 7 avg
  const trend = useMemo(() => {
    const last7 = scoreHistory.slice(-7).map((s) => s.score);
    const prior7 = scoreHistory.slice(-14, -7).map((s) => s.score);
    if (last7.length === 0) return null;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const last7Avg = avg(last7);
    if (prior7.length === 0) return { value: last7Avg, delta: null };
    const delta = last7Avg - avg(prior7);
    return { value: Math.round(last7Avg * 10) / 10, delta: Math.round(delta * 10) / 10 };
  }, [scoreHistory]);

  // Most missed habit (last 7 days)
  const mostMissed = useMemo(() => {
    if (habits.length === 0) return null;
    const missCount: Record<string, number> = {};
    for (const date of last7Dates) {
      const dayCompletions = completions.filter((c) => c.date === date && c.completed);
      for (const habit of habits) {
        const done = dayCompletions.some((c) => c.habit_id === habit.id);
        if (!done) missCount[habit.id] = (missCount[habit.id] ?? 0) + 1;
      }
    }
    const sorted = Object.entries(missCount).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const [habitId, count] = sorted[0];
    const habit = habits.find((h) => h.id === habitId);
    return habit ? { name: habit.name, missedDays: count } : null;
  }, [habits, completions, last7Dates]);

  // Bottleneck detection
  const bottleneck = useMemo(() => {
    if (habits.length === 0) return null;
    const weeklyCompletions = last7Dates.map((date) => ({
      date,
      completions: completions.filter((c) => c.date === date && c.completed),
    }));
    const weeklyScores = last7Dates.map((date) => ({
      date,
      score: scoreHistory.find((s) => s.date === date)?.score ?? 0,
    }));
    return detectBottleneck(habits, weeklyCompletions, weeklyScores);
  }, [habits, completions, scoreHistory, last7Dates]);

  const stabilityIndex = useMemo(() => {
    const scores = scoreHistory.slice(-30).map((s) => s.score);
    if (scores.length < 2) return null;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    // Convert to a 0-100 stability scale where 0 deviation is 100 stability
    const stability = Math.max(0, 100 - (standardDeviation * 3));
    return Math.round(stability);
  }, [scoreHistory]);

  const hasData = scoreHistory.length > 0;
  const isLoading = !hasData && scoreHistory.length === 0;

  // Calculate 30-day trend data for line chart
  const trend30DayData = useMemo(() => {
    const last30Scores = scoreHistory.slice(-30).map((s) => ({
      date: s.date,
      score: s.score,
    }));
    return last30Scores;
  }, [scoreHistory]);

  // Calculate week score (average of last 7 days)
  const weekScore = useMemo(() => {
    const last7 = scoreHistory.slice(-7).map((s) => s.score);
    if (last7.length === 0) return 0;
    return last7.reduce((a, b) => a + b, 0) / last7.length;
  }, [scoreHistory]);

  // Calculate previous week score for trend
  const previousWeekScore = useMemo(() => {
    const prior7 = scoreHistory.slice(-14, -7).map((s) => s.score);
    if (prior7.length === 0) return weekScore;
    return prior7.reduce((a, b) => a + b, 0) / prior7.length;
  }, [scoreHistory, weekScore]);

  // Calculate 30-day trend
  const trend30d = useMemo(() => {
    const last30 = scoreHistory.slice(-30).map((s) => s.score);
    if (last30.length < 2) return 0;
    const firstHalf = last30.slice(0, Math.floor(last30.length / 2));
    const secondHalf = last30.slice(Math.floor(last30.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (firstAvg === 0) return 0;
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  }, [scoreHistory]);

  const { playSound } = useSound();

  // Handle generate reckoning
  const handleGenerateReckoning = useCallback(async () => {
    if (!identityClaim || !refuseToBe) {
      return;
    }

    const habitsData = habits.map((h) => {
      const completedCount = last7Dates.filter((date) => {
        const dayCompletions = completions.filter((c) => c.date === date && c.completed);
        return dayCompletions.some((c) => c.habit_id === h.id);
      }).length;
      return {
        name: h.name,
        completionRate: completedCount / 7,
        isNonNegotiable: h.is_non_negotiable,
      };
    });

    const payload = buildReckoningPayload({
      identityClaim,
      refuseToBe,
      weekScore: Math.round(weekScore * 10) / 10,
      previousWeekScore: Math.round(previousWeekScore * 10) / 10,
      trend30d,
      volatilityIndex: stabilityIndex ? (100 - stabilityIndex)/3 : 0,
      identityAlignment: Math.round(weekScore * 10) / 10,
      identityDebt,
      habits: habitsData,
    });

    await generateReckoning(payload);
    playSound('CHECK', 0.5);
  }, [identityClaim, refuseToBe, habits, completions, last7Dates, weekScore, previousWeekScore, trend30d, stabilityIndex, identityDebt, generateReckoning, playSound]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>COMMAND CENTER</Text>
            <Text style={styles.headerSub}>IDENTITY DIAGNOSTICS // PROTOCOL V.01</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.systemStatusBadge}>
               <View style={styles.statusDot} />
               <Text style={styles.statusText}>STATUS: NOMINAL</Text>
            </View>
            {hasData && (
               <ShareCardWrapper score={barData[barData.length - 1]?.score ?? 0} isPro={isPro} />
            )}
          </View>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <SkeletonCard delay={0} />
            <SkeletonCard delay={200} />
            <SkeletonCard delay={400} />
          </View>
        ) : (
          <>
        {/* Diagnostic Grid */}
        <View style={styles.diagnosticGrid}>
           <MotiView 
             from={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             style={styles.primaryDiag}
           >
              <IdentityIntegrity score={weekScore} />
              <Text style={styles.primaryLabel}>INTEGRITY_INDEX</Text>
           </MotiView>
           <View style={styles.secondaryDiag}>
              <StatCard
                label="STABILITY_INDEX"
                value={stabilityIndex != null ? `${stabilityIndex}%` : '—'}
                sub={
                  stabilityIndex == null
                    ? undefined
                    : stabilityIndex > 80
                    ? 'OPTIMIZED_VECTOR'
                    : stabilityIndex > 60
                    ? 'STEADY_STATE'
                    : 'VOLATILE_BREACH'
                }
                subColor={
                  stabilityIndex == null
                    ? undefined
                    : stabilityIndex > 80
                    ? GOLD
                    : stabilityIndex > 60
                    ? TEXT_SECONDARY
                    : RED
                }
              />
              <StatCard
                label="GROWTH_VECTOR"
                value={trend?.delta != null ? `${trend.delta >= 0 ? '+' : ''}${trend.delta}%` : '—'}
                sub="DELTA_VARIANCE"
                subColor={trend?.delta != null ? (trend.delta >= 0 ? GOLD : RED) : undefined}
              />
           </View>
        </View>

        {/* 7-Day Bar Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 100 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
             <Text style={styles.cardLabel}>EXECUTION_HISTOGRAM — 7_DAY_CYCLE</Text>
             <Text style={styles.verText}>V.01</Text>
          </View>
          <View style={styles.chart}>
             {/* Scanner line for the chart */}
             <MotiView
               from={{ translateY: 0 }}
               animate={{ translateY: BAR_MAX_HEIGHT }}
               transition={{ type: 'timing', duration: 4000, loop: true }}
               style={styles.scannerLine}
             />
            {barData.map((item, i) => {
              const hasScore = item.score !== null;
              const height = hasScore
                ? Math.max(4, (item.score! / 100) * BAR_MAX_HEIGHT)
                : 4;
              const color = hasScore ? getScoreColor(item.score!) : BORDER;
              const isToday = i === barData.length - 1;

              return (
                <View key={item.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor: color,
                          opacity: isToday ? 1 : 0.65,
                        },
                      ]}
                    />
                  </View>
                  {hasScore && (
                    <Text style={[styles.barScore, { color }]}>
                      {Math.round(item.score!)}
                    </Text>
                  )}
                  <Text style={[styles.barDay, isToday && styles.barDayToday]}>
                    {item.label.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
          {!hasData && (
            <Text style={styles.emptyChart}>Log habits to see your execution chart.</Text>
          )}
        </MotiView>

        {/* 30-Day Trend Chart */}
        {trend30DayData.length > 7 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardLabel}>Trend — 30 Days</Text>
            <View style={styles.trendChart}>
              {trend30DayData.map((item, i, arr) => {
                const isLast = i === arr.length - 1;
                const prevItem = arr[i - 1];
                const trend = prevItem ? item.score - prevItem.score : 0;
                
                return (
                  <View key={item.date} style={[styles.trendPoint, { left: `${(i / (arr.length - 1)) * 100}%` }]}>
                    <View
                      style={[
                        styles.trendDot,
                        {
                          backgroundColor: getScoreColor(item.score),
                          top: 100 - item.score,
                        },
                      ]}
                    />
                    {i > 0 && prevItem && (
                      <View
                        style={[
                          styles.trendLine,
                          {
                            left: `${((i - 1) / (arr.length - 1)) * 100}%`,
                            width: `${100 / (arr.length - 1)}%`,
                            transform: [
                              { rotate: `${Math.atan2(item.score - prevItem.score, 1) * (180 / Math.PI)}deg` },
                            ],
                            top: 100 - prevItem.score,
                          },
                        ]}
                      />
                    )}
                    {isLast && (
                      <Text style={[styles.trendScore, { color: getScoreColor(item.score) }]}>
                        {Math.round(item.score)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={styles.trendLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
                <Text style={styles.legendText}>≥75 Aligned</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: TEXT_PRIMARY }]} />
                <Text style={styles.legendText}>50-74 Drifting</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: RED }]} />
                <Text style={styles.legendText}>{'<'}50 Gap</Text>
              </View>
            </View>
          </MotiView>
        )}

        {/* Most Missed */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 300 }}
          style={styles.card}
        >
          <Text style={styles.cardLabel}>Most Missed</Text>
          {mostMissed ? (
            <View style={styles.missedRow}>
              <View style={styles.missedDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.missedName}>{mostMissed.name}</Text>
                <Text style={styles.missedSub}>
                  Missed {mostMissed.missedDays} of 7 days this week
                </Text>
              </View>
              <Text style={styles.missedCount}>{mostMissed.missedDays}/7</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {hasData ? 'All habits completed every day. Rare.' : 'No data yet.'}
            </Text>
          )}
        </MotiView>

        {/* Bottleneck Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 300 }}
          style={[styles.card, bottleneck ? styles.cardDanger : null]}
        >
          <View style={styles.cardHeader}>
             <Text style={styles.cardLabel}>SYSTEM BOTTLENECK</Text>
             <View style={[styles.statusIndicator, { backgroundColor: bottleneck ? RED : GOLD }]} />
          </View>
          {bottleneck ? (
            <View>
              <Text style={styles.bottleneckName}>{bottleneck.habitName.toUpperCase()}</Text>
              <TypewriterText 
                text={`COMPLETION RATE AT ${Math.round(bottleneck.completionRate * 100)}%. FAILURE IN THIS BEHAVIOR CORRELATES WITH A SYSTEMATIC DROP IN DAILY ALIGNMENT.`}
                speed={20}
                style={styles.bottleneckDetail}
              />
              <MotiView
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ type: 'timing', duration: 800, loop: true }}
              >
                <Text style={styles.bottleneckVerdict}>
                  [ CRITICAL ERROR: RESTRUCTURE PROTOCOL ]
                </Text>
              </MotiView>
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {hasData
                ? 'No structural identity blocks detected in present data set.'
                : 'Insufficient data for bottleneck analysis.'}
            </Text>
          )}
        </MotiView>

        {/* Weekly AI Reckoning - Pro Feature */}
        {identityClaim && (
          <View style={styles.reckoningSection}>
            <View style={styles.reckoningHeader}>
              <View>
                <Text style={styles.reckoningTitle}>AI RECKONING ENGINE</Text>
                <Text style={styles.reckoningSubtitle}>
                  ANALYZING BEHAVIORAL DEBT & IDENTITY DRIFT
                </Text>
              </View>
              {!isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>

            {!isPro ? (
              <TouchableOpacity
                style={styles.lockedReckoning}
                onPress={() => setShowPaywall(true)}
              >
                <View style={styles.lockedContent}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <View>
                    <Text style={styles.lockedTitle}>Restricted Access</Text>
                    <Text style={styles.lockedSubtitle}>
                      Require level 1 clearance for AI diagnostics.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => setShowPaywall(true)}
                >
                  <Text style={styles.upgradeButtonText}>UPGRADE</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <>
                {!reckoning && !loading && (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReckoning}
                  >
                    <Text style={styles.generateButtonText}>INITIALIZE RECKONING</Text>
                  </TouchableOpacity>
                )}

                {loading && (
                  <View style={styles.loadingContainerLarge}>
                    <ActivityIndicator size="large" color={GOLD} />
                    <Text style={styles.loadingText}>EXTRACTING BEHAVIORAL PATTERNS...</Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleGenerateReckoning}
                    >
                      <Text style={styles.retryButtonText}>RETRY</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {reckoning && (
                  <>
                    <ReckoningCard
                      reckoning={reckoning}
                      weekScore={weekScore}
                      trend={trend?.delta || 0}
                    />
                    <TouchableOpacity
                      style={styles.newReckoningButton}
                      onPress={handleGenerateReckoning}
                    >
                      <Text style={styles.newReckoningButtonText}>UPDATE VERDICT</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* Paywall Modal */}
        <Paywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPurchase={purchasePro}
        />
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string; }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
      {sub && <Text style={[statStyles.sub, subColor ? { color: subColor } : null]}>{sub}</Text>}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  value: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
  },
  sub: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 2,
    fontFamily: 'ui-monospace',
    fontWeight: '700',
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.03)', 
    paddingBottom: 16 
  },
  headerLabel: { 
    color: GOLD, 
    fontSize: 16, 
    fontWeight: '900', 
    letterSpacing: 4, 
    fontFamily: 'ui-monospace' 
  },
  headerSub: { 
    color: TEXT_MUTED, 
    fontSize: 10, 
    fontFamily: 'ui-monospace', 
    letterSpacing: 1.5, 
    marginTop: 4 
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  systemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(42, 122, 75, 0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(42, 122, 75, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A7A4B',
  },
  statusText: {
    color: '#2A7A4B',
    fontSize: 8,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  loadingContainer: { gap: 16 },
  diagnosticGrid: { flexDirection: 'row', gap: 12, marginBottom: 20, height: 160 },
  primaryDiag: { 
    flex: 1.2, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  primaryLabel: {
    position: 'absolute',
    bottom: 12,
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    letterSpacing: 2,
    fontWeight: '800',
  },
  secondaryDiag: { flex: 1, gap: 12 },
  card: { 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 8, 
    padding: 20, 
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardDanger: { 
    borderColor: 'rgba(204, 0, 0, 0.3)', 
    backgroundColor: 'rgba(204, 0, 0, 0.03)' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  verText: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
  },
  statusIndicator: { width: 4, height: 4, borderRadius: 2 },
  cardLabel: { 
    color: GOLD, 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 2, 
    fontFamily: 'ui-monospace' 
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    zIndex: 10,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_MAX_HEIGHT + 20, position: 'relative' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { height: BAR_MAX_HEIGHT, justifyContent: 'flex-end', width: '50%', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 2 },
  bar: { width: '100%', borderRadius: 2, minHeight: 4 },
  barScore: {
    fontSize: 9,
    fontFamily: 'ui-monospace',
    marginTop: 4,
    fontWeight: '700',
  },
  barDay: { color: TEXT_MUTED, fontSize: 8, fontFamily: 'ui-monospace', marginTop: 8, fontWeight: '700' },
  barDayToday: { color: GOLD },
  emptyChart: { color: TEXT_MUTED, fontSize: 13, textAlign: 'center', marginTop: 8, fontFamily: 'ui-monospace' },
  
  // 30-Day Trend Chart
  trendChart: {
    height: 120,
    position: 'relative',
    marginBottom: 20,
    paddingTop: 20,
  },
  trendPoint: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trendLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transformOrigin: 'left center',
  },
  trendScore: {
    fontSize: 8,
    fontFamily: 'ui-monospace',
    marginTop: 6,
    fontWeight: '800',
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Most missed
  missedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  missedDot: {
    width: 2,
    height: 20,
    backgroundColor: RED,
  },
  missedName: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
  },
  missedSub: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'ui-monospace',
  },
  missedCount: {
    color: RED,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
  },
  bottleneckName: { color: TEXT_PRIMARY, fontSize: 15, fontWeight: '900', marginBottom: 8, fontFamily: 'ui-monospace', letterSpacing: 1 },
  bottleneckDetail: { color: TEXT_SECONDARY, fontSize: 11, lineHeight: 18, marginBottom: 12, fontFamily: 'ui-monospace' },
  bottleneckVerdict: { color: RED, fontSize: 10, fontFamily: 'ui-monospace', fontWeight: '900', letterSpacing: 1 },
  emptyText: { color: TEXT_MUTED, fontSize: 10, lineHeight: 16, fontFamily: 'ui-monospace', letterSpacing: 0.5 },
  
  reckoningSection: { marginTop: 12, marginBottom: 20 },
  reckoningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 12 },
  reckoningTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '900', letterSpacing: 3, marginBottom: 4, fontFamily: 'ui-monospace' },
  reckoningSubtitle: { color: TEXT_SECONDARY, fontSize: 10, letterSpacing: 1.5, fontFamily: 'ui-monospace' },
  proBadge: { backgroundColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2 },
  proBadgeText: { color: '#0A0A0A', fontSize: 9, fontWeight: '900', letterSpacing: 2, fontFamily: 'ui-monospace' },
  
  lockedReckoning: { backgroundColor: 'rgba(255,255,255,0.01)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockedContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 20 },
  lockIcon: { fontSize: 24, opacity: 0.5 },
  lockedTitle: { color: TEXT_PRIMARY, fontSize: 13, fontWeight: '900', marginBottom: 6, fontFamily: 'ui-monospace', letterSpacing: 1 },
  lockedSubtitle: { color: TEXT_SECONDARY, fontSize: 10, lineHeight: 16, fontFamily: 'ui-monospace', letterSpacing: 0.5 },
  upgradeButton: { backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 4 },
  upgradeButtonText: { color: '#0A0A0A', fontSize: 11, fontWeight: '900', fontFamily: 'ui-monospace', letterSpacing: 1 },
  
  generateButton: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  generateButtonText: { color: '#0A0A0A', fontSize: 13, fontWeight: '900', letterSpacing: 3, fontFamily: 'ui-monospace' },
  loadingContainerLarge: { backgroundColor: 'rgba(255,255,255,0.01)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 48, alignItems: 'center' },
  loadingText: { color: GOLD, fontSize: 10, marginTop: 20, fontFamily: 'ui-monospace', fontWeight: '900', letterSpacing: 2 },
  errorContainer: { backgroundColor: 'rgba(204, 0, 0, 0.03)', borderWidth: 1, borderColor: 'rgba(204, 0, 0, 0.2)', borderRadius: 8, padding: 24, alignItems: 'center' },
  errorText: { color: RED, fontSize: 11, textAlign: 'center', marginBottom: 20, fontFamily: 'ui-monospace', letterSpacing: 0.5 },
  retryButton: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4, paddingVertical: 14, paddingHorizontal: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  retryButtonText: { color: TEXT_PRIMARY, fontSize: 11, fontWeight: '800', fontFamily: 'ui-monospace', letterSpacing: 1 },
  newReckoningButton: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 4, paddingVertical: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  newReckoningButtonText: { color: TEXT_MUTED, fontSize: 10, fontWeight: '900', fontFamily: 'ui-monospace', letterSpacing: 3 },
});