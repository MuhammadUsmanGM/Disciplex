-- =====================================================
-- Disciplex - Missing SQL for Supabase
-- Run this in your Supabase SQL Editor after the base schema
-- =====================================================

-- =====================================================
-- 1. RECKONINGS TABLE (Missing)
-- Stores AI-generated weekly verdicts
-- =====================================================
create table if not exists reckonings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  week_start date not null,
  week_score float not null,
  trend float not null,
  bottleneck text,
  verdict text not null,
  directive text not null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start)
);

comment on table reckonings is 'Weekly AI Reckoning verdicts for users';

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- Speed up common queries
-- =====================================================

-- Users table
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_created_at on users(created_at);

-- Habits table
create index if not exists idx_habits_user_id on habits(user_id);
create index if not exists idx_habits_non_negotiable on habits(user_id, is_non_negotiable) where is_non_negotiable = true;

-- Completions table
create index if not exists idx_completions_habit_id on completions(habit_id);
create index if not exists idx_completions_date on completions(date);
create index if not exists idx_completions_habit_date on completions(habit_id, date);
create index if not exists idx_completions_user_date on completions(habit_id, date) where completed = true;

-- Scores table
create index if not exists idx_scores_user_id on scores(user_id);
create index if not exists idx_scores_date on scores(date);
create index if not exists idx_scores_user_date on scores(user_id, date desc);

-- Reckonings table
create index if not exists idx_reckonings_user_id on reckonings(user_id);
create index if not exists idx_reckonings_week_start on reckonings(week_start);
create index if not exists idx_reckonings_user_week on reckonings(user_id, week_start desc);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- =====================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table habits enable row level security;
alter table completions enable row level security;
alter table scores enable row level security;
alter table reckonings enable row level security;

-- Users policies
drop policy if exists "Users can view own profile" on users;
create policy "Users can view own profile" on users
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on users;
create policy "Users can update own profile" on users
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on users;
create policy "Users can insert own profile" on users
  for insert
  with check (auth.uid() = id);

-- Habits policies
drop policy if exists "Users can view own habits" on habits;
create policy "Users can view own habits" on habits
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own habits" on habits;
create policy "Users can insert own habits" on habits
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own habits" on habits;
create policy "Users can update own habits" on habits
  for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own habits" on habits;
create policy "Users can delete own habits" on habits
  for delete
  using (auth.uid() = user_id);

-- Completions policies
drop policy if exists "Users can view own completions" on completions;
create policy "Users can view own completions" on completions
  for select
  using (
    exists (
      select 1 from habits
      where habits.id = completions.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own completions" on completions;
create policy "Users can insert own completions" on completions
  for insert
  with check (
    exists (
      select 1 from habits
      where habits.id = completions.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own completions" on completions;
create policy "Users can update own completions" on completions
  for update
  using (
    exists (
      select 1 from habits
      where habits.id = completions.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own completions" on completions;
create policy "Users can delete own completions" on completions
  for delete
  using (
    exists (
      select 1 from habits
      where habits.id = completions.habit_id
      and habits.user_id = auth.uid()
    )
  );

-- Scores policies
drop policy if exists "Users can view own scores" on scores;
create policy "Users can view own scores" on scores
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own scores" on scores;
create policy "Users can insert own scores" on scores
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own scores" on scores;
create policy "Users can update own scores" on scores
  for update
  using (auth.uid() = user_id);

-- Reckonings policies
drop policy if exists "Users can view own reckonings" on reckonings;
create policy "Users can view own reckonings" on reckonings
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own reckonings" on reckonings;
create policy "Users can insert own reckonings" on reckonings
  for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, identity_claim, refuse_to_be, tone_preference, reckoning_time)
  values (
    new.id,
    new.email,
    null,
    null,
    'analytical',
    '20:00'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- =====================================================
-- 5. ADD UPDATED_AT COLUMN (Optional but recommended)
-- =====================================================

-- Add updated_at to users table
alter table users add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Add updated_at to habits table
alter table habits add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Create trigger for users
drop trigger if exists set_updated_at_users on users;
create trigger set_updated_at_users
  before update on users
  for each row execute procedure public.handle_updated_at();

-- Create trigger for habits
drop trigger if exists set_updated_at_habits on habits;
create trigger set_updated_at_habits
  before update on habits
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- 6. DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Ensure score values are within valid ranges
alter table scores drop constraint if exists check_daily_score_range;
alter table scores add constraint check_daily_score_range
  check (daily_score >= 0 and daily_score <= 100);

alter table scores drop constraint if exists check_adjusted_score_range;
alter table scores add constraint check_adjusted_score_range
  check (adjusted_score >= 0 and adjusted_score <= 100);

alter table scores drop constraint if exists check_alignment_score_range;
alter table scores add constraint check_alignment_score_range
  check (alignment_score >= 0 and alignment_score <= 100);

-- Ensure identity_debt is non-negative
alter table scores drop constraint if exists check_identity_debt_non_negative;
alter table scores add constraint check_identity_debt_non_negative
  check (identity_debt >= 0);

-- Ensure volatility is non-negative
alter table scores drop constraint if exists check_volatility_non_negative;
alter table scores add constraint check_volatility_non_negative
  check (volatility >= 0);

-- Ensure habit weight is positive
alter table habits drop constraint if exists check_habit_weight_positive;
alter table habits add constraint check_habit_weight_positive
  check (weight > 0);

-- Ensure tone_preference is valid
alter table users drop constraint if exists check_tone_preference;
alter table users add constraint check_tone_preference
  check (tone_preference in ('analytical', 'brutal'));

-- Ensure reckoning_time is valid format
alter table users drop constraint if exists check_reckoning_time_format;
alter table users add constraint check_reckoning_time_format
  check (reckoning_time ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$');

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

comment on table users is 'User profiles with identity claims and preferences';
comment on table habits is 'User-defined habits with non-negotiable flags';
comment on table completions is 'Daily habit completion records';
comment on table scores is 'Daily calculated scores using the 8-step scoring engine';
comment on table reckonings is 'Weekly AI-generated verdicts and directives';

comment on column users.identity_claim is 'The identity the user is committing to become';
comment on column users.refuse_to_be is 'The counter-identity the user rejects';
comment on column users.tone_preference is 'AI tone: analytical or brutal';
comment on column users.reckoning_time is 'Preferred time for Sunday reckoning delivery (HH:MM)';

comment on column habits.is_non_negotiable is 'If true, missing this habit adds identity debt';
comment on column habits.weight is 'Habit importance multiplier (default 1, non-negotiables typically 2)';

comment on column completions.late_logged is 'True if logged >4 hours after habit window ended';

comment on column scores.daily_score is 'Raw execution score (completed/total * 100)';
comment on column scores.adjusted_score is 'Score after consistency penalty';
comment on column scores.alignment_score is '7-day weighted identity alignment';
comment on column scores.identity_debt is 'Accumulated debt from missed non-negotiables';
comment on column scores.volatility is 'Standard deviation of last 7 scores';

comment on column reckonings.verdict is 'AI-generated analysis of the week';
comment on column reckonings.directive is 'Single actionable instruction for next week';

-- =====================================================
-- 8. UTILITY VIEWS (Optional but helpful)
-- =====================================================

-- View: Current user stats summary
create or replace view user_stats_summary as
select
  u.id as user_id,
  u.email,
  u.identity_claim,
  count(distinct h.id) as total_habits,
  count(distinct case when h.is_non_negotiable then h.id end) as non_negotiable_count,
  count(distinct c.date) as total_completion_days,
  avg(s.alignment_score) as avg_alignment_score,
  max(s.alignment_score) as max_alignment_score,
  min(s.alignment_score) as min_alignment_score,
  avg(s.identity_debt) as avg_identity_debt,
  count(distinct r.id) as total_reckonings
from users u
left join habits h on h.user_id = u.id
left join completions c on c.habit_id = h.id
left join scores s on s.user_id = u.id
left join reckonings r on r.user_id = u.id
group by u.id, u.email, u.identity_claim;

-- View: Recent activity (last 7 days)
create or replace view recent_activity as
select
  u.id as user_id,
  s.date,
  s.alignment_score,
  s.identity_debt,
  count(c.id) as completions_count,
  count(case when c.completed then 1 end) as completed_count
from users u
left join scores s on s.user_id = u.id
left join completions c on c.habit_id in (select id from habits where user_id = u.id)
  and c.date = s.date
group by u.id, s.date, s.alignment_score, s.identity_debt;

-- =====================================================
-- 9. CLEANUP FUNCTION (Development only - use with caution)
-- =====================================================

-- Function to delete all user data (for testing)
create or replace function delete_all_user_data(p_user_id uuid)
returns void as $$
begin
  -- Delete in order respecting foreign
  delete from reckonings where user_id = p_user_id;
  delete from scores where user_id = p_user_id;
  delete from completions where habit_id in (select id from habits where user_id = p_user_id);
  delete from habits where user_id = p_user_id;
  delete from users where id = p_user_id;
end;
$$ language plpgsql security definer;

comment on function delete_all_user_data is 'DEVELOPMENT ONLY: Deletes all data for a user including profile';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Run this file after your base schema to have a fully
-- configured Disciplex backend with RLS, indexes, and
-- helper functions.
-- =====================================================
