import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
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
    getScoreColor,
} from '@/constants/theme';
import { ShareCardWrapper } from '@/src/components/reckoning/ShareCard';
import { detectBottleneck } from '@/src/lib/scoring';
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
  const { habits, completions, scoreHistory, identityDebt } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      useHabitStore.getState().recalculateAndSaveScore();
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
    const scores = scoreHistory.slice(-7).map((s) => s.score);
    if (scores.length < 2) return null;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / scores.length;
    return Math.round(Math.sqrt(variance) * 10) / 10;
  }, [scoreHistory]);

  const hasData = scoreHistory.length > 0;

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
             <ShareCardWrapper score={barData[barData.length - 1]?.score ?? 0} />
          )}
        </View>

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
});
