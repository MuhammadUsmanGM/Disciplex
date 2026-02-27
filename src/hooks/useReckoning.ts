/**
 * useReckoning Hook
 * Manages Weekly AI Reckoning state and generation
 */

import { useState, useCallback } from 'react';

import { generateWeeklyReckoning, detectPrimaryBottleneck, calculateWeekTrend, getMostMissedHabit } from '@/src/lib/ai';
import { ReckoningPayload, ReckoningResult } from '@/src/types/reckoning';

interface UseReckoningReturn {
  loading: boolean;
  error: string | null;
  reckoning: ReckoningResult | null;
  generateReckoning: (payload: Omit<ReckoningPayload, 'bottleneck_habit' | 'bottleneck_pattern'>) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for generating and managing Weekly AI Reckonings
 */
export function useReckoning(): UseReckoningReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reckoning, setReckoning] = useState<ReckoningResult | null>(null);

  const generateReckoning = useCallback(
    async (payload: Omit<ReckoningPayload, 'bottleneck_habit' | 'bottleneck_pattern'>) => {
      setLoading(true);
      setError(null);

      try {
        // Detect bottleneck from habit data
        const bottleneck = detectPrimaryBottleneck(payload.habits, payload.week_score);

        const fullPayload: ReckoningPayload = {
          ...payload,
          bottleneck_habit: bottleneck?.habit ?? null,
          bottleneck_pattern: bottleneck?.pattern ?? null,
        };

        const result = await generateWeeklyReckoning(fullPayload);
        setReckoning(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate Weekly Reckoning';
        setError(errorMessage);
        console.error('Reckoning generation error:', err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setReckoning(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    reckoning,
    generateReckoning,
    reset,
  };
}

/**
 * Helper to build reckoning payload from store data
 */
export function buildReckoningPayload(input: {
  identityClaim: string;
  refuseToBe: string;
  weekScore: number;
  previousWeekScore: number;
  trend30d: number;
  volatilityIndex: number;
  identityAlignment: number;
  identityDebt: number;
  habits: Array<{
    name: string;
    completionRate: number;
    isNonNegotiable: boolean;
  }>;
}): Omit<ReckoningPayload, 'bottleneck_habit' | 'bottleneck_pattern'> {
  const weekTrend = calculateWeekTrend(input.weekScore, input.previousWeekScore);
  const mostMissed = getMostMissedHabit(input.habits);

  return {
    identity_claim: input.identityClaim,
    refuse_to_be: input.refuseToBe,
    week_score: input.weekScore,
    week_trend: weekTrend,
    trend_30d: input.trend30d,
    volatility_index: input.volatilityIndex,
    identity_alignment: input.identityAlignment,
    identity_debt: input.identityDebt,
    habits: input.habits.map((h) => ({
      name: h.name,
      completion_rate: h.completionRate,
      is_non_negotiable: h.isNonNegotiable,
    })),
  };
}
