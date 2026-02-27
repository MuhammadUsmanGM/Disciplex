import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
    GOLD_SUBTLE,
    RED,
    SURFACE,
    SURFACE_2,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    getScoreColor,
    getScoreLabel,
} from '@/constants/theme';
import { useHabitStore } from '@/src/store/useHabitStore';

export default function HomeScreen() {
  const [identityClaim, setIdentityClaim] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState('');

  const {
    habits,
    identityDebt,
    initHabitsFromOnboarding,
    toggleHabit,
    getHabitsWithStatus,
    getTodayScore,
  } = useHabitStore();

  // Load onboarding data and init habits if needed
  useEffect(() => {
    AsyncStorage.getItem('onboarding_data').then((raw) => {
      if (!raw) return;
      const data = JSON.parse(raw);
      setIdentityClaim(data.identity_claim ?? null);
      initHabitsFromOnboarding(data.non_negotiables ?? []);
    });

    const now = new Date();
    setTodayDate(
      now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    );
  }, [initHabitsFromOnboarding]);

  // Recalculate when screen gains focus
  useFocusEffect(
    useCallback(() => {
      useHabitStore.getState().recalculateAndSaveScore();
    }, []),
  );

  const habitsWithStatus = getHabitsWithStatus();
  const score = getTodayScore();
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const hasDebt = identityDebt > 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{todayDate}</Text>
        </View>

        {/* Score Block */}
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {habits.length === 0 ? '—' : Math.round(score)}
          </Text>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>

          {/* Identity Debt */}
          {hasDebt && (
            <View style={styles.debtRow}>
              <View style={styles.debtDot} />
              <Text style={styles.debtText}>
                Identity Debt: {Math.round(identityDebt)} pts
              </Text>
            </View>
          )}
        </View>

        {/* Identity Claim */}
        {identityClaim ? (
          <View style={styles.claimBlock}>
            <Text style={styles.claimLabel}>Identity Claim</Text>
            <Text style={styles.claimText}>{identityClaim}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Habit Log */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today&apos;s Non-Negotiables</Text>

          {habits.length === 0 ? (
            <Text style={styles.emptyText}>
              No habits found. Complete onboarding to set your non-negotiables.
            </Text>
          ) : (
            habitsWithStatus.map((habit) => (
              <Pressable
                key={habit.id}
                style={[styles.habitRow, habit.completedToday && styles.habitRowCompleted]}
                onPress={() => toggleHabit(habit.id)}
                android_ripple={{ color: GOLD_SUBTLE }}
              >
                {/* Checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    habit.completedToday && styles.checkboxChecked,
                  ]}
                >
                  {habit.completedToday && <Text style={styles.checkmark}>✓</Text>}
                </View>

                {/* Habit name */}
                <View style={styles.habitTextBlock}>
                  <Text
                    style={[
                      styles.habitName,
                      habit.completedToday && styles.habitNameCompleted,
                    ]}
                  >
                    {habit.name}
                  </Text>
                  {habit.lateToday && (
                    <Text style={styles.lateTag}>Late logged — weight reduced</Text>
                  )}
                </View>

                {/* Non-negotiable marker */}
                {habit.is_non_negotiable && (
                  <View style={styles.nnTag}>
                    <Text style={styles.nnTagText}>NN</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Score breakdown hint */}
        {habits.length > 0 && (
          <View style={styles.hintBlock}>
            <Text style={styles.hintText}>
              {habitsWithStatus.filter((h) => h.completedToday).length} of {habits.length} completed
              {hasDebt ? `  ·  ${Math.round(identityDebt)}pt debt active` : ''}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    marginBottom: 32,
  },
  dateText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'ui-monospace',
  },

  // Score
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreNumber: {
    fontSize: 96,
    fontWeight: '700',
    fontFamily: 'ui-monospace',
    letterSpacing: -4,
    lineHeight: 100,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 4,
    fontFamily: 'ui-monospace',
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  debtDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  debtText: {
    color: RED,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
  },

  // Identity Claim
  claimBlock: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  claimLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'ui-monospace',
  },
  claimText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 24,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
    fontFamily: 'ui-monospace',
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 16,
  },

  // Habit rows
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 14,
  },
  habitRowCompleted: {
    backgroundColor: SURFACE_2,
    borderColor: '#222222',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  checkmark: {
    color: BASE,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  habitTextBlock: {
    flex: 1,
  },
  habitName: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  habitNameCompleted: {
    color: TEXT_MUTED,
  },
  lateTag: {
    color: RED,
    fontSize: 11,
    marginTop: 3,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.2,
  },
  nnTag: {
    backgroundColor: GOLD_SUBTLE,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nnTagText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'ui-monospace',
  },

  // Hint
  hintBlock: {
    alignItems: 'center',
    marginTop: 8,
  },
  hintText: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'ui-monospace',
    letterSpacing: 0.5,
  },
});
