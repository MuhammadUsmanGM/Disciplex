/**
 * Identity Debt Tracker Screen
 * Shows debt history, progress, and clearing status
 */

import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
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
  SUCCESS,
  SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/constants/theme';
import { FeatureIcons } from '@/src/utils/icons';

interface ScoreHistory {
  date: string;
  identityDebt: number;
  adjustedScore: number;
}

export default function DebtTrackerScreen() {
  const router = useRouter();
  const { scoreHistory, identityDebt: currentDebt } = useHabitStore();
  const [debtHistory, setDebtHistory] = useState<ScoreHistory[]>([]);

  useEffect(() => {
    // Get debt history from score history
    const history = scoreHistory.map((s) => ({
      date: s.date,
      identityDebt: s.identityDebt,
      adjustedScore: s.adjustedScore,
    }));
    setDebtHistory(history);
  }, [scoreHistory]);

  // Calculate debt stats
  const totalDebtAccumulated = debtHistory.reduce((sum, s) => sum + s.identityDebt, 0);
  const maxDebt = Math.max(...debtHistory.map((s) => s.identityDebt), currentDebt);
  const debtFreeDays = debtHistory.filter((s) => s.identityDebt === 0).length;

  // Calculate clearing progress (need 2 consecutive days >85 to clear)
  const consecutiveHighDays = calculateConsecutiveHighDays(debtHistory);
  const clearingProgress = Math.min(consecutiveHighDays, 2) / 2;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Identity Debt</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Current Debt Card */}
        <View style={[styles.currentDebtCard, currentDebt > 0 && styles.currentDebtActive]}>
          <Text style={styles.currentDebtLabel}>Current Debt</Text>
          <Text style={[styles.currentDebtValue, { color: currentDebt > 0 ? RED : SUCCESS }]}>
            {Math.round(currentDebt)} pts
          </Text>
          <Text style={styles.currentDebtStatus}>
            {currentDebt > 0 ? 'Active — reducing alignment score' : 'Clear — executing strong'}
          </Text>
        </View>

        {/* Clearing Progress */}
        {currentDebt > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Clearing Progress</Text>
            <Text style={styles.progressHint}>
              Score {'>'}85 for 2 consecutive days to clear debt
            </Text>
            
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${clearingProgress * 100}%` },
                ]}
              />
            </View>
            
            <View style={styles.progressSteps}>
              <View style={[styles.step, consecutiveHighDays >= 1 && styles.stepComplete]}>
                <Text style={[styles.stepText, consecutiveHighDays >= 1 && styles.stepTextComplete]}>
                  Day 1
                </Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.step, consecutiveHighDays >= 2 && styles.stepComplete]}>
                <Text style={[styles.stepText, consecutiveHighDays >= 2 && styles.stepTextComplete]}>
                  Day 2
                </Text>
              </View>
            </View>
            
            <Text style={styles.progressSubtext}>
              {consecutiveHighDays >= 2
                ? 'Debt will be cleared on next update'
                : `${consecutiveHighDays} of 2 days complete`}
            </Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: RED }]}>
              {Math.round(maxDebt)}
            </Text>
            <Text style={styles.statLabel}>Peak Debt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: GOLD }]}>
              {debtFreeDays}
            </Text>
            <Text style={styles.statLabel}>Debt-Free Days</Text>
          </View>
        </View>

        {/* Debt Info */}
        <View style={styles.infoCard}>
          <FeatureIcons.Target size={20} color={RED} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How Debt Works</Text>
            <Text style={styles.infoText}>
              • Missing a non-negotiable habit adds 10 points
            </Text>
            <Text style={styles.infoText}>
              • Debt reduces your Identity Alignment by 30%
            </Text>
            <Text style={styles.infoText}>
              • Score {'>'}85 for 2 consecutive days clears all debt
            </Text>
            <Text style={styles.infoText}>
              • Or debt decays by 5 points per high-performance day
            </Text>
          </View>
        </View>

        {/* Debt History */}
        {debtHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyLabel}>Last 14 Days</Text>
            <View style={styles.historyGrid}>
              {debtHistory.slice(-14).map((day, i) => (
                <View
                  key={day.date}
                  style={[
                    styles.historyDay,
                    day.identityDebt > 0 && styles.historyDayDebt,
                    day.identityDebt === 0 && styles.historyDayClear,
                  ]}
                >
                  <Text style={styles.historyDate}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.historyDebt,
                      { color: day.identityDebt > 0 ? RED : SUCCESS },
                    ]}
                  >
                    {day.identityDebt > 0 ? `-${Math.round(day.identityDebt)}` : '✓'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function calculateConsecutiveHighDays(history: ScoreHistory[]): number {
  if (history.length === 0) return 0;

  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].adjustedScore > 85) {
      count++;
    } else {
      break;
    }
  }
  return count;
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

  // Current Debt Card
  currentDebtCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentDebtActive: {
    borderColor: RED,
    backgroundColor: 'rgba(204, 0, 0, 0.05)',
  },
  currentDebtLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  currentDebtValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    marginBottom: 8,
  },
  currentDebtStatus: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
  },

  // Progress Card
  progressCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  progressLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  progressHint: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  step: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: BORDER,
  },
  stepComplete: {
    backgroundColor: GOLD,
  },
  stepText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'ui-monospace',
  },
  stepTextComplete: {
    color: '#0A0A0A',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: BORDER,
    marginHorizontal: 8,
  },
  progressSubtext: {
    color: TEXT_MUTED,
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'ui-monospace',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 4,
    fontFamily: 'ui-monospace',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },

  // History Section
  historySection: {
    marginTop: 8,
  },
  historyLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 12,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyDay: {
    width: `${100 / 7 - 2}%`,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  historyDayDebt: {
    borderColor: RED,
    backgroundColor: 'rgba(204, 0, 0, 0.05)',
  },
  historyDayClear: {
    borderColor: SUCCESS,
  },
  historyDate: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontFamily: 'ui-monospace',
    marginBottom: 4,
  },
  historyDebt: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
});
