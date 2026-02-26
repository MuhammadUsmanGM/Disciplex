/**
 * Score & Metrics Types
 */

export interface DailyScore {
  id: string;
  user_id: string;
  date: string;
  daily_score: number;
  adjusted_score: number;
  alignment_score: number;
  identity_debt: number;
  volatility: number;
}

export interface ScoreMetrics {
  daily_score: number;
  weighted_score: number;
  adjusted_score: number;
  identity_alignment: number;
  identity_debt: number;
  volatility_index: number;
  trend_7d: number;
  trend_30d: number;
}

export interface Bottleneck {
  habit_name: string;
  completion_rate: number;
  pattern: string;
}
