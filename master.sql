-- =====================================================
-- Disciplex - Complete Supabase Database Schema
-- Version 1.0 - Full Master Schema
-- 
-- Run this file in a NEW Supabase project to set up
-- the complete database schema with all tables, indexes,
-- RLS policies, triggers, and helper functions.
-- =====================================================

-- =====================================================
-- ENABLE UUID EXTENSION
-- =====================================================
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. BASE TABLES
-- =====================================================

-- Users table: Stores user profiles with identity claims
create table if not exists users (
  id uuid references auth.users not null primary key,
  email text,
  identity_claim text,
  refuse_to_be text,
  tone_preference text default 'analytical',
  reckoning_time time default '20:00',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habits table: User-defined habits with non-negotiable flags
create table if not exists habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  is_non_negotiable boolean default false,
  weight int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Completions table: Daily habit completion records
create table if not exists completions (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  completed boolean not null,
  logged_at timestamp with time zone not null,
  late_logged boolean default false
);

-- Scores table: Daily calculated scores using the 8-step scoring engine
create table if not exists scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  date date not null,
  daily_score float not null,
  adjusted_score float not null,
  alignment_score float not null,
  identity_debt float not null,
  volatility float not null,
  unique(user_id, date)
);

-- Debt Ledger: Track identity debt changes over time
create table if not exists debt_ledger (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  date date not null,
  type text not null check (type in ('miss', 'late', 'penalty', 'clearance')),
  label text not null,
  amount int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reckonings table: Weekly AI-generated verdicts and directives
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

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_created_at on users(created_at);

-- Habits table indexes
create index if not exists idx_habits_user_id on habits(user_id);
create index if not exists idx_habits_non_negotiable on habits(user_id, is_non_negotiable) where is_non_negotiable = true;

-- Completions table indexes
create index if not exists idx_completions_habit_id on completions(habit_id);
create index if not exists idx_completions_date on completions(date);
create index if not exists idx_completions_habit_date on completions(habit_id, date);

-- Scores table indexes
create index if not exists idx_scores_user_id on scores(user_id);
create index if not exists idx_scores_date on scores(date);
create index if not exists idx_scores_user_date on scores(user_id, date desc);

-- Reckonings table indexes
create index if not exists idx_reckonings_user_id on reckonings(user_id);
create index if not exists idx_reckonings_week_start on reckonings(week_start);
create index if not exists idx_reckonings_user_week on reckonings(user_id, week_start desc);

-- Debt Ledger indexes
create index if not exists idx_debt_ledger_user_id on debt_ledger(user_id);
create index if not exists idx_debt_ledger_date on debt_ledger(date);
create index if not exists idx_debt_ledger_user_date on debt_ledger(user_id, date desc);

-- =====================================================
-- 3. DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Score ranges (0-100)
alter table scores drop constraint if exists check_daily_score_range;
alter table scores add constraint check_daily_score_range
  check (daily_score >= 0 and daily_score <= 100);

alter table scores drop constraint if exists check_adjusted_score_range;
alter table scores add constraint check_adjusted_score_range
  check (adjusted_score >= 0 and adjusted_score <= 100);

alter table scores drop constraint if exists check_alignment_score_range;
alter table scores add constraint check_alignment_score_range
  check (alignment_score >= 0 and alignment_score <= 100);

-- Non-negative values
alter table scores drop constraint if exists check_identity_debt_non_negative;
alter table scores add constraint check_identity_debt_non_negative
  check (identity_debt >= 0);

alter table scores drop constraint if exists check_volatility_non_negative;
alter table scores add constraint check_volatility_non_negative
  check (volatility >= 0);

-- Habit weight must be positive
alter table habits drop constraint if exists check_habit_weight_positive;
alter table habits add constraint check_habit_weight_positive
  check (weight > 0);

-- Tone preference must be valid
alter table users drop constraint if exists check_tone_preference;
alter table users add constraint check_tone_preference
  check (tone_preference in ('analytical', 'brutal'));

-- Reckoning time must be valid (HH:MM format)
alter table users drop constraint if exists check_reckoning_time_format;
alter table users add constraint check_reckoning_time_format
  check (
    extract(hour from reckoning_time) >= 0 
    and extract(hour from reckoning_time) <= 23
    and extract(minute from reckoning_time) >= 0
    and extract(minute from reckoning_time) <= 59
  );

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table habits enable row level security;
alter table completions enable row level security;
alter table scores enable row level security;
alter table reckonings enable row level security;

-- ===== USERS POLICIES =====
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

-- ===== HABITS POLICIES =====
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

-- ===== COMPLETIONS POLICIES =====
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

-- ===== SCORES POLICIES =====
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

-- ===== RECKONINGS POLICIES =====
drop policy if exists "Users can view own reckonings" on reckonings;
create policy "Users can view own reckonings" on reckonings
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own reckonings" on reckonings;
create policy "Users can insert own reckonings" on reckonings
  for insert
  with check (auth.uid() = user_id);

-- ===== DEBT LEDGER POLICIES =====
drop policy if exists "Users can view own debt ledger" on debt_ledger;
create policy "Users can view own debt ledger" on debt_ledger
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own debt ledger" on debt_ledger;
create policy "Users can insert own debt ledger" on debt_ledger
  for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
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

-- Trigger for users updated_at
drop trigger if exists set_updated_at_users on users;
create trigger set_updated_at_users
  before update on users
  for each row execute procedure public.handle_updated_at();

-- Trigger for habits updated_at
drop trigger if exists set_updated_at_habits on habits;
create trigger set_updated_at_habits
  before update on habits
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- 6. HELPER VIEWS
-- =====================================================

-- View: User stats summary
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
  count(distinct r.id) as total_reckonings,
  sum(dl.amount) as total_debt_accumulated
from users u
left join habits h on h.user_id = u.id
left join completions c on c.habit_id = h.id
left join scores s on s.user_id = u.id
left join reckonings r on r.user_id = u.id
left join debt_ledger dl on dl.user_id = u.id
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
-- 7. DEVELOPMENT UTILITIES (USE WITH CAUTION)
-- =====================================================

-- Function to delete all user data (for testing)
create or replace function delete_all_user_data(p_user_id uuid)
returns void as $$
begin
  -- Delete in order respecting foreign keys
  delete from reckonings where user_id = p_user_id;
  delete from debt_ledger where user_id = p_user_id;
  delete from scores where user_id = p_user_id;
  delete from completions where habit_id in (select id from habits where user_id = p_user_id);
  delete from habits where user_id = p_user_id;
  delete from users where id = p_user_id;
end;
$$ language plpgsql security definer;

comment on function delete_all_user_data is 'DEVELOPMENT ONLY: Deletes all data for a user including profile';

-- =====================================================
-- 8. TABLE COMMENTS FOR DOCUMENTATION
-- =====================================================

comment on table users is 'User profiles with identity claims and preferences';
comment on table habits is 'User-defined habits with non-negotiable flags';
comment on table completions is 'Daily habit completion records';
comment on table scores is 'Daily calculated scores using the 8-step scoring engine';
comment on table debt_ledger is 'Identity debt transaction ledger';
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
-- SETUP COMPLETE
-- =====================================================
-- Your Disciplex database is now fully configured with:
-- ✓ 6 tables (users, habits, completions, scores, debt_ledger, reckonings)
-- ✓ Performance indexes on all foreign keys
-- ✓ Row Level Security (RLS) policies
-- ✓ Auto-create user profile on signup trigger
-- ✓ updated_at triggers
-- ✓ Data validation constraints
-- ✓ Helper views for analytics
-- ✓ Development cleanup function
-- =====================================================
