import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
    GOLD_SUBTLE,
    RED,
    SURFACE,
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    getScoreColor,
} from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { useHabitStore } from '@/src/store/useHabitStore';

interface OnboardingData {
  identity_claim: string;
  refuse_to_be: string;
}

export default function IdentityScreen() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [alignmentPercentage, setAlignmentPercentage] = useState<number>(0);

  const { habits, getHabitsWithStatus, getLast7DayScores } = useHabitStore();

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
          <Text style={styles.headerLabel}>Identity</Text>
          <Text style={styles.headerSub}>Your contract with yourself</Text>
        </View>

        {/* Alignment Score Card */}
        <View style={styles.alignmentCard}>
          <Text style={styles.alignmentLabel}>Current Alignment</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreNumber, { color: alignmentColor }]}>
              {onboardingData ? alignmentPercentage : '—'}
            </Text>
            <Text style={styles.scorePercent}>%</Text>
          </View>
          <Text style={[styles.alignmentState, { color: alignmentColor }]}>
            {onboardingData
              ? alignmentPercentage >= 75
                ? 'Aligned'
                : alignmentPercentage >= 50
                ? 'Drifting'
                : 'Identity Gap'
              : 'Complete onboarding'}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, alignmentPercentage)}%`,
                  backgroundColor: alignmentColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>7-day weighted average</Text>
        </View>

        {/* Identity Claim */}
        {onboardingData && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Identity Claim</Text>
              <Text style={styles.cardValue}>{onboardingData.identity_claim}</Text>
              <Text style={styles.cardHint}>
                This is your standard — not a wish. Every action is a vote for or against this
                identity.
              </Text>
            </View>

            {/* Who I Refuse To Be */}
            <View style={[styles.card, styles.dangerCard]}>
              <Text style={[styles.cardLabel, styles.dangerLabel]}>
                Who I Refuse To Be
              </Text>
              <Text style={styles.dangerValue}>{onboardingData.refuse_to_be}</Text>
              <Text style={styles.dangerHint}>
                Every missed non-negotiable is a vote for this version of you.
              </Text>
            </View>

            {/* Non-Negotiables */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Non-Negotiables</Text>
              <Text style={styles.nonNegotiablesHint}>
                These 3 behaviors define your identity. Miss one — you pay for it.
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
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text
                        style={[
                          styles.habitStatus,
                          isCompleted ? styles.habitStatusDone : styles.habitStatusMissed,
                        ]}
                      >
                        {isCompleted ? 'Completed today' : 'Not completed'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Today's Progress */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Today&apos;s Execution</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {completedCount} of {habits.length} completed
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

            {/* Contract Reminder */}
            <View style={styles.reminderCard}>
              <Text style={styles.reminderText}>
                Your identity is not what you say. It is what you prove — daily.
              </Text>
            </View>
          </>
        )}

        {!onboardingData && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No identity data found. Please complete onboarding to set your identity claim and
              non-negotiables.
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
    paddingBottom: 48,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerLabel: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 4,
  },

  // Alignment Card
  alignmentCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  alignmentLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
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
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    letterSpacing: -3,
  },
  scorePercent: {
    fontSize: 24,
    color: TEXT_SECONDARY,
    fontFamily: 'ui-monospace',
    marginLeft: 4,
  },
  alignmentState: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginTop: 4,
    marginBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: SURFACE_2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressHint: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 8,
    fontFamily: 'ui-monospace',
  },

  // Generic Card
  card: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
    marginBottom: 10,
  },
  cardValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  cardHint: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  // Danger Card (Refuse To Be)
  dangerCard: {
    borderColor: '#3A1A1A',
    backgroundColor: '#0F0A0A',
  },
  dangerLabel: {
    color: RED,
  },
  dangerValue: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  dangerHint: {
    color: RED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    fontFamily: 'ui-monospace',
  },

  // Non-Negotiables
  nonNegotiablesHint: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  habitIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  habitStatus: {
    fontSize: 11,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.3,
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
    marginBottom: 8,
  },
  progressText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
  },
  miniProgressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: SURFACE_2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Reminder
  reminderCard: {
    backgroundColor: GOLD_SUBTLE,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
  },
  reminderText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
  },

  // Empty State
  emptyCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
