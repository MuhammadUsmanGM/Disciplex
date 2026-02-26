# Disciplex — The AI Discipline Operating System
### Product Guide v2.0

---

## 1. What Disciplex Actually Is

Disciplex is not a habit tracker.

It is a behavioral measurement system that quantifies the gap between who you claim to be and what your actions prove you are.

It exists to solve one problem:

> "I know what I should do, but I don't execute consistently."

Disciplex measures **execution**, **alignment**, and **consistency** — not motivation.

The market is full of apps that make you feel good about trying. Disciplex makes you confront what you are actually doing. That discomfort is the product.

---

## 2. Product Positioning

**Primary Target User**
- Founders in early-stage build mode
- Developers and builders with self-imposed output standards
- Serious gym-discipline crowd (not fitness casuals)
- High-performance students (pre-med, law, competitive programs)
- Execution-focused professionals who've already failed with every other app

**Not:**
- Casual wellness users
- "Drink water reminder" audience
- Gamification lovers
- People who want to feel better without changing behavior

**Positioning Statement:**
> Disciplex is the only app that tells you the truth about who you are becoming.

This is a performance system. Not a coach. Not a journal. Not a cheerleader. A mirror.

---

## 3. Core Philosophy

- **Identity > Goals**
- **Consistency > Perfection**
- **Data > Feelings**
- **Accountability > Motivation**

Every feature must reinforce these. If it doesn't — cut it without discussion.

---

## 4. Visual Identity & Theme System

These colors are not aesthetic choices. They are psychological instruments.

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

**Gold — Premium Signal / Achievement**
```
--color-gold:         #C9A84C
--color-gold-dim:     #A07830
--color-gold-subtle:  rgba(201, 168, 76, 0.10)
```

**Red — Consequence Only / Debt / Failure**
```
--color-red:          #CC0000
--color-red-subtle:   rgba(204, 0, 0, 0.10)
```

**Status**
```
--color-success:      #2A7A4B
--color-warning:      #8A6A00
```

### Color Rules

- Base background is **ALWAYS** `#0A0A0A` — no exceptions
- **Gold** = Achievement, high alignment, earned state
- **Red** = Failure, debt, risk, consequence — never decorative
- **White** = Core data, primary numbers
- **Grey** = Secondary information, metadata
- No gradients. No playful colors. No unnecessary decoration.

> Restraint = premium. The moment the UI starts celebrating mediocrity, the product dies.

### Typography Rules

- Score displays: monospaced font only (JetBrains Mono or equivalent)
- Body text: system font (SF Pro / Roboto)
- No rounded corners on score elements
- No drop shadows
- No glassmorphism

---

## 5. The Core Product Loop

This is the engine. If it is weak, the app fails.

1. User declares identity.
2. User defines non-negotiable behaviors.
3. User logs daily execution.
4. App calculates Identity Alignment Score.
5. App exposes the gap.
6. Every Sunday: AI Reckoning delivers a cold verdict.
7. User confronts the data and corrects.
8. Repeat.

**The Sunday Reckoning is not a feature. It is the product.** Everything else exists to feed data into that moment.

---

## 6. MVP Feature Set (V1)

Keep this tight. Ship nothing that does not directly support the loop.

### Feature 1 — Identity Setup (Onboarding)

User defines:
- **Who I Am** — a single identity statement (e.g., "I am someone who executes before I consume.")
- **3 Non-Negotiable Daily Behaviors** — the habits that define this identity
- **Who I Refuse to Be** — the counteridentity (psychological anchoring, not fluff)

These are stored as `identity_claims`. The AI references them by name in every Reckoning.

Onboarding must feel serious. No progress bars with encouraging copy. No "Great job setting up!" messages. Just the form, and the weight of the commitment.

### Feature 2 — Daily Execution Log

- Mark each habit complete or incomplete
- No emojis. No animations. No confetti. No streaks counter.
- Completion triggers immediate score recalculation
- Late logging (>4 hours) reduces habit weight automatically — logged silently, no excuse prompt

### Feature 3 — Identity Alignment Score

A 0–100 score calculated from the full scoring engine (see Section 8).

Displayed in large monospaced font at the top of the home screen:
- **Gold** if ≥ 75
- **White** if 50–74
- **Red** if < 50

This number is the emotional core of the product. It must feel earned and real.

### Feature 4 — Identity Debt

Every missed non-negotiable adds debt. Debt persists until cleared through overperformance. Debt reduces the Alignment Score directly.

Red appears here. Sparingly. It should feel uncomfortable, not alarming. The goal is honesty, not punishment theater.

### Feature 5 — The Weekly AI Reckoning *(Primary Revenue Driver)*

Every Sunday, the AI delivers a cold, data-driven verdict based on the full week's behavioral data.

**Format:**
```
WEEKLY RECKONING — [Date]

Week Score:        68
Trend:             -4% vs last week
Identity Claim:    "I am someone who executes before I consume."
Most Missed:       Deep Work (2/7 days)
Bottleneck:        Morning window. You execute well when you start — you rarely start.
Debt:              30 points

Verdict:
Your data does not support your identity claim this week.
You completed surface habits reliably. You avoided the one that costs you something.
That pattern is not discipline. It is the appearance of discipline.

Next week's single focus: log Deep Work before 10am, regardless of outcome.
```

**Rules for the AI Reckoning:**
- No generic encouragement
- Must reference actual user data — habit names, specific scores, specific patterns
- One concrete, single-sentence directive at the end
- Never longer than 250 words
- Delivered Sunday at a time the user sets during onboarding

This is gated behind Pro. Free users see a basic weekly summary (score, trend, most missed habit — no AI verdict, no bottleneck analysis, no directive).

### Feature 6 — Identity Share Card *(V1, Not Phase 2)*

After each Reckoning, user can generate a share card. This is not optional or decorative — it is the distribution engine.

**Card contents:**
- Score (large, monospaced, color-coded)
- Alignment state label ("Aligned" / "Drifting" / "Identity Gap")
- Verdict excerpt (one line, the most confrontational sentence)
- Disciplex wordmark

Cards are intentionally stark. Black background. No branding overload. The score is the story.

**Why this must be in V1:** A founder with 10k followers posting "68 — Identity claim not supported by data" is worth more than any paid acquisition campaign. This is the distribution lever. Ship it.

---

## 7. Monetization Strategy

**Free Tier:**
- Up to 3 habits
- Daily execution logging
- Identity Alignment Score (full scoring engine)
- Basic weekly summary (no AI, no bottleneck, no verdict)
- Identity Share Cards (capped at 1/month)

**Pro Tier — $9.99/month or $79.99/year:**
- Unlimited habits
- Full Weekly AI Reckoning (verdict + bottleneck + directive)
- Identity Debt engine
- Advanced trend analytics (30-day, volatility index)
- Unlimited Share Cards
- Reckoning archive (full history)

**Conversion Gate Logic:**
The free tier shows the Identity Alignment Score in full. Users feel the number. Users want to understand *why* the number is what it is. The AI Reckoning answers that question. That is the paywall. Not habit count — clarity.

**Pricing Rationale:**
$9.99/month is below the threshold of deliberation for this user. If Disciplex genuinely changes behavior, that is less than one skipped meal. Price it confidently. Do not go lower than $7.99.

---

## 8. AI Architecture

The AI must feel **analytical**, not motivational. Cold. Precise. Referential. A mirror with a verdict, not a coach with encouragement.

### System Prompt (Core)

```
You are Disciplex, a behavioral analysis system. You deliver weekly performance verdicts based strictly on user data.

Rules:
- Reference the user's identity claim verbatim
- Reference specific habit names and completion rates
- Never use generic motivational language
- Never say "great job," "keep it up," or any variant
- Identify the structural bottleneck, not surface symptoms
- End with exactly one directive: a single, specific behavioral instruction for next week
- Maximum 250 words
- Tone: analytical, direct, honest. Not harsh for its own sake. Just accurate.
```

### Context Payload (Injected Before Every Reckoning)

```json
{
  "identity_claim": "I am someone who executes before I consume.",
  "refuse_to_be": "Someone who plans but never ships.",
  "week_score": 68,
  "week_trend": -4,
  "30_day_trend": -2,
  "volatility_index": 14.3,
  "identity_alignment": 61,
  "identity_debt": 30,
  "habits": [
    { "name": "Deep Work", "completion_rate": 0.28, "is_non_negotiable": true },
    { "name": "No phone before 10am", "completion_rate": 0.71, "is_non_negotiable": false },
    { "name": "Ship one thing", "completion_rate": 0.57, "is_non_negotiable": true }
  ],
  "bottleneck_habit": "Deep Work",
  "bottleneck_pattern": "On days Deep Work is completed, overall score is 91. Completion rate: 28%."
}
```

AI references these numbers directly. No hallucinated observations. No generic patterns. Pure data-to-language translation.

### AI Tone Calibration

The AI should feel like a performance analyst reading a report — not a mentor, not a therapist, not a friend. If the output reads like something a life coach would say, rewrite the prompt until it doesn't.

---

## 9. Retention Strategy — The Problem You Must Solve

The graveyard of habit apps is full of products with great Day 1. The crisis is Day 4 — when the user breaks their first streak. Most apps respond with encouragement. That is the wrong answer for this user.

**The Disciplex Day 4 Protocol:**

When a user misses a non-negotiable for the first time:
- No push notification saying "Don't break the chain!"
- Silent debt accumulation — the score drops, the red appears
- At the next app open: score displayed with the debt line visible
- No modal. No pop-up. Just the data.

The silence is the message. The score is the consequence.

**Day 7 Retention Mechanism:**

If a user completes at least 1 habit 7 days in a row (even with low scores), they receive a single, quiet notification:

> "7 days of data. Your Reckoning is building."

That's it. No streak celebration. No badge. Just a statement of fact that something is accumulating — and the Reckoning will use it.

**The Sunday Hook:**

The Reckoning notification is the highest-value push in the app. It should arrive at a consistent time the user chose. The notification copy is never generic:

> "Your Week 3 Reckoning is ready. Score: 68."

That number in the notification is the open rate driver. Curiosity plus mild dread = near-universal open.

---

## 10. UX Structure

### Home Screen
- Identity Alignment Score — top center, large, monospaced, color-coded
- Identity Debt — directly below score, red, only visible if debt > 0
- Today's Habits — listed below, simple toggle
- Quick log area — minimal friction, one tap per habit
- No scrolling required for core action

### Insights Screen
- 7-day execution chart (bar, minimal, no color except gold/red for threshold)
- 30-day trend line
- Most missed habit (highlighted)
- Bottleneck detection result
- Weekly AI Reckoning (Pro) or basic summary (Free)

### Identity Screen
- Identity Claim (displayed large)
- Who I Refuse To Be (displayed below, dimmer)
- Non-negotiables list
- Current Alignment % against claim
- This screen must feel like reading a contract, not a vision board

### Settings Screen
- Reckoning delivery time
- Tone preference (Analytical / Brutal — no soft option)
- Data export
- Subscription management

---

## 11. Folder Structure (Expo + App Router)

Assuming: Expo SDK 51+, Expo Router, TypeScript, Zustand, Supabase.

```
disciplex/
│
├── app/                         # Expo Router — routing only
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home (Dashboard)
│   │   ├── insights.tsx         # Trends + Weekly Reckoning
│   │   ├── identity.tsx         # Identity + Alignment
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
│   │   │   ├── ScoreDisplay.tsx       # The hero component
│   │   │   ├── DebtIndicator.tsx      # Red debt line
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── habit/
│   │   │   ├── HabitItem.tsx
│   │   │   ├── HabitList.tsx
│   │   │   └── HabitToggle.tsx
│   │   │
│   │   ├── identity/
│   │   │   ├── IdentityMirror.tsx
│   │   │   └── AlignmentBadge.tsx
│   │   │
│   │   └── reckoning/
│   │       ├── ReckoningCard.tsx      # Sunday AI verdict display
│   │       ├── ShareCard.tsx          # Export/share component
│   │       └── ReckoningHistory.tsx
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useHabitStore.ts
│   │   ├── useScoreStore.ts
│   │   └── useIdentityStore.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── ai.ts                      # AI Reckoning calls
│   │   ├── scoring.ts                 # Full scoring engine
│   │   ├── notifications.ts           # Push + Reckoning scheduling
│   │   └── shareCard.ts               # Card generation logic
│   │
│   ├── hooks/
│   │   ├── useDailyScore.ts
│   │   ├── useWeeklyTrend.ts
│   │   ├── useAlignment.ts
│   │   ├── useBottleneck.ts           # Bottleneck detection hook
│   │   └── useReckoning.ts            # Reckoning state + trigger
│   │
│   ├── types/
│   │   ├── habit.ts
│   │   ├── user.ts
│   │   ├── score.ts
│   │   └── reckoning.ts
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
│   │   └── JetBrainsMono/            # Monospaced for score display
│   └── icons/
│
├── theme/
│   └── colors.ts
│
├── app.config.ts
└── package.json
```

---

## 12. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo SDK 51+ | Cross-platform, fast iteration |
| Navigation | Expo Router | File-based, clean |
| State | Zustand | Lightweight, no boilerplate |
| Backend / Auth | Supabase | Fast to ship, RLS built-in |
| Subscriptions | RevenueCat | Industry standard, handles edge cases |
| AI | Claude API (claude-haiku-3 for cost) | Fast, cheap, high quality for structured output |
| Push Notifications | Expo Notifications | Native, works with Supabase Edge Functions for scheduling |
| Share Cards | React Native View Shot | Screenshot component to image |

### Database Schema

```sql
users
  id              uuid PRIMARY KEY
  email           text
  identity_claim  text
  refuse_to_be    text
  tone_preference text DEFAULT 'analytical'
  reckoning_time  time DEFAULT '20:00'
  created_at      timestamp

habits
  id                  uuid PRIMARY KEY
  user_id             uuid REFERENCES users
  name                text
  is_non_negotiable   boolean DEFAULT false
  weight              int DEFAULT 1
  created_at          timestamp

completions
  id          uuid PRIMARY KEY
  habit_id    uuid REFERENCES habits
  date        date
  completed   boolean
  logged_at   timestamp
  late_logged boolean DEFAULT false

scores
  id                uuid PRIMARY KEY
  user_id           uuid REFERENCES users
  date              date
  daily_score       float
  adjusted_score    float
  alignment_score   float
  identity_debt     float
  volatility        float

reckonings
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users
  week_start      date
  week_score      float
  trend           float
  bottleneck      text
  verdict         text
  directive       text
  generated_at    timestamp
```

---

## 13. The Scoring System

### Step 1 — Raw Daily Execution Score

```
RawScore = (CompletedHabits / TotalHabits) * 100
```

### Step 2 — Non-Negotiable Weighting

Non-negotiables carry double weight. Missing one costs more than missing a normal habit.

```
TotalWeight     = sum(all habit weights)
CompletedWeight = sum(weights of completed habits)
WeightedScore   = (CompletedWeight / TotalWeight) * 100
```

### Step 3 — Late Log Penalty

```
If completion logged > 4 hours after end of habit window:
  HabitWeight *= 0.7
```

Real-time execution is the point. Backdating weakens the signal and the score reflects that.

### Step 4 — Consistency Penalty (Anti-Spike Protection)

A user who scores 0, 100, 0, 100 has the same average as someone who scores 50 every day. They are not the same. Volatility is punished.

```
Volatility        = StandardDeviation(last 7 daily scores)
ConsistencyPenalty = Volatility * 0.5
AdjustedScore     = WeightedScore - ConsistencyPenalty
```

### Step 5 — Identity Alignment Score (7-Day Weighted Average)

Identity is a pattern, not a day. Missing once doesn't destroy it. Repeating failure does.

```
IdentityAlignment = (Today * 0.4) + (Last 6 Days Average * 0.6)
```

### Step 6 — Identity Debt

Each missed non-negotiable:
```
Debt += 10 points
```

Debt reduces alignment:
```
FinalAlignment = IdentityAlignment - (Debt * 0.3)
```

To clear debt: score > 85 for 2 consecutive days. Debt decays at 5 points/day of high performance.

### Step 7 — Volatility Index (Displayed in Insights)

```
VolatilityIndex = StandardDeviation(last 30 daily scores)
```

- Below 10: Consistent executor
- 10–20: Unstable pattern
- Above 20: No reliable identity established

The AI uses this number in the Reckoning. A falling volatility index over 30 days is the core product outcome.

### Step 8 — Bottleneck Detection

Weekly, find the habit where:
```
CompletionRate < 60%
AND
On days it IS completed, overall score > 80%
```

This is a structural bottleneck — not a motivation problem, not a priority problem. A scheduling or friction problem. The AI names it directly.

### Why This System Works

Most habit apps use raw completion rates. Disciplex uses a system that:
- Rewards consistency over spikes
- Weights the habits that actually define identity
- Creates lasting cost for missed non-negotiables
- Prevents gaming through late logging
- Surfaces the real problem (bottleneck) rather than the surface symptom (low score)

If the score feels arbitrary, users leave. If the score feels rigorous and true, users trust it — and trust drives retention.

---

## 14. Distribution Strategy

This does not ship without a distribution plan. Building without one is how good products die quietly.

**Phase 1 — Pre-Launch (2 weeks before ship)**

Post the concept on X/Twitter. Not a product announcement. A philosophical post:

> "Most habit apps make you feel good about trying. I'm building one that tells you the truth. Here's the scoring system..."

Then explain the Identity Alignment Score, the Reckoning, the debt system. Thread format. No link. Pure signal.

Target: r/Entrepreneur, r/selfimprovement, r/productivity — but not as promotion. As a document of how you're thinking about the problem. Let the community react.

**Phase 2 — Launch**

Product Hunt launch. The description must lead with the identity framing, not the feature list. The tagline is everything:

> "The app that tells you who you're actually becoming."

First 50 users get lifetime Pro at $0. They become the testimonial engine.

**Phase 3 — Flywheel**

Share Cards. Every time a user posts their Reckoning score on X with the Disciplex card, it is organic acquisition. The card must be stark enough to stop a scroll. One number. One verdict line. Black background. Done.

---

## 15. What Makes It Stand Out

Not features. Four things:

1. **Identity framing** — not habits, not goals, but the person you are proving yourself to be
2. **Emotional discomfort** — controlled, honest, never gratuitous
3. **Data-driven AI** — not encouragement, not coaching, a verdict
4. **Serious aesthetic** — the visual language signals that this is not a toy

**The competitive moat is psychological, not technical.**

Any developer can copy the scoring system. No one can easily copy the philosophy — and the philosophy is what retains users who actually need this.

If it feels like a motivational app → wrong product. If it feels like a gamified toy → wrong product. If it feels like a therapy journal → wrong product.

It must feel like standing in front of a judge who has read all your case files.

---

## 16. The Transformation Goal

After 30 days, a Disciplex user should be able to observe:
- Measurably higher completion consistency week-over-week
- Lower volatility index (more predictable execution)
- Improved alignment score
- Named bottleneck habit — and a behavioral change around it

These are observable. Not vague. Not "feel more confident." Measurable behavioral shifts that the data can confirm.

If users hit these outcomes, they stay. If they stay, they refer. If they refer, the product grows without paid acquisition.

---

## 17. Build Order (Execution Priority)

Ship in this order. Do not deviate.

**Week 1–2:**
- Onboarding (identity setup)
- Habit logging
- Scoring engine (all 8 steps)
- Home screen with score display

**Week 3:**
- Insights screen (7-day chart, trend)
- Identity screen
- Supabase auth + DB integration

**Week 4:**
- AI Reckoning (Sunday delivery)
- Push notifications
- RevenueCat paywall

**Week 5:**
- Share Cards
- TestFlight / internal beta
- Fix everything broken

**Week 6:**
- App Store submission
- Product Hunt preparation
- Distribution content drafting

**Do not build Phase 2 features until you have 30-day retention data from real users. Not from friends. Real users who paid.**

---

## 18. Final Rules

**Do not:**
- Overbuild before you have retention proof
- Add animations before you have revenue
- Ship encouragement copy anywhere in the product
- Build for users who want to feel good. Build for users who want to be different.

**Do:**
- Ship the Reckoning first — if users don't come back for it, nothing else matters
- Treat the scoring engine as sacred — never simplify it to ship faster
- Measure Day 1, Day 7, Day 30 retention before anything else
- Make the share card embarrassingly simple

> Disciplex wins on psychological sharpness, not technical complexity.
> The score is the product. The Reckoning is the revenue. The identity is the retention.
