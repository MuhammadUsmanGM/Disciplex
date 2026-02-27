/**
 * Disciplex Scoring Engine — All 8 Steps
 * Reference: disciplex.md Section 13
 */

import { Completion, Habit } from '@/src/types/habit';

export interface ScoringInput {
  habits: Habit[];
  completions: Completion[]; // today's completions
  last7DayScores: number[]; // daily_score values, oldest → newest, length up to 7
  identityDebt: number;
}

export interface ScoringResult {
  rawScore: number;
  weightedScore: number;
  adjustedScore: number; // after consistency penalty
  identityAlignment: number; // 7-day weighted
  finalAlignment: number; // after debt reduction
  identityDebt: number; // updated debt
  volatilityIndex: number; // std dev of last 7 scores
}

// ─── Step 1: Raw Daily Execution Score ───────────────────────────────────────

function rawScore(habits: Habit[], completions: Completion[]): number {
  if (habits.length === 0) return 0;
  const completed = habits.filter((h) => isCompleted(h.id, completions)).length;
  return (completed / habits.length) * 100;
}

// ─── Step 2: Non-Negotiable Weighted Score ────────────────────────────────────

// (removed unused weightedScore function)

// ─── Step 3: Late Log Penalty ────────────────────────────────────────────────
// Applied during completion recording — late_logged flag reduces effective weight.
// The scoring engine respects this by treating late-logged completions at 70% weight.

function weightedScoreWithLatePenalty(habits: Habit[], completions: Completion[]): number {
  if (habits.length === 0) return 0;

  const effectiveHabits = habits.map((h) => ({
    ...h,
    effectiveWeight: h.is_non_negotiable ? h.weight * 2 : h.weight,
  }));

  const totalWeight = effectiveHabits.reduce((sum, h) => sum + h.effectiveWeight, 0);
  if (totalWeight === 0) return 0;

  let completedWeight = 0;
  for (const h of effectiveHabits) {
    const completion = completions.find((c) => c.habit_id === h.id && c.completed);
    if (completion) {
      const latePenalty = completion.late_logged ? 0.7 : 1.0;
      completedWeight += h.effectiveWeight * latePenalty;
    }
  }

  return (completedWeight / totalWeight) * 100;
}

// ─── Step 4: Consistency Penalty (Anti-Spike) ────────────────────────────────

function consistencyPenalty(last7Scores: number[]): number {
  if (last7Scores.length < 2) return 0;
  const volatility = stdDev(last7Scores);
  return volatility * 0.5;
}

// ─── Step 5: Identity Alignment (7-Day Weighted Average) ─────────────────────

function identityAlignment(todayScore: number, last6DayScores: number[]): number {
  if (last6DayScores.length === 0) return todayScore;
  const last6Avg = last6DayScores.reduce((a, b) => a + b, 0) / last6DayScores.length;
  return todayScore * 0.4 + last6Avg * 0.6;
}

// ─── Step 6: Identity Debt ───────────────────────────────────────────────────

export function updateDebt(
  currentDebt: number,
  habits: Habit[],
  completions: Completion[],
  adjustedScore: number,
  consecutiveHighDays: number, // days in a row with score > 85
): number {
  // Add 10 per missed non-negotiable
  const missedNonNeg = habits.filter(
    (h) => h.is_non_negotiable && !isCompleted(h.id, completions),
  ).length;
  let debt = currentDebt + missedNonNeg * 10;

  // Debt clears after 2 consecutive days > 85
  if (consecutiveHighDays >= 2) {
    debt = 0;
  } else if (adjustedScore > 85) {
    // Decay at 5 points/day of high performance
    debt = Math.max(0, debt - 5);
  }

  return debt;
}

function finalAlignment(alignment: number, debt: number): number {
  return Math.max(0, alignment - debt * 0.3);
}

// ─── Step 7: Volatility Index (30-day) ───────────────────────────────────────

export function volatilityIndex(last30DayScores: number[]): number {
  if (last30DayScores.length < 2) return 0;
  return stdDev(last30DayScores);
}

// ─── Step 8: Bottleneck Detection ────────────────────────────────────────────

export interface BottleneckResult {
  habitId: string;
  habitName: string;
  completionRate: number;
  avgScoreWhenCompleted: number;
}

export function detectBottleneck(
  habits: Habit[],
  weeklyCompletions: { date: string; completions: Completion[] }[],
  weeklyScores: { date: string; score: number }[],
): BottleneckResult | null {
  let result: BottleneckResult | null = null;

  for (const habit of habits) {
    const days = weeklyCompletions.length;
    if (days === 0) continue;

    const completedDays = weeklyCompletions.filter((day) =>
      isCompleted(habit.id, day.completions),
    );
    const completionRate = completedDays.length / days;

    if (completionRate >= 0.6) continue; // Not a bottleneck if >60% completion

    // Average score on days this habit WAS completed
    const scoresOnCompletedDays = completedDays
      .map((day) => weeklyScores.find((s) => s.date === day.date)?.score ?? null)
      .filter((s): s is number => s !== null);

    if (scoresOnCompletedDays.length === 0) continue;

    const avgScoreWhenCompleted =
      scoresOnCompletedDays.reduce((a, b) => a + b, 0) / scoresOnCompletedDays.length;

    if (avgScoreWhenCompleted > 80) {
      // Structural bottleneck: low completion but high impact
      if (!result || completionRate < result.completionRate) {
        result = {
          habitId: habit.id,
          habitName: habit.name,
          completionRate,
          avgScoreWhenCompleted,
        };
      }
    }
  }

  return result;
}

// ─── Main: Calculate Daily Score ─────────────────────────────────────────────

export function calculateDailyScore(input: ScoringInput): ScoringResult {
  const { habits, completions, last7DayScores, identityDebt } = input;

  const raw = rawScore(habits, completions);
  const weighted = weightedScoreWithLatePenalty(habits, completions);

  // Consistency penalty uses last 7 scores including today
  const allScores = [...last7DayScores, weighted];
  const penalty = consistencyPenalty(allScores);
  const adjusted = Math.max(0, weighted - penalty);

  const last6 = last7DayScores.slice(-6);
  const alignment = identityAlignment(adjusted, last6);
  const final = finalAlignment(alignment, identityDebt);
  const volIndex = stdDev(allScores);

  return {
    rawScore: round(raw),
    weightedScore: round(weighted),
    adjustedScore: round(adjusted),
    identityAlignment: round(alignment),
    finalAlignment: round(Math.min(100, final)),
    identityDebt,
    volatilityIndex: round(volIndex),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCompleted(habitId: string, completions: Completion[]): boolean {
  return completions.some((c) => c.habit_id === habitId && c.completed);
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
