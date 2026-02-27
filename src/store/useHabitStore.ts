/**
 * Habit Store — Zustand
 * Manages habits, completions, scores, and identity debt.
 * Uses AsyncStorage for local persistence (no backend yet).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { calculateDailyScore, updateDebt } from '@/src/lib/scoring';
import { Completion, Habit } from '@/src/types/habit';

const STORAGE_KEY = 'disciplex_habit_store';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function nowISO(): string {
  return new Date().toISOString();
}

function isLate(loggedAt: string): boolean {
  // Late = logged after 20:00 (8pm) on the same day
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
  completions: Completion[]; // all-time completions
  scoreHistory: ScoreHistory[];
  identityDebt: number;
  consecutiveHighDays: number;

  // Actions
  initHabitsFromOnboarding: (nonNegotiables: string[]) => void;
  toggleHabit: (habitId: string) => void;
  getTodayCompletions: () => Completion[];
  getTodayScore: () => number;
  getHabitsWithStatus: () => (Habit & { completedToday: boolean; lateToday: boolean })[];
  getLast7DayScores: () => number[];
  recalculateAndSaveScore: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      scoreHistory: [],
      identityDebt: 0,
      consecutiveHighDays: 0,

      initHabitsFromOnboarding: (nonNegotiables: string[]) => {
        const existing = get().habits;
        if (existing.length > 0) return; // already initialized

        const habits: Habit[] = nonNegotiables.map((name, i) => ({
          id: `habit_${i}_${Date.now()}`,
          user_id: 'local',
          name,
          is_non_negotiable: true,
          weight: 1,
          created_at: nowISO(),
        }));

        set({ habits });
      },

      toggleHabit: (habitId: string) => {
        const today = todayISO();
        const existing = get().completions.find(
          (c) => c.habit_id === habitId && c.date === today,
        );

        let newCompletions: Completion[];

        if (existing) {
          // Toggle off
          newCompletions = get().completions.filter(
            (c) => !(c.habit_id === habitId && c.date === today),
          );
        } else {
          // Toggle on
          const loggedAt = nowISO();
          const completion: Completion = {
            id: `comp_${habitId}_${today}`,
            habit_id: habitId,
            date: today,
            completed: true,
            logged_at: loggedAt,
            late_logged: isLate(loggedAt),
          };
          newCompletions = [...get().completions, completion];
        }

        set({ completions: newCompletions });
        get().recalculateAndSaveScore();
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

      recalculateAndSaveScore: () => {
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

        // Upsert today's score in history
        const existingIdx = scoreHistory.findIndex((s) => s.date === today);
        const entry: ScoreHistory = {
          date: today,
          score: result.finalAlignment,
          adjustedScore: result.adjustedScore,
          identityDebt: newDebt,
        };

        const newHistory =
          existingIdx >= 0
            ? scoreHistory.map((s, i) => (i === existingIdx ? entry : s))
            : [...scoreHistory, entry];

        set({
          scoreHistory: newHistory,
          identityDebt: newDebt,
          consecutiveHighDays: newConsecutiveHigh,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
