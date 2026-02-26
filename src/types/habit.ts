/**
 * Habit Types — Disciplex Core Domain
 */

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  is_non_negotiable: boolean;
  weight: number;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  completed: boolean;
  logged_at: string;
  late_logged: boolean;
}

export interface HabitWithCompletion extends Habit {
  completion?: Completion;
  completion_rate?: number;
}
