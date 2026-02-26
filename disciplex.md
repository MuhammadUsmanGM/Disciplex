# Disciplex — The AI Discipline Operating System

---

## 1. What Disciplex Actually Is

Disciplex is not a habit tracker.

It is a behavioral measurement system that quantifies the gap between who you claim to be and what your actions prove you are.

It exists to solve one problem:

> "I know what I should do, but I don't execute consistently."

Disciplex measures **execution**, **alignment**, and **consistency** — not motivation.

---

## 2. Product Positioning

**Target User**
- Founders
- Builders
- High-performance students
- Self-improvement serious users
- Gym-discipline crowd
- Execution-focused professionals

**Not:**
- Casual wellness users
- "Drink water reminder" audience
- Gamification lovers

This is a performance system.

---

## 3. Core Philosophy

- **Identity > Goals**
- **Consistency > Perfection**
- **Data > Feelings**
- **Accountability > Motivation**

Everything in the product must support these. If a feature does not reinforce identity alignment — cut it.

---

## 4. Visual Identity & Theme System

These colors are not aesthetic choices. They are psychological tools.

### Official Color Tokens

**Base Layer**
```
--color-base:        #0A0A0A
--color-surface:     #111111
--color-surface-2:   #1A1A1A
--color-border:      #2A2A2A
```

**Text**
```
--color-text-primary:    #F5F5F5
--color-text-secondary:  #888888
--color-text-muted:      #3A3A3A
```

**Gold — Premium Signal**
```
--color-gold:         #C9A84C
--color-gold-dim:     #A07830
--color-gold-subtle:  #C9A84C1A
```

**Red — Consequence Only**
```
--color-red:          #CC0000
--color-red-subtle:   #CC00001A
```

**Status**
```
--color-success:      #2A7A4B
--color-warning:      #8A6A00
```

### Color Rules

- Base background is **ALWAYS** `#0A0A0A`
- **Gold** = Achievement / High Value
- **Red** = Failure / Debt / Risk
- **White** = Core data
- **Grey** = Secondary information
- No gradients. No playful colors. No unnecessary decoration.

> Restraint = premium.

---

## 5. The Core Product Loop

This is the engine.

1. User declares identity.
2. User defines non-negotiable behaviors.
3. User logs daily execution.
4. App calculates Identity Alignment Score.
5. App exposes the gap.
6. User corrects behavior.
7. Repeat.

If this loop is weak, the app fails.

---

## 6. MVP Feature Set (V1)

Keep this tight.

### 1️⃣ Identity Setup (Onboarding)

User defines:
- Who I Am
- 3 Non-Negotiable Daily Behaviors
- Who I Refuse to Be

These are stored as identity claims.

### 2️⃣ Daily Execution Log

Each habit:
- Mark complete or incomplete.
- No emojis. No animations. No confetti.
- Completion triggers score recalculation immediately.

### 3️⃣ Identity Alignment Score

A 0–100 score calculated daily.

```
Daily Score = (Completed Habits / Total Habits) * 100
Identity Alignment = Weighted average of last 7 days
```

Displayed in large monospaced font:
- **Gold** if >= 75
- **White** if 50–74
- **Red** if < 50

This score is the emotional driver.

### 4️⃣ Identity Debt

Every missed non-negotiable:
- Adds debt.
- Debt persists.
- Must be overperformed to clear.

Red is used here sparingly. Debt should feel uncomfortable.

### 5️⃣ Weekly AI Reckoning

Every Sunday: trend analysis, alignment review, bottleneck identification, direct verdict.

**Example structure:**
```
Week Score: 68
Trend: -4%
Most Missed Habit: Deep Work
Bottleneck: Morning Execution
Verdict: Your identity claim is not currently supported by your data.
```

Short. Precise. No fluff.

---

## 7. AI Architecture

AI must feel **analytical**, not motivational.

### Context Injection

Before each AI call:
```json
{
  "identity_claims": "...",
  "7_day_average": 0,
  "30_day_trend": 0,
  "most_missed_habit": "...",
  "volatility_index": 0,
  "identity_alignment": 0
}
```

AI references numbers directly. Never generic advice.

---

## 8. Future Feature Roadmap (After MVP Validated)

Only build these after 30-day retention proves strong.

**Phase 2**
- Volatility Index
- Regret Projection
- Monthly Discipline Audit
- Share Cards

**Phase 3**
- Behavioral Pattern Detection
- Founder Mode integration
- Performance Timeline

Cut everything else until revenue exists.

---

## 9. Tech Stack (React Native Build Plan)

### Framework
- React Native + Expo
- Expo Router
- Zustand (state)
- Supabase (auth + DB)
- RevenueCat (subscriptions)

### Database Schema (Simplified)

```
users
  id
  email
  identity_statement
  tone_preference

habits
  id
  user_id
  name
  is_non_negotiable

completions
  id
  habit_id
  date
  completed (boolean)

scores
  id
  user_id
  date
  daily_score
  alignment_score
  identity_debt
```

---

## 10. UX Structure

### Home Screen
- Identity Alignment Score (top, gold)
- Identity Debt (if > 0, red)
- Today's Habits
- Quick Execution Log
- Minimal scrolling.

### Insights Screen
- 7-day trend
- Most missed habit
- Weekly AI verdict
- Data-first layout.

### Identity Screen
- Claimed Identity
- Non-negotiables
- Alignment percentage
- This screen should feel serious.

---

## 11. Monetization Strategy

**Free:**
- 3 habits
- Daily tracking
- Weekly summary (basic)

**Pro:**
- Unlimited habits
- Full AI audits
- Identity Debt engine
- Advanced analytics

**Price:** $8–$12/month. If it truly changes behavior, that price is justified.

---

## 12. What Makes It Stand Out

Not features. These 4 things:
1. Identity framing.
2. Emotional discomfort (controlled).
3. Data-driven AI.
4. Serious aesthetic.

If it feels like a motivational app → fail. If it feels like a gamified toy → fail. If it feels like a therapy journal → fail.

**It must feel like a performance system.**

---

## 13. The Transformation Goal

After 30 days, a user should:
- Increase completion consistency.
- Reduce volatility.
- Improve alignment score.
- Become aware of their bottleneck habit.

Measurable. Not vague.

---

## 14. Final Founder Advice

**Do not:**
- Overbuild.
- Add ego-features.
- Ship animations before retention.
- Chase visual complexity.

**Do:**
- Ship fast.
- Test retention.
- Refine scoring.
- Strengthen AI precision.

> Disciplex wins on psychological sharpness, not technical complexity.

---

# Part 2 — React Native Folder Structure & Scoring System

---

## Folder Structure (Expo + App Router)

Assuming: Expo SDK 51+, Expo Router, TypeScript, Zustand, Supabase.

```
disciplex/
│
├── app/                     # Expo Router screens
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Home (Dashboard)
│   │   ├── insights.tsx     # Trends + Weekly Review
│   │   ├── identity.tsx     # Identity + Alignment
│   │   └── settings.tsx
│   │
│   └── onboarding/
│       ├── index.tsx
│       ├── identity.tsx
│       └── habits.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── habit/
│   │   │   ├── HabitItem.tsx
│   │   │   ├── HabitList.tsx
│   │   │   └── HabitToggle.tsx
│   │   │
│   │   └── identity/
│   │       ├── IdentityMirror.tsx
│   │       └── AlignmentBadge.tsx
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useHabitStore.ts
│   │   ├── useScoreStore.ts
│   │   └── useIdentityStore.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── ai.ts
│   │   └── scoring.ts
│   │
│   ├── hooks/
│   │   ├── useDailyScore.ts
│   │   ├── useWeeklyTrend.ts
│   │   └── useAlignment.ts
│   │
│   ├── types/
│   │   ├── habit.ts
│   │   ├── user.ts
│   │   └── score.ts
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   └── tiers.ts
│   │
│   └── utils/
│       ├── date.ts
│       └── math.ts
│
├── assets/
│   ├── fonts/
│   └── icons/
│
├── theme/
│   └── colors.ts
│
├── app.config.ts
└── package.json
```

### Why This Structure Works

- `app/` = routing only (screens)
- `src/components/` = reusable UI blocks
- `store/` = state logic
- `lib/` = external logic (AI, scoring, backend)
- `hooks/` = derived calculations
- `constants/` = theme and tier logic
- `utils/` = pure helpers

### Theme File (Exact Implementation)

`theme/colors.ts`

```ts
export const colors = {
  base: '#0A0A0A',
  surface: '#111111',
  surface2: '#1A1A1A',
  border: '#2A2A2A',

  textPrimary: '#F5F5F5',
  textSecondary: '#888888',
  textMuted: '#3A3A3A',

  gold: '#C9A84C',
  goldDim: '#A07830',
  goldSubtle: 'rgba(201,168,76,0.10)',

  red: '#CC0000',
  redSubtle: 'rgba(204,0,0,0.10)',

  success: '#2A7A4B',
  warning: '#8A6A00',
}
```

Never hardcode hex values anywhere else.

---

## The Scoring System (Hard to Game)

### Step 1 — Daily Execution Score

```
DailyExecutionScore = (CompletedHabits / TotalHabits) * 100
```

### Step 2 — Non-Negotiable Weighting

Each habit has a weight:
- `weight = 1` (normal)
- `weight = 2` (non-negotiable)

```
TotalWeight = sum(all habit weights)
CompletedWeight = sum(weights of completed habits)
DailyExecutionScore = (CompletedWeight / TotalWeight) * 100
```

### Step 3 — Consistency Penalty (Anti-Spike Protection)

```
Volatility = StandardDeviation(last 7 daily scores)
ConsistencyPenalty = Volatility * 0.5
AdjustedScore = DailyExecutionScore - ConsistencyPenalty
```

Spiky behavior lowers score. Gaming is harder.

### Step 4 — Identity Alignment Score (7-Day Weighted Average)

```
IdentityAlignment =
  (Today * 0.4) +
  (Last 6 Days Average * 0.6)
```

Identity is pattern-based, not daily-based. Missing one day doesn't destroy identity. Repeated misses do.

### Step 5 — Identity Debt System

Every missed non-negotiable:
```
Debt += 10 points
```

Debt reduces alignment:
```
FinalAlignment = IdentityAlignment - (Debt * 0.3)
```

To clear debt: user must score > 85 for 2 consecutive days. Debt decays slowly.

### Step 6 — Anti-Backfill Rule (Critical)

Lock editing after 24 hours. Or reduce score weight if logged late:

```
If completion logged > 4 hours late:
  HabitWeight *= 0.7
```

Real-time execution matters.

### Step 7 — Bottleneck Detection (Smart Layer)

Weekly, find the habit where:
- `CompletionRate < 60%`
- AND on days completed, `overall score > 80%`

That's a structural bottleneck. AI references it directly.

### Why This System Is Strong

- Rewards consistency
- Penalizes volatility
- Weights non-negotiables
- Creates lasting cost
- Prevents lazy logging
- Encourages structural improvement

> Most habit apps use kindergarten math. If your scoring feels rigorous and meaningful, users respect it. If it feels arbitrary, they leave.
