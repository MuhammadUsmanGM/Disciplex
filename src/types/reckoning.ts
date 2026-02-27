/**
 * Weekly Reckoning Types
 */

export interface Reckoning {
  id: string;
  user_id: string;
  week_start: string;
  week_score: number;
  trend: number;
  bottleneck: string | null;
  verdict: string;
  directive: string;
  generated_at: string;
}

export interface ReckoningPayload {
  identity_claim: string;
  refuse_to_be: string;
  week_score: number;
  week_trend: number;
  trend_30d: number;
  volatility_index: number;
  identity_alignment: number;
  identity_debt: number;
  habits: HabitSummary[];
  bottleneck_habit: string | null;
  bottleneck_pattern: string | null;
}

export interface HabitSummary {
  name: string;
  completion_rate: number;
  is_non_negotiable: boolean;
}

export interface ReckoningSummary {
  week_score: number;
  trend: number;
  most_missed: string | null;
  debt: number;
}

export interface ReckoningResult {
  verdict: string;
  directive: string;
  bottleneck: string;
  raw_response: string;
}
