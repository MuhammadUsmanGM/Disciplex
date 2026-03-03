import { useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    GOLD,
    GOLD_SUBTLE,
    RED,
    SHADOWS,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    getScoreColor
} from '@/constants/theme';
import { DebtReconciliation } from '@/src/components/ui/DebtReconciliation';
import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';
import { ActionIcons, FeatureIcons } from '@/src/utils/icons';

interface OnboardingData {
  identity_claim: string;
  refuse_to_be: string;
}

export default function IdentityScreen() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [alignmentPercentage, setAlignmentPercentage] = useState<number>(0);

  const { habits, getHabitsWithStatus, getLast7DayScores, debtEntries, identityDebt, consecutiveHighDays } = useHabitStore();

  // Load onboarding data from Supabase
  useFocusEffect(
    useCallback(() => {
      const fetchIdentity = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           const { data } = await supabase.from('users').select('identity_claim,refuse_to_be').eq('id', user.id).single();
           if (data) {
              setOnboardingData(data as OnboardingData);
           }
        }
      };
      
      fetchIdentity();
    }, [])
  );

  // Calculate alignment percentage
  useFocusEffect(
    useCallback(() => {
      const scores = getLast7DayScores();
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        setAlignmentPercentage(Math.round(avg));
      } else {
        setAlignmentPercentage(0);
      }
    }, [getLast7DayScores]),
  );

  const habitsWithStatus = getHabitsWithStatus();
  const completedCount = habitsWithStatus.filter((h) => h.completedToday).length;
  const alignmentColor = getScoreColor(alignmentPercentage);

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
              <Text style={styles.headerLabel}>IDENTITY LOG</Text>
              <Text style={styles.headerSub}>BEHAVIORAL CONTRACT V.01</Text>
           </View>
           <View style={[styles.statusBadge, { borderColor: identityDebt > 0 ? RED : GOLD }]}>
              <Text style={[styles.statusBadgeText, { color: identityDebt > 0 ? RED : GOLD }]}>
                 {identityDebt > 0 ? 'BREACH DETECTED' : 'SYSTEM NOMINAL'}
              </Text>
           </View>
        </View>

        {/* Debt Reconciliation Protocol */}
        <DebtReconciliation debt={identityDebt} consecutiveHighDays={consecutiveHighDays} />

        {/* Alignment Score Card */}
        <MotiView
          from={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={[
            styles.alignmentCard,
            alignmentPercentage >= 75 && SHADOWS.goldGlow
          ]}
        >
          <Text style={styles.alignmentLabel}>CURRENT ALIGNMENT INDEX</Text>
          <View style={styles.scoreRow}>
            <MotiView
              from={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 300 }}
            >
              <Text style={[styles.scoreNumber, { color: alignmentColor }]}>
                {onboardingData ? alignmentPercentage : '—'}
              </Text>
            </MotiView>
            <Text style={styles.scorePercent}>%</Text>
          </View>
          <Text style={[styles.alignmentState, { color: alignmentColor }]}>
            {onboardingData
              ? alignmentPercentage >= 75
                ? 'ALIGNED PROTOCOL'
                : alignmentPercentage >= 50
                ? 'DRIFT WARNING'
                : 'CRITICAL IDENTITY GAP'
              : 'INITIALIZING...'}
          </Text>
          <View style={styles.progressTrack}>
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${Math.min(100, alignmentPercentage)}%` }}
              transition={{ type: 'timing', duration: 1500, delay: 500 }}
              style={[
                styles.progressFill,
                {
                  backgroundColor: alignmentColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>7-DAY BEHAVIORAL WINDOW</Text>
        </MotiView>

        {/* Identity Claim */}
        {onboardingData && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <FeatureIcons.Target size={14} color={GOLD} />
                 <Text style={styles.cardLabel}>IDENTITY CLAIM</Text>
              </View>
              <Text style={styles.cardValue}>&quot;{onboardingData.identity_claim}&quot;</Text>
              <View style={styles.cardDivider} />
              <Text style={styles.cardHint}>
                Every action is a vote for this version of you.
              </Text>
            </View>

            {/* Who I Refuse To Be */}
            <View style={[styles.card, styles.dangerCard]}>
              <View style={styles.cardHeader}>
                 <FeatureIcons.Alert size={14} color={RED} />
                 <Text style={[styles.cardLabel, styles.dangerLabel]}>REFUSE PROTOCOL</Text>
              </View>
              <Text style={styles.dangerValue}>&quot;{onboardingData.refuse_to_be}&quot;</Text>
              <View style={styles.cardDividerDanger} />
              <Text style={styles.dangerHint}>
                BREACH WARNING: Missing non-negotiables validates this entry.
              </Text>
            </View>

            {/* Non-Negotiables */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <FeatureIcons.Settings size={14} color={GOLD} />
                 <Text style={styles.cardLabel}>NON-NEGOTIABLES</Text>
              </View>
              <Text style={styles.nonNegotiablesHint}>
                These core behaviors define your identity integrity.
              </Text>

              {habits.map((habit, i) => {
                const habitData = habitsWithStatus.find((h) => h.id === habit.id);
                const isCompleted = habitData?.completedToday ?? false;

                return (
                  <View key={i} style={styles.habitRow}>
                    <View
                      style={[
                        styles.habitIndicator,
                        isCompleted ? styles.habitIndicatorDone : styles.habitIndicatorMissed,
                      ]}
                    />
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.name.toUpperCase()}</Text>
                      <Text
                        style={[
                          styles.habitStatus,
                          isCompleted ? styles.habitStatusDone : styles.habitStatusMissed,
                        ]}
                      >
                        {isCompleted ? 'EXECUTED' : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Today's Progress */}
            <View style={styles.card}>
               <View style={styles.cardHeader}>
                 <FeatureIcons.Target size={14} color={GOLD} />
                 <Text style={styles.cardLabel}>TODAY&apos;S ALIGNMENT</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {completedCount} OF {habits.length} PROTOCOLS EXECUTED
                </Text>
                <Text style={[styles.progressPercent, { color: getScoreColor((completedCount / habits.length) * 100) }]}>
                  {habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%
                </Text>
              </View>
              <View style={styles.miniProgressTrack}>
                <View
                  style={[
                    styles.miniProgressFill,
                    {
                      width: `${(completedCount / habits.length) * 100}%`,
                      backgroundColor: getScoreColor((completedCount / habits.length) * 100),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Integrity Audit Log */}
            <View style={styles.card}>
              <View style={styles.ledgerHeader}>
                <View style={styles.cardHeader}>
                   <ActionIcons.History size={14} color={GOLD} />
                   <Text style={styles.cardLabel}>INTEGRITY AUDIT LOG</Text>
                </View>
                <Text style={styles.ledgerSub}>LAST 50 TRANSACTIONAL EVENTS</Text>
              </View>
              
              {debtEntries.length === 0 ? (
                <Text style={styles.emptyLedgerText}>NO NEGATIVE TRANSFERS DETECTED.</Text>
              ) : (
                <View style={styles.ledgerList}>
                  {debtEntries.map((entry) => (
                    <MotiView 
                      key={entry.id} 
                      animate={{ opacity: entry.amount > 0 ? [1, 0.6, 1] : 1 }}
                      transition={{ type: 'timing', duration: 1500, loop: entry.amount > 0 }}
                      style={styles.ledgerRow}
                    >
                      <View style={[styles.ledgerMarker, { backgroundColor: entry.amount > 0 ? RED : GOLD }]} />
                      <View style={styles.ledgerInfo}>
                        <Text style={styles.ledgerDate}>
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.ledgerLabel}>{entry.label.toUpperCase()}</Text>
                      </View>
                      <Text style={[
                        styles.ledgerAmount,
                        { color: entry.amount > 0 ? RED : GOLD }
                      ]}>
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount} UNIT
                      </Text>
                    </MotiView>
                  ))}
                </View>
              )}
            </View>

            {/* Contract Reminder */}
            <View style={styles.reminderCard}>
              <Text style={styles.reminderText}>
                IDENTITY IS NOT STATED. IT IS PROVEN.
              </Text>
            </View>
          </>
        )}

        {!onboardingData && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              INITIALIZING IDENTITY...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: 'ui-monospace',
  },
  headerSub: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },

  // Alignment Card
  alignmentCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  alignmentLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: -4,
  },
  scorePercent: {
    fontSize: 24,
    color: TEXT_SECONDARY,
    fontFamily: 'ui-monospace',
    marginLeft: 4,
    fontWeight: '900',
  },
  alignmentState: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginTop: 4,
    marginBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressHint: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 12,
    fontFamily: 'ui-monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Generic Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
  },
  cardValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
  cardHint: {
    color: TEXT_MUTED,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'ui-monospace',
  },

  // Danger Card (Refuse To Be)
  dangerCard: {
    borderColor: 'rgba(204, 0, 0, 0.2)',
    backgroundColor: 'rgba(204, 0, 0, 0.02)',
  },
  dangerLabel: {
    color: RED,
  },
  dangerValue: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  cardDividerDanger: {
    height: 1,
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
    marginVertical: 12,
  },
  dangerHint: {
    color: RED,
    fontSize: 9,
    lineHeight: 14,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
  },

  // Non-Negotiables
  nonNegotiablesHint: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'ui-monospace',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  habitIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  habitIndicatorDone: {
    backgroundColor: GOLD,
  },
  habitIndicatorMissed: {
    backgroundColor: RED,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    fontFamily: 'ui-monospace',
  },
  habitStatus: {
    fontSize: 9,
    fontFamily: 'ui-monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  habitStatusDone: {
    color: GOLD,
  },
  habitStatusMissed: {
    color: RED,
  },

  // Progress Row
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
  },
  miniProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Ledger
  ledgerHeader: {
    marginBottom: 16,
  },
  ledgerSub: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '800',
  },
  ledgerList: {
    gap: 8,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  ledgerMarker: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  ledgerInfo: {
    flex: 1,
    gap: 2,
  },
  ledgerDate: {
    color: TEXT_MUTED,
    fontSize: 8,
    fontFamily: 'ui-monospace',
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  ledgerLabel: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'ui-monospace',
  },
  ledgerAmount: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
  },
  emptyLedgerText: {
    color: TEXT_MUTED,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 24,
    fontFamily: 'ui-monospace',
    letterSpacing: 1,
  },

  // Reminder Card
  reminderCard: {
    backgroundColor: GOLD_SUBTLE,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  reminderText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'ui-monospace',
    letterSpacing: 3,
    textAlign: 'center',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 40,
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontFamily: 'ui-monospace',
    fontWeight: '800',
    letterSpacing: 2,
  },
});
