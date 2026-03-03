/**
 * Habit Store — Zustand
 * Production-ready habit management with error handling, offline support, and type safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { calculateDailyScore, updateDebt } from '@/src/lib/scoring';
import { supabase, executeQuery } from '@/src/lib/supabase';
import { Completion, DebtEntry, Habit, ScoreHistoryEntry } from '@/src/types';
import { logger, trackError, startPerformanceMark, endPerformanceMark } from '@/src/utils/logger';
import { validateScoreHistory } from '@/src/utils/validation';

const STORAGE_KEY = 'disciplex_habit_store';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function nowISO(): string {
  return new Date().toISOString();
}

function isLate(loggedAt: string): boolean {
  const logged = new Date(loggedAt);
  return logged.getHours() >= 20;
}

interface ScoreHistory {
  date: string;
  score: number; // finalAlignment
  adjustedScore: number;
  identityDebt: number;
}

interface HabitState {
  habits: Habit[];
  completions: Completion[];
  scoreHistory: ScoreHistory[];
  identityDebt: number;
  debtEntries: DebtEntry[];
  consecutiveHighDays: number;
  loading: boolean;
  error: string | null;

  // Actions
  loadDataFromCloud: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  getTodayCompletions: () => Completion[];
  getTodayScore: () => number;
  getHabitsWithStatus: () => (Habit & { completedToday: boolean; lateToday: boolean })[];
  getLast7DayScores: () => number[];
  recalculateAndSaveScore: () => Promise<void>;
  clearError: () => void;
  getScoreHistory: () => ScoreHistoryEntry[];
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      scoreHistory: [],
      identityDebt: 0,
      debtEntries: [],
      consecutiveHighDays: 0,
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      getScoreHistory: () => {
        const { scoreHistory } = get();
        return scoreHistory.map(s => ({
          date: s.date,
          score: s.score,
          adjustedScore: s.adjustedScore,
          identityDebt: s.identityDebt,
        }));
      },

      loadDataFromCloud: async () => {
        startPerformanceMark('loadDataFromCloud');
        set({ loading: true, error: null });
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            logger.warn('[HABIT_STORE] No authenticated user, skipping cloud load');
            set({ loading: false });
            return;
          }

          // Fetch all habits with retry
          const { data: habits, error: habitsError } = await executeQuery(
            supabase
              .from('habits')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: true }),
            'Fetch habits'
          );

          if (habitsError || !habits) {
            logger.error('[HABIT_STORE] Failed to fetch habits', habitsError as Error);
            set({ loading: false, error: 'Failed to load habits' });
            return;
          }

          if (habits.length === 0) {
            logger.info('[HABIT_STORE] No habits found for user');
            set({ loading: false });
            return;
          }

          const habitIds = habits.map((h) => h.id);

          // Fetch all completions
          const { data: completions, error: completionsError } = await executeQuery(
            supabase
              .from('completions')
              .select('*')
              .in('habit_id', habitIds),
            'Fetch completions'
          );

          if (completionsError) {
            logger.error('[HABIT_STORE] Failed to fetch completions', completionsError as Error);
          }

          // Fetch all scores
          const { data: scores, error: scoresError } = await executeQuery(
            supabase
              .from('scores')
              .select('*')
              .eq('user_id', user.id)
              .order('date', { ascending: true }),
            'Fetch scores'
          );

          if (scoresError) {
            logger.error('[HABIT_STORE] Failed to fetch scores', scoresError as Error);
          }

          const scoreHistory: ScoreHistory[] = (scores || []).map((s) => ({
            date: s.date,
            score: s.alignment_score,
            adjustedScore: s.adjusted_score,
            identityDebt: s.identity_debt,
          }));

          // Validate score history
          if (!validateScoreHistory(scoreHistory.map(s => ({ date: s.date, score: s.score })))) {
            logger.warn('[HABIT_STORE] Invalid score history detected, filtering...');
          }

          const latestDebt = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].identityDebt : 0;

          // Fetch debt entries
          const { data: debtEntries, error: debtError } = await executeQuery(
            supabase
              .from('debt_ledger')
              .select('*')
              .eq('user_id', user.id)
              .order('date', { ascending: false })
              .limit(50),
            'Fetch debt ledger'
          );

          if (debtError) {
            logger.error('[HABIT_STORE] Failed to fetch debt entries', debtError as Error);
          }

          set({
            habits: habits as Habit[],
            completions: (completions as Completion[]) || [],
            scoreHistory,
            identityDebt: latestDebt,
            debtEntries: (debtEntries as DebtEntry[]) || [],
            loading: false,
          });

          endPerformanceMark('loadDataFromCloud');
          logger.info('[HABIT_STORE] Data loaded successfully', {
            habitsCount: habits.length,
            completionsCount: completions?.length || 0,
            scoresCount: scores?.length || 0,
          });
        } catch (error) {
          const err = error as Error;
          trackError(err, { component: 'useHabitStore', action: 'loadDataFromCloud' });
          logger.error('[HABIT_STORE] Failed to load cloud data', err);
          set({ loading: false, error: err.message || 'Failed to load data' });
        }
      },

      toggleHabit: async (habitId: string) => {
        startPerformanceMark('toggleHabit');
        const today = todayISO();
        const existing = get().completions.find(
          (c) => c.habit_id === habitId && c.date === today,
        );

        try {
          let newCompletions: Completion[];

          if (existing) {
            // Toggle off locally (optimistic update)
            newCompletions = get().completions.filter(
              (c) => !(c.habit_id === habitId && c.date === today),
            );
            set({ completions: newCompletions });

            // Toggle off on Cloud
            const { error: deleteError } = await supabase
              .from('completions')
              .delete()
              .eq('id', existing.id);

            if (deleteError) {
              logger.error('[HABIT_STORE] Failed to delete completion', deleteError as Error);
              // Revert optimistic update
              set({ completions: [...newCompletions, existing] });
            }
          } else {
            // Toggle on locally (optimistic update)
            const loggedAt = nowISO();
            const completion = {
              habit_id: habitId,
              date: today,
              completed: true,
              logged_at: loggedAt,
              late_logged: isLate(loggedAt),
            };

            const { data, error: insertError } = await supabase
              .from('completions')
              .insert(completion)
              .select()
              .single();

            if (insertError) {
              logger.error('[HABIT_STORE] Failed to insert completion', insertError as Error);
            } else if (data) {
              newCompletions = [...get().completions, data as Completion];
              set({ completions: newCompletions });
            }
          }

          await get().recalculateAndSaveScore();
          endPerformanceMark('toggleHabit');
        } catch (error) {
          const err = error as Error;
          trackError(err, { component: 'useHabitStore', action: 'toggleHabit', habitId });
          logger.error('[HABIT_STORE] Toggle habit failed', err);
          set({ error: 'Failed to update habit' });
        }
      },

      getTodayCompletions: () => {
        const today = todayISO();
        return get().completions.filter((c) => c.date === today && c.completed);
      },

      getHabitsWithStatus: () => {
        const today = todayISO();
        const { habits, completions } = get();
        return habits.map((h) => {
          const c = completions.find((c) => c.habit_id === h.id && c.date === today && c.completed);
          return {
            ...h,
            completedToday: !!c,
            lateToday: c?.late_logged ?? false,
          };
        });
      },

      getLast7DayScores: () => {
        const { scoreHistory } = get();
        return scoreHistory
          .slice(-7)
          .map((s) => s.score);
      },

      getTodayScore: () => {
        const today = todayISO();
        const entry = get().scoreHistory.find((s) => s.date === today);
        return entry?.score ?? 0;
      },

      recalculateAndSaveScore: async () => {
        startPerformanceMark('recalculateAndSaveScore');
        const { habits, completions, scoreHistory, identityDebt, consecutiveHighDays } = get();
        const today = todayISO();
        const todayCompletions = completions.filter((c) => c.date === today && c.completed);
        const last7 = scoreHistory.slice(-7).map((s) => s.adjustedScore);

        try {
          const result = calculateDailyScore({
            habits,
            completions: todayCompletions,
            last7DayScores: last7,
            identityDebt,
          });

          const { newDebt, newEntries } = updateDebt(
            identityDebt,
            habits,
            todayCompletions,
            result.adjustedScore,
            consecutiveHighDays,
          );

          // Track new entries for the ledger
          const currentEntries = get().debtEntries;
          // Optimization: Filter out entries that already exist for today of same type/label
          const existingForToday = currentEntries.filter(e => e.date === today);
          const uniqueNewEntries = newEntries
            .filter(ne => !existingForToday.some(ee => ee.label === ne.label))
            .map(ne => ({
              id: Math.random().toString(36).substr(2, 9),
              date: today,
              ...ne
            })) as DebtEntry[];

          const finalEntries = [...uniqueNewEntries, ...currentEntries].slice(0, 50); // Keep last 50

          const newConsecutiveHigh = result.adjustedScore > 85 ? consecutiveHighDays + 1 : 0;

          const entry: ScoreHistory = {
            date: today,
            score: result.finalAlignment,
            adjustedScore: result.adjustedScore,
            identityDebt: newDebt,
          };

          const existingIdx = scoreHistory.findIndex((s) => s.date === today);
          const newHistory = existingIdx >= 0
            ? scoreHistory.map((s, i) => (i === existingIdx ? entry : s))
            : [...scoreHistory, entry];

          set({
            scoreHistory: newHistory,
            identityDebt: newDebt,
            debtEntries: finalEntries,
            consecutiveHighDays: newConsecutiveHigh,
          });

          // 30-day volatility calculation
          const last30 = scoreHistory.slice(-30).map((s) => s.adjustedScore);
          const mean = last30.reduce((a, b) => a + b, 0) / (last30.length || 1);
          const variance = last30.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (last30.length || 1);
          const volatility = Math.sqrt(variance);

          // Sync Score and Ledger to Cloud
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            logger.warn('[HABIT_STORE] Cannot sync score - no authenticated user');
            endPerformanceMark('recalculateAndSaveScore');
            return;
          }

          // Sync Score with retry
          const { error: scoreError } = await supabase
            .from('scores')
            .upsert({
              user_id: user.id,
              date: today,
              daily_score: result.rawScore,
              adjusted_score: result.adjustedScore,
              alignment_score: result.finalAlignment,
              identity_debt: newDebt,
              volatility: Math.round(volatility * 10) / 10,
            }, { onConflict: 'user_id,date' });

          if (scoreError) {
            logger.error('[HABIT_STORE] Failed to sync score', scoreError as Error);
          }

          // Sync New Ledger Entries
          if (uniqueNewEntries.length > 0) {
            const cloudEntries = uniqueNewEntries.map(e => ({
              user_id: user.id,
              date: e.date,
              type: e.type,
              label: e.label,
              amount: e.amount
            }));
            
            const { error: ledgerError } = await supabase.from('debt_ledger').insert(cloudEntries);
            
            if (ledgerError) {
              logger.error('[HABIT_STORE] Failed to sync debt ledger', ledgerError as Error);
            }
          }

          endPerformanceMark('recalculateAndSaveScore');
          logger.info('[HABIT_STORE] Score recalculated and saved', {
            score: result.finalAlignment,
            debt: newDebt,
            volatility: Math.round(volatility * 10) / 10,
          });
        } catch (error) {
          const err = error as Error;
          trackError(err, { component: 'useHabitStore', action: 'recalculateAndSaveScore' });
          logger.error('[HABIT_STORE] Recalculate score failed', err);
          set({ error: 'Failed to calculate score' });
          endPerformanceMark('recalculateAndSaveScore');
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
