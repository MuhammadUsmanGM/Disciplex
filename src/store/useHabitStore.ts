/**
 * Habit Store — Zustand
 * Manages habits, completions, scores, and identity debt.
 * Uses AsyncStorage for local persistence and syncs with Supabase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { calculateDailyScore, updateDebt } from '@/src/lib/scoring';
import { supabase } from '@/src/lib/supabase';
import { Completion, Habit } from '@/src/types/habit';

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
  consecutiveHighDays: number;
  loading: boolean;

  // Actions
  loadDataFromCloud: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  getTodayCompletions: () => Completion[];
  getTodayScore: () => number;
  getHabitsWithStatus: () => (Habit & { completedToday: boolean; lateToday: boolean })[];
  getLast7DayScores: () => number[];
  recalculateAndSaveScore: () => Promise<void>;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      scoreHistory: [],
      identityDebt: 0,
      consecutiveHighDays: 0,
      loading: false,

      loadDataFromCloud: async () => {
        set({ loading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }

          // Fetch all habits
          const { data: habits } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id);

          if (!habits || habits.length === 0) {
             set({ loading: false });
             return;
          }

          const habitIds = habits.map((h) => h.id);

          // Fetch all completions
          const { data: completions } = await supabase
            .from('completions')
            .select('*')
            .in('habit_id', habitIds);

          // Fetch all scores
          const { data: scores } = await supabase
            .from('scores')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true });

          const scoreHistory: ScoreHistory[] = (scores || []).map((s) => ({
             date: s.date,
             score: s.alignment_score,
             adjustedScore: s.adjusted_score,
             identityDebt: s.identity_debt,
          }));

          const latestDebt = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].identityDebt : 0;

          set({
            habits: habits as Habit[],
            completions: (completions as Completion[]) || [],
            scoreHistory,
            identityDebt: latestDebt,
            loading: false,
          });
        } catch (error) {
          console.error('Failed to load cloud data:', error);
          set({ loading: false });
        }
      },

      toggleHabit: async (habitId: string) => {
        const today = todayISO();
        const existing = get().completions.find(
          (c) => c.habit_id === habitId && c.date === today,
        );

        let newCompletions: Completion[];

        if (existing) {
          // Toggle off locally
          newCompletions = get().completions.filter(
            (c) => !(c.habit_id === habitId && c.date === today),
          );
          set({ completions: newCompletions });
          
          // Toggle off on Cloud
          await supabase.from('completions').delete().eq('id', existing.id);
        } else {
          // Toggle on locally
          const loggedAt = nowISO();
          const completion = {
            habit_id: habitId,
            date: today,
            completed: true,
            logged_at: loggedAt,
            late_logged: isLate(loggedAt),
          };
          
          // Toggle on on Cloud
          const { data } = await supabase.from('completions').insert(completion).select().single();
          
          if (data) {
             newCompletions = [...get().completions, data as Completion];
             set({ completions: newCompletions });
          }
        }

        await get().recalculateAndSaveScore();
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
        const { habits, completions, scoreHistory, identityDebt, consecutiveHighDays } = get();
        const today = todayISO();
        const todayCompletions = completions.filter((c) => c.date === today && c.completed);
        const last7 = scoreHistory.slice(-7).map((s) => s.adjustedScore);

        const result = calculateDailyScore({
          habits,
          completions: todayCompletions,
          last7DayScores: last7,
          identityDebt,
        });

        const newDebt = updateDebt(
          identityDebt,
          habits,
          todayCompletions,
          result.adjustedScore,
          consecutiveHighDays,
        );

        const newConsecutiveHigh =
          result.adjustedScore > 85 ? consecutiveHighDays + 1 : 0;

        const entry: ScoreHistory = {
          date: today,
          score: result.finalAlignment,
          adjustedScore: result.adjustedScore,
          identityDebt: newDebt,
        };

        const existingIdx = scoreHistory.findIndex((s) => s.date === today);
        const newHistory =
          existingIdx >= 0
            ? scoreHistory.map((s, i) => (i === existingIdx ? entry : s))
            : [...scoreHistory, entry];

        set({
          scoreHistory: newHistory,
          identityDebt: newDebt,
          consecutiveHighDays: newConsecutiveHigh,
        });

        // Calculate 30-day volatility for storage
        const last30 = scoreHistory.slice(-30).map((s) => s.adjustedScore);
        const mean = last30.reduce((a, b) => a + b, 0) / (last30.length || 1);
        const variance = last30.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (last30.length || 1);
        const volatility = Math.sqrt(variance);

        // Sync Score to Cloud
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('scores').upsert({
            user_id: user.id,
            date: today,
            daily_score: result.rawScore,
            adjusted_score: result.adjustedScore,
            alignment_score: result.finalAlignment,
            identity_debt: newDebt,
            volatility: Math.round(volatility * 10) / 10,
          }, { onConflict: 'user_id,date' });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
