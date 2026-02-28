import { useFocusEffect } from 'expo-router';
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
    BASE,
    BORDER,
    GOLD,
    RED,
    SURFACE,
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    getScoreColor,
} from '@/constants/theme';
import { ReckoningCard } from '@/src/components/reckoning/ReckoningCard';
import { ShareCardWrapper } from '@/src/components/reckoning/ShareCard';
import { Paywall } from '@/src/components/ui/Paywall';
import { SkeletonCard } from '@/src/components/ui/Skeleton';
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

  // Current score + volatility

  const volatility = useMemo(() => {
    const scores = scoreHistory.slice(-30).map((s) => s.score);
    if (scores.length < 2) return null;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / scores.length;
    return Math.round(Math.sqrt(variance) * 10) / 10;
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
      volatilityIndex: volatility || 0,
      identityAlignment: Math.round(weekScore * 10) / 10,
      identityDebt,
      habits: habitsData,
    });

    await generateReckoning(payload);
  }, [identityClaim, refuseToBe, habits, completions, last7Dates, weekScore, previousWeekScore, trend30d, volatility, identityDebt, generateReckoning]);

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
            <Text style={styles.headerLabel}>Insights</Text>
            <Text style={styles.headerSub}>Last 7 days</Text>
          </View>
          {hasData && (
             <ShareCardWrapper score={barData[barData.length - 1]?.score ?? 0} isPro={isPro} />
          )}
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
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="7-Day Avg"
            value={trend ? String(trend.value) : '—'}
            sub={
              trend?.delta != null
                ? `${trend.delta >= 0 ? '+' : ''}${trend.delta} vs prior week`
                : undefined
            }
            subColor={trend?.delta != null ? (trend.delta >= 0 ? GOLD : RED) : undefined}
          />
          <StatCard
            label="Identity Debt"
            value={identityDebt > 0 ? String(Math.round(identityDebt)) : '0'}
            sub={identityDebt > 0 ? 'pts active' : 'Clear'}
            subColor={identityDebt > 0 ? RED : GOLD}
          />
          <StatCard
            label="Volatility"
            value={volatility != null ? String(volatility) : '—'}
            sub={
              volatility == null
                ? undefined
                : volatility < 10
                ? 'Consistent'
                : volatility < 20
                ? 'Unstable'
                : 'No pattern'
            }
            subColor={
              volatility == null
                ? undefined
                : volatility < 10
                ? GOLD
                : volatility < 20
                ? TEXT_SECONDARY
                : RED
            }
          />
        </View>

        {/* 7-Day Bar Chart */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Execution — 7 Days</Text>
          <View style={styles.chart}>
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
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {!hasData && (
            <Text style={styles.emptyChart}>Log habits to see your execution chart.</Text>
          )}
        </View>

        {/* 30-Day Trend Chart */}
        {trend30DayData.length > 7 && (
          <View style={styles.card}>
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
          </View>
        )}

        {/* Most Missed */}
        <View style={styles.card}>
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
        </View>

        {/* Bottleneck */}
        <View style={[styles.card, bottleneck ? styles.cardDanger : null]}>
          <Text style={styles.cardLabel}>Bottleneck</Text>
          {bottleneck ? (
            <View>
              <Text style={styles.bottleneckName}>{bottleneck.habitName}</Text>
              <Text style={styles.bottleneckDetail}>
                Completed {Math.round(bottleneck.completionRate * 100)}% of the time — but on days
                it is done, your score averages{' '}
                <Text style={{ color: GOLD }}>
                  {Math.round(bottleneck.avgScoreWhenCompleted)}
                </Text>
                .
              </Text>
              <Text style={styles.bottleneckVerdict}>
                This is a structural bottleneck. Not a motivation problem.
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {hasData
                ? 'No structural bottleneck detected this week.'
                : 'No data yet.'}
            </Text>
          )}
        </View>

        {/* Weekly AI Reckoning - Pro Feature */}
        {identityClaim && (
          <View style={styles.reckoningSection}>
            <View style={styles.reckoningHeader}>
              <View>
                <Text style={styles.reckoningTitle}>Weekly AI Reckoning</Text>
                <Text style={styles.reckoningSubtitle}>
                  The verdict on who you are becoming
                </Text>
              </View>
              {!isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>

            {!isPro ? (
              // Free user - show locked state
              <TouchableOpacity
                style={styles.lockedReckoning}
                onPress={() => setShowPaywall(true)}
              >
                <View style={styles.lockedContent}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockedTitle}>Pro Feature</Text>
                  <Text style={styles.lockedSubtitle}>
                    AI-powered verdict, bottleneck analysis, and directive
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => setShowPaywall(true)}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              // Pro user - show full reckoning
              <>
                {!reckoning && !loading && (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReckoning}
                  >
                    <Text style={styles.generateButtonText}>Generate Reckoning</Text>
                  </TouchableOpacity>
                )}

                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={GOLD} />
                    <Text style={styles.loadingText}>Analyzing your data...</Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleGenerateReckoning}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
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
                      <Text style={styles.newReckoningButtonText}>Generate New Reckoning</Text>
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

function StatCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
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
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 6,
    textAlign: 'center',
  },
  value: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  sub: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
    fontFamily: 'ui-monospace',
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BASE,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLabel: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  loadingContainer: {
    gap: 16,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  card: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  cardDanger: {
    borderColor: '#3A1A1A',
    backgroundColor: '#0F0A0A',
  },
  cardLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 16,
  },

  // Bar chart
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 40,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
    minHeight: 4,
  },
  barScore: {
    fontSize: 9,
    fontFamily: 'ui-monospace',
    marginTop: 4,
  },
  barDay: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontFamily: 'ui-monospace',
    marginTop: 2,
  },
  barDayToday: {
    color: GOLD,
  },
  emptyChart: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  // 30-Day Trend Chart
  trendChart: {
    height: 120,
    position: 'relative',
    marginBottom: 12,
  },
  trendPoint: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
  },
  trendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trendLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: BORDER,
    transformOrigin: 'left center',
  },
  trendScore: {
    fontSize: 11,
    fontFamily: 'ui-monospace',
    marginTop: 4,
    fontWeight: '600',
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontFamily: 'ui-monospace',
  },

  // Most missed
  missedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  missedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  missedName: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  missedSub: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  missedCount: {
    color: RED,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },

  // Bottleneck
  bottleneckName: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  bottleneckDetail: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  bottleneckVerdict: {
    color: RED,
    fontSize: 12,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.3,
  },

  emptyText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 20,
  },

  // AI Reckoning Section
  reckoningSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  reckoningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reckoningTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  reckoningSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginBottom: 0,
  },
  proBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#0A0A0A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },
  lockedReckoning: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockIcon: {
    fontSize: 24,
  },
  lockedTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  lockedSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
  },
  upgradeButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '700',
  },
  generateButton: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingContainerLarge: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 12,
    fontFamily: 'ui-monospace',
  },
  errorContainer: {
    backgroundColor: '#0F0A0A',
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: RED,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: SURFACE_2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  newReckoningButton: {
    backgroundColor: SURFACE_2,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  newReckoningButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'ui-monospace',
  },
});
