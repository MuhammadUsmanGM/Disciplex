import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Platform,
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
import { ScorePop, SlideInFromTop, createStaggerAnimation } from '@/src/utils/animations';
import { ActionIcons, FeatureIcons } from '@/src/utils/icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [identityClaim, setIdentityClaim] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState('');

  const {
    habits,
    identityDebt,
    loadDataFromCloud,
    toggleHabit,
    getHabitsWithStatus,
    getTodayScore,
    loading,
  } = useHabitStore();

  // Load onboarding data and load habits from cloud
  useEffect(() => {
    AsyncStorage.getItem('onboarding_data').then((raw) => {
      if (!raw) return;
      const data = JSON.parse(raw);
      setIdentityClaim(data.identity_claim ?? null);
    });

    loadDataFromCloud();

    const now = new Date();
    setTodayDate(
      now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    );
  }, [loadDataFromCloud]);

  // Recalculate when screen gains focus
  useFocusEffect(
    useCallback(() => {
      useHabitStore.getState().recalculateAndSaveScore();
    }, []),
  );

  const handleToggleHabit = async (habitId: string) => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleHabit(habitId);
  };

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
        <MotiView
          from={SlideInFromTop.from}
          animate={SlideInFromTop.animate}
          transition={SlideInFromTop.transition}
        >
          <View style={styles.header}>
            <Text style={styles.dateText}>{todayDate}</Text>
          </View>
        </MotiView>

        {/* Score Block */}
        <MotiView
          from={ScorePop.from}
          animate={ScorePop.animate}
          transition={ScorePop.transition}
        >
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {habits.length === 0 ? '—' : Math.round(score)}
            </Text>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>

            {/* Identity Debt */}
            {hasDebt && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' as const, damping: 15, delay: 200 }}
              >
                <Pressable
                  style={styles.debtRow}
                  onPress={() => router.push('/(tabs)/identity' as any)}
                >
                  <View style={styles.debtDot} />
                  <Text style={styles.debtText}>
                    Identity Debt: {Math.round(identityDebt)} pts
                  </Text>
                  <Text style={styles.debtChevron}>›</Text>
                </Pressable>
              </MotiView>
            )}
          </View>
        </MotiView>

        {/* Identity Claim */}
        {identityClaim && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 100 }}
          >
            <View style={styles.claimBlock}>
              <View style={styles.claimHeader}>
                <FeatureIcons.Target size={16} color={GOLD} />
                <Text style={styles.claimLabel}>Identity Claim</Text>
              </View>
              <Text style={styles.claimText}>{identityClaim}</Text>
            </View>
          </MotiView>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Habit Log */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today&apos;s Non-Negotiables</Text>

          {loading ? (
            <Text style={styles.emptyText}>Loading protocol...</Text>
          ) : habits.length === 0 ? (
            <Text style={styles.emptyText}>
              No habits found. Complete onboarding to set your non-negotiables.
            </Text>
          ) : (
            habitsWithStatus.map((habit, index) => (
              <MotiView
                key={habit.id}
                from={createStaggerAnimation(index, 50).from}
                animate={createStaggerAnimation(index, 50).animate}
                transition={createStaggerAnimation(index, 50).transition}
              >
                <Pressable
                  style={[styles.habitRow, habit.completedToday && styles.habitRowCompleted]}
                  onPress={() => handleToggleHabit(habit.id)}
                  android_ripple={{ color: GOLD_SUBTLE }}
                >
                  {/* Checkbox with animation */}
                  <MotiView
                    from={{ scale: 0.8, rotate: '-10deg' }}
                    animate={{
                      scale: habit.completedToday ? 1 : 0.9,
                      rotate: '0deg',
                    }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        habit.completedToday && styles.checkboxChecked,
                      ]}
                    >
                      {habit.completedToday && (
                        <MotiView
                          from={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                        >
                          <ActionIcons.Check size={14} color="#0A0A0A" />
                        </MotiView>
                      )}
                    </View>
                  </MotiView>

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
              </MotiView>
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
    paddingBottom: 120,
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
  debtChevron: {
    color: RED,
    fontSize: 14,
    marginLeft: 4,
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
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  claimLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
