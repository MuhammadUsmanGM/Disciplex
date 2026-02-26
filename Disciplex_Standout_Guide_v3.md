# Disciplex — The Guide to Building Something Nobody Has Built Before
### A React Native App That Makes Every Other Habit App Look Like a To-Do List

---

## The Brand: Theme Colors & Visual Identity

Before a single screen is designed, every team member — developer, designer, or founder — needs to have the color system memorized. Every decision flows from it.

### The Philosophy Behind the Palette

Most apps pick colors because they look good. Disciplex picks colors because they *mean* something. Every color in the system earns its place or it does not exist.

**The rule:** If you're ever unsure whether to add color somewhere, the answer is no. Restraint is the brand.

---

### The Color System

```
DISCIPLEX — OFFICIAL COLOR TOKENS

Base Layer
──────────────────────────────────────────
--color-base:        #0A0A0A   (app background — not pure black, has depth)
--color-surface:     #111111   (cards, panels, bottom sheets)
--color-surface-2:   #1A1A1A   (elevated surfaces, modals, overlays)
--color-border:      #2A2A2A   (dividers, input borders, separators)

Text
──────────────────────────────────────────
--color-text-primary:    #F5F5F5   (headlines, primary body — never pure white)
--color-text-secondary:  #888888   (supporting text, labels, metadata)
--color-text-muted:      #3A3A3A   (placeholders, disabled states, taglines)

Gold — The Premium Signal
──────────────────────────────────────────
--color-gold:         #C9A84C   (primary accent — CTAs, scores, tier badges, the X in the logo)
--color-gold-dim:     #A07830   (pressed states, secondary gold elements)
--color-gold-subtle:  #C9A84C1A (gold at 10% opacity — backgrounds, hover fills)

Red — Consequence Only
──────────────────────────────────────────
--color-red:          #CC0000   (missed habits, identity debt, warnings, failure states)
--color-red-subtle:   #CC00001A (red at 10% opacity — missed habit row backgrounds)

Status Colors (used sparingly, data contexts only)
──────────────────────────────────────────
--color-success:      #2A7A4B   (dark muted green — completed habits, positive trends)
--color-warning:      #8A6A00   (dark muted amber — at-risk habits, declining trends)
```

---

### How Each Color Is Used — The Rules

**`#0A0A0A` Base Black** is used on every screen background without exception. There is no white background anywhere in the app. White backgrounds are for note-taking apps. This is a performance system.

**`#C9A84C` Gold** is the only color that signals achievement, value, and premium. It appears on: the Discipline Score number, tier badges, the weekly report verdict, Elite Mode elements, milestone cards, CTAs ("Start 90-Day Program"), and the X in the logo wordmark. When a user sees gold, they know it matters.

**`#CC0000` Red** appears *only* when something has gone wrong or is at risk. Missed habit rows, the Identity Debt counter, the Regret Projection screen, the consequence trigger warning. Red is never decorative. When red appears, the user should feel it. This only works if red is never used casually anywhere else.

**`#F5F5F5` Off-White** is the default for all text. Never use pure `#FFFFFF` — it creates harsh contrast that reads as cheap rather than premium. Off-white on near-black reads as considered and refined.

**`#888888` Secondary Grey** carries supporting information — dates, labels, secondary stats. It should never compete with gold or white for attention.

---

### The Color Hierarchy in Practice

Every screen should follow this visual weight order:

```
1. Gold     → Where the user should look first (score, key data, CTA)
2. White    → What the user reads (content, labels, habit names)
3. Grey     → Supporting context (dates, metadata, secondary stats)
4. Red      → What the user must address (only when something is wrong)
5. Black    → Everything else (background, structure, space)
```

If a screen has both gold and red on it at the same time, red wins psychologically. Use this intentionally — the Consequence Engine screens, the Identity Debt counter, and the Regret Projection should feel alarming precisely because red is rare everywhere else.

---

### Color in Each Key Feature

**Home Dashboard:** Gold score ring on black. White habit names. Red on any missed habit rows. No other colors.

**Identity Mirror:** Left panel (claimed identity) in white. Right panel (behavioral reality) in gold if aligned, red if diverging. The gap between the two panels is the entire emotional experience.

**Behavioral DNA Genome:** Each discipline strand uses a muted tint of gold for strong base pairs, fading toward grey for weak ones. Never use rainbow colors — the genome should look like data, not a children's toy.

**Behavior Clock:** Gold segments for peak performance windows. Grey for low-activity windows. Red for the hours where habits consistently go uncompleted.

**Consequence Engine screens:** Red-dominant. The base surface shifts from `#111111` to `#1A0000` (near-black with a faint red tint) when consequences are active. This is the only time the base surface changes color. It is meant to feel different.

**Weekly Report Share Cards:** Black background, gold Discipline Score, white verdict text, gold tier badge. Nothing else. These cards should look like data visualizations, not marketing material.

**Tier Badges:**

```
Tier 1 — Undisciplined:    #3A3A3A  (muted grey — no reward)
Tier 2 — Building:         #555555  (medium grey)
Tier 3 — Consistent:       #777777  (light grey)
Tier 4 — Disciplined:      #C9A84C  (gold begins here — first real achievement)
Tier 5 — High-Performer:   #D4B86A  (brighter gold)
Tier 6 — Elite:            #E8D48A  (near-platinum gold — the top)
```

Tiers 1–3 are deliberately unglamorous. Grey badges do not feel good to hold. This is intentional. Gold should feel earned because grey felt like nothing.

---

### Typography Pairing (Completes the Premium System)

Color alone doesn't make premium. Typography makes color work.

```
Display / Headlines:   Bebas Neue or Monument Extended  (heavy, condensed, commanding)
Body / UI:             DM Sans or Syne                  (clean, modern, readable)
Numbers / Scores:      DM Mono or IBM Plex Mono         (monospaced — data feels precise)
Taglines / Labels:     DM Sans Light, tracked +4        (understated, refined)
```

The monospaced font for scores and numbers is a critical detail. When a Discipline Score reads in `DM Mono`, it looks like a system readout, not a game score. That distinction is the difference between premium and playful.

---

### React Native Implementation

```javascript
// theme/colors.ts — import this everywhere, never hardcode hex values

export const colors = {
  // Base
  base: '#0A0A0A',
  surface: '#111111',
  surface2: '#1A1A1A',
  border: '#2A2A2A',

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#888888',
  textMuted: '#3A3A3A',

  // Gold — achievement and premium
  gold: '#C9A84C',
  goldDim: '#A07830',
  goldSubtle: 'rgba(201, 168, 76, 0.10)',

  // Red — consequence only
  red: '#CC0000',
  redSubtle: 'rgba(204, 0, 0, 0.10)',
  consequenceSurface: '#1A0000',

  // Status
  success: '#2A7A4B',
  warning: '#8A6A00',

  // Tier badges
  tiers: {
    undisciplined: '#3A3A3A',
    building: '#555555',
    consistent: '#777777',
    disciplined: '#C9A84C',
    highPerformer: '#D4B86A',
    elite: '#E8D48A',
  }
}
```

Import `colors` from this single file in every component. Never write a hex value directly in a stylesheet. This keeps the entire visual system changeable from one place and makes dark/light theming trivial to add later.

---

## The Real Problem With Every Habit App That Exists

Streaks. Check boxes. Confetti animations. Congratulations for drinking water.

Every habit app — Habitica, Streaks, Finch, Done, Fabulous — is fundamentally a to-do list with a streak counter. They are built around one broken assumption: that the problem is *forgetting* your habits. The real problem is not forgetting. The real problem is **not caring enough in the moment to do it.**

Disciplex is not a reminder app. It is a mirror. It shows you exactly who you are based on what you actually do — not what you intended to do.

That is the product. Everything in this guide builds toward that single idea.

---

## The 3 Things That Make an App Impossible to Ignore

Before any feature, understand these three principles. If a feature doesn't serve at least one of them, cut it.

**1. It knows you better than you know yourself.**
The AI shouldn't feel like a chatbot. It should feel like it's been watching you for months and has things to say that make you slightly uncomfortable because they're true.

**2. It costs you something to quit.**
Apps you can abandon without consequence get abandoned. Disciplex needs to create genuine psychological stakes — not fake ones like losing a streak, but real ones like watching your identity score decay, your future self visualization degrade, and your public commitments become visible failures.

**3. The output is shareable and makes you look serious.**
Not cringe. Not gamified badges. The output should look like something a high-performer would actually post — clean, data-driven, and with an edge. Something that says *I'm building something* not *I used an app today.*

---

## Feature 1 — The Identity Mirror (Not Onboarding — A Reckoning)

Most apps ask you to set goals. Disciplex does something more uncomfortable: it forces you to confront the gap between who you say you are and who your behavior proves you are.

**How it works:**

During setup, the user makes three declarations:

- **Who I am:** "I am a disciplined founder who executes every day."
- **What I do without exception:** Three non-negotiable daily behaviors (e.g. train, build, read).
- **What I refuse to be:** One statement about who they are not. "I am not someone who wastes mornings."

These aren't stored as goals. They're stored as **identity claims.** Every single day, the app measures actual behavior against these claims and calculates an **Identity Alignment Score** — a brutally honest number representing how much your actions match your stated identity.

After 7 days, the app shows the user their Identity Mirror — a split screen. Left side: what they claimed to be. Right side: what their data proves they actually are. If they claimed to be a disciplined founder but missed deep work 4 out of 7 days, the mirror reflects that back without softening it.

This is not a feature you've seen anywhere. It's psychologically uncomfortable in a way that creates real behavior change.

**The "Who Are You Becoming?" Timeline:**
A hidden feature that activates at Day 30. The AI generates a written character study of the user based purely on their behavioral data — no interpretation from them, just pattern recognition. It reads like a profile written by someone who's been silently observing them. This is deeply personal, private, and the kind of thing users will screenshot and share because it feels like being *seen*.

**React Native implementation:**
- Setup: multi-step animated flow with `react-native-reanimated` page transitions
- Identity Mirror: side-by-side layout built with custom SVG identity icons
- Character study: generated via AI with full behavioral context injected into prompt
- Store identity claims in Supabase, compare against daily completion data with a scoring function

---

## Feature 2 — Behavioral DNA: The Anti-Dashboard

Forget score rings and streak counters. Those are surface metrics. Disciplex builds a **Behavioral DNA profile** — a living visual map of who the user actually is based on pure behavioral data.

**What it shows:**

**The Discipline Genome** — A custom visualization (built with react-native-svg) that looks like a DNA strand. Each "base pair" represents a different behavioral dimension: physical output, mental input, creative output, financial behavior, recovery. As data accumulates, the strand grows and each base pair fills in with color and density based on consistency. A user who trains every day but never reads has a visually unbalanced genome — thick on one side, thin on the other. The visual makes imbalance impossible to ignore.

**The Behavior Clock** — A circular 24-hour visualization showing when the user actually completes their habits vs when they planned to. Over time it reveals behavioral patterns they've never consciously noticed — e.g. "You complete 80% of your habits between 6am and 9am. After noon your completion rate drops to 22%. Your productive window is 3 hours." This insight is worth more than any motivational coach.

**The Volatility Index** — Not a streak counter, but a consistency quality score. It measures not just whether you completed habits but how *reliably* you completed them. A user who hits 7/10 habits every single day scores higher on the Volatility Index than a user who hits 10/10 one day and 2/10 the next. Consistency of output beats occasional perfection. This reframe alone is a feature most productivity tools have never considered.

**React Native implementation:**
- Genome visualization: custom SVG built with `react-native-svg` — invest time here, this is the visual centerpiece
- Behavior Clock: radial chart rendered in SVG with time-segmented data
- Volatility Index: calculated as standard deviation of daily scores, inverted and normalized to 0–100
- All visualizations should update in real time as habits are logged

---

## Feature 3 — The Consequence Engine (No App Has This)

Here is the feature that will make Disciplex talked about. Not just accountability. Not just streaks. Actual *consequences* for inaction.

Most apps remove friction from quitting. Disciplex adds it — but intelligently, and always with user consent.

**Consequence Types (user selects at setup, can change anytime):**

**The Public Commitment** — The user writes a commitment statement and selects a consequence: "If I miss my training habit 3 days in a row, Disciplex will post to my connected X account: 'I broke my training commitment. Day 1 reset.' " This is opt-in and the user writes the post themselves in advance. The knowledge that this post exists and is ready to fire is often enough to prevent the miss. When it does fire, it generates enormous engagement — real accountability made public.

**The Lockout** — If a user misses a defined critical habit (one they've flagged as non-negotiable), the app locks a feature they value until they complete a 5-minute AI accountability session. Not punitive — contractual. They agreed to this. The locked feature could be the Performance Hub, the weekly report, or even just the app's home animations going grey and stark until the debt is paid.

**The Identity Debt Counter** — Every missed non-negotiable adds to a visible Identity Debt score shown permanently on the home screen. It doesn't reset easily — the user has to complete double their usual output the next day to start clearing it. This creates a real cost for avoidance that accumulates visibly.

**The Regret Projection** — When a user opens the app after missing a day, before they can log anything, they see a single screen: a projection of where their consistency score will be in 30 days if they continue at the current rate. Not a lecture — just a number and a date. "At your current pace, your Discipline Score will be 41 in 30 days." Then it lets them in.

**What makes this different from every other app:**
Every other accountability feature is toothless because there's no real cost. Disciplex makes consequences real, consensual, and visible. Users who opt into the Consequence Engine are self-selecting as serious — and serious users retain, subscribe, and refer.

**React Native implementation:**
- X posting: OAuth connection via `expo-auth-session`, post queued and held until trigger condition is met
- Lockout: gated navigation using a context-level permission check before rendering locked screens
- Identity Debt: persistent value stored in Supabase, calculated as weighted sum of missed non-negotiables
- Regret Projection: linear regression on last 14 days of score data, projected forward 30 days

---

## Feature 4 — The AI Coach That Evolves (Not a Chatbot)

The AI in every competitor app is a chatbot — you ask it something, it answers. Disciplex's AI is the opposite. It watches, it learns, and it speaks when it has something worth saying.

**The Coach Voice System:**

The AI never just responds to prompts. It proactively speaks at defined moments:

- **The Morning Briefing (6am):** A 3-sentence message based on yesterday's performance and today's schedule. Specific, data-referenced, and never generic. "You completed 8/10 habits yesterday. Your deep work block was your only miss two days running. Today it's scheduled for 10am — treat it as non-negotiable."

- **The Midday Check (12pm, if morning habits incomplete):** A single push notification that is not a reminder — it's an observation. "It's noon. Your morning block is unfinished. You have 12 hours left. Use them."

- **The Pattern Interrupt:** Once per week, the AI surfaces a behavioral insight the user has never explicitly asked for. "You've missed your reading habit every Sunday for 4 weeks. Sunday is your weak day. Either protect it or stop pretending it's a habit."

- **The Monthly Reckoning:** A full AI-written behavioral audit. Not a summary — an audit. It reads like a performance review written by a coach who respects you enough to tell you the truth. This is long-form, specific, and private. It covers trends, inflection points, the moments things got better or worse, and a direct assessment of whether the user's behavior matches their stated identity. No app currently does this.

**Memory Architecture:**
The AI maintains a rolling behavioral context window — the last 90 days of habit data, reflection entries, score trends, and identity claims are all passed into every AI call. This is what makes it feel like it *knows* you. It's not magic — it's context engineering. But the experience is unlike anything in the market.

**Tone Profiles (user selects):**
- **Hard Coach** — Blunt, data-driven, no softening. "You missed again. That's 4 times this month. Stop."
- **Strategic Advisor** — Analytical, pattern-focused. "Your data suggests Sunday is a structural problem, not a motivation problem. Let's fix the system."
- **Stoic** — Minimalist, philosophical. "The obstacle is in the data. You already know what needs to change."

These aren't just personality skins — they change the entire prompt architecture and response structure.

**React Native implementation:**
- Proactive notifications: `expo-notifications` with scheduled triggers based on user behavior data
- Context injection: build a `buildAIContext(userId)` function that assembles the full behavioral snapshot and prepends it to every AI call
- Tone profiles: system prompt templates stored per user preference, selected at onboarding and changeable in settings
- Pattern Interrupt: run a weekly cron job (Supabase Edge Function) that identifies the user's weakest recurring pattern and queues the insight for delivery

---

## Feature 5 — The Future Self Engine (Visualization That Actually Motivates)

Motivation from discipline comes from being able to see where consistent behavior leads. Most apps show you a streak number. Disciplex shows you a picture of who you're becoming — literally.

**The 30/90/365 Projection:**

Based on current behavioral trends, the AI generates three written portraits of the user:

- **30 days at this pace:** "You will have completed approximately 240 workouts this year. Your deep work streak will be at 22 days. Your Discipline Score will be 74, up from 61."
- **90 days at this pace:** A full paragraph describing the compound effect of current habits. Specific. Quantified. Both the wins and the gaps.
- **365 days at this pace:** A written portrait of who this person will be in one year if they maintain current behavior. This is the emotionally powerful one. It describes their life, their output, their identity — as a direct consequence of what they're doing right now.

The inverse is equally powerful: "365 days at your pace last week" paints a very different picture.

**The Gap Visualizer:**
A side-by-side comparison of "Current You" vs "Goal You" based on the identity claims from onboarding. The gap between them is expressed not in abstract points but in concrete behaviors — "To reach your stated identity, you need 2 more deep work completions per week and 1 fewer missed morning routine per month." Specific. Actionable. Honest.

**React Native implementation:**
- Projections: generated by AI with quantitative behavioral data injected — calculate projected streaks, scores, and habit counts mathematically, pass them to AI for narrative generation
- Gap Visualizer: custom split-screen component with animated progress bars showing current vs target behavior frequency
- Update projections weekly on Sunday when weekly report generates

---

## Feature 6 — The War Log (Journaling That Doesn't Feel Like Journaling)

The self-improvement community journals. But nobody wants to open a blank text box. Disciplex replaces journaling with the War Log — a daily record that feels like a debrief, not a diary.

**The Debrief Protocol (under 3 minutes):**

Four questions, one sentence each, no more:

1. **What did I execute today?** (output, not feelings)
2. **What did I avoid?** (honest, no rationalizing)
3. **What is the one thing I must execute tomorrow?** (commitment, not intention)
4. **On a scale of 1–10, how much did today's version of me deserve the identity I'm claiming?**

That last question is the one that changes behavior. It forces a daily reckoning between identity and action.

**The War Log Feed:**
Unlike journaling apps where entries disappear into a list, the War Log shows entries as a scrollable feed where the AI has annotated each entry with a single observation. "Day 14 — You rated yourself 4/10 here. Your habit data shows 6/10. The gap between how you feel and what you did is worth examining." The AI annotation is generated once when the entry is submitted and never changes — it becomes a permanent record of what the AI saw in that moment.

**Pattern Surface:**
After 30 entries, the AI runs a pattern analysis across all War Log entries and surfaces recurring themes — words, phrases, and behavioral patterns that appear repeatedly. "You've used the word 'tired' as an explanation for avoidance 11 times. You've cited 'meetings' 7 times. Both are patterns, not events."

**React Native implementation:**
- Debrief Protocol: four-step card swipe flow with `react-native-reanimated` horizontal transitions
- AI annotation: generate on submission, store alongside the entry in Supabase
- Pattern surface: NLP keyword extraction via AI after every 10 new entries, display in a dedicated "Patterns" section of the War Log
- Feed: `@shopify/flash-list` with AI annotation displayed as a subtle footer on each entry card

---

## Feature 7 — Competitive Ghost Mode (Async Competition Without Social Media)

The self-improvement community is competitive. But leaderboards with strangers feel meaningless. Disciplex introduces Ghost Mode — competing against the most meaningful opponent possible: your past self.

**How Ghost Mode works:**

Your "Ghost" is your best 7-day performance window ever recorded. It has a score. It has a daily completion rate. It has a streak. Every week, you race against it. If you beat your Ghost, the app registers it with a stark, clean animation — no confetti, just a number going up. If you lose to your Ghost, the app registers that too. Your Ghost record is permanent and visible.

**Opt-in Ghost Challenges:**
Users can anonymously share their Ghost stats to a challenge pool. Other users can pick up a Ghost challenge — they see only the behavioral stats (not the identity or name) and race against them for 7 days. At the end, they see whether they won or lost. No social feed. No comments. Just a binary result and the knowledge that you beat (or lost to) someone real.

**The Legacy Score:**
A lifetime metric that accumulates across all time. It's not a streak — it can't be broken. It's a running total of all discipline executed, weighted by difficulty and consistency. The Legacy Score is the number you show people when they ask what Disciplex is. "I have a Legacy Score of 4,847." It means something because it can only go up, and it takes real work to move.

**React Native implementation:**
- Ghost calculation: query best 7-day window from historical data, store as a snapshot
- Anonymous challenge pool: Supabase realtime table — users post Ghost snapshots with a random ID, others can claim and track progress against them
- Legacy Score: server-side cumulative calculation, increment daily based on weighted habit completion
- Ghost race UI: week-by-week comparison bar chart, updated daily

---

## Feature 8 — The Discipline Audit (For Serious Users Only)

Once per month, serious users unlock the Discipline Audit — a structured self-assessment that goes beyond habit tracking and into behavioral root cause analysis.

**The Audit Structure:**

**Part 1 — The Lie Detector:**
The AI cross-references the user's self-reported reflections (how they said they felt, how they rated their days) against their actual behavioral data. It surfaces discrepancies. "On Day 12, you rated yourself 8/10 but only completed 4/10 habits. On Day 19, you rated yourself 5/10 but completed 9/10 habits. Your self-perception and your output are frequently misaligned — specifically when [AI identifies the pattern]."

**Part 2 — The Bottleneck Analysis:**
The AI identifies the single habit or behavioral pattern that, if fixed, would have the highest compound impact on the user's overall score. Not the habit they're worst at — the habit that acts as a structural blocker for other habits. "Your morning routine completion rate is 43%. On days you complete it, your full-day completion rate is 81%. On days you don't, it's 34%. Your morning routine is your bottleneck. Everything else is downstream from it."

**Part 3 — The Identity Gap Report:**
A written assessment of how closely the user's behavior matches their declared identity, with specific evidence. "You declared yourself someone who trains without exception. In the last 30 days, you trained 18/30 days. That is not 'without exception.' Either update the standard or update the behavior."

This audit is confrontational by design. Users who engage with it seriously show the highest retention and upgrade rates because they understand what the app is actually for.

**React Native implementation:**
- Trigger: available on the 1st of each month, gated behind Pro subscription
- Lie Detector: statistical comparison between self-rating data and completion data, fed to AI for narrative
- Bottleneck Analysis: correlation calculation between morning habit completion and overall daily completion rate, AI generates the specific framing
- Identity Gap Report: pull identity claims from onboarding, compare against 30-day completion data for each claim's associated habits, AI writes the assessment

---

## Feature 9 — The Share System (Built for Organic Growth)

This is how Disciplex spreads. Not ads. Not influencer deals. The output of the app itself is designed to be worth sharing.

**Share Card 1 — The Weekly Verdict:**
A clean, dark, full-bleed image. Shows the user's Discipline Score, tier, and a single sentence AI verdict. Designed for X and Instagram Stories. No app branding except a small wordmark — it shouldn't look like an ad, it should look like a data visualization. When someone sees this on their feed, they should wonder what it is before they notice the logo.

**Share Card 2 — The Identity Gap:**
A visual showing "Claimed Identity" vs "Behavioral Reality" as two stacked bars. The gap between them is visible. It's designed to be uncomfortable to look at and impossible to not share when the bars are close — because that means you're winning.

**Share Card 3 — The Character Study:**
At Day 30, the AI-generated character study can be shared as a formatted text card. It reads like something worth sharing because it's specific to the user and written like a real assessment, not a generated compliment.

**Share Card 4 — The Legacy Milestone:**
When a user crosses a Legacy Score milestone (1,000 / 5,000 / 10,000), a unique card generates that shows their legacy number and a single line about their journey. These are rare, they feel earned, and they look like achievements worth announcing.

**Technical implementation:**
- All share cards: JSX components rendered off-screen, captured with `react-native-view-shot`
- Design: dark background (#0A0A0A), white text, one accent color, minimal layout — the data is the design
- Export: full resolution PNG saved to camera roll or shared directly via share sheet
- Never auto-share — always require deliberate user action to share

---

## Feature 10 — Foundrly Bridge (The Ecosystem Play)

Designed now. Built later. The data architecture is laid in from day one.

**The Bridge concept:**

Users who have both Disciplex and Foundrly unlock a combined "Execution Profile" — a single score that synthesizes personal discipline data (Disciplex) with founder execution data (Foundrly). This is the score that actually predicts startup success, and Disciplex + Foundrly together are the only way to get it.

Within Disciplex, the Bridge adds:
- A "Build" discipline category that syncs with Foundrly task completion
- A "Founder Discipline Score" that measures whether their personal habits are supporting their startup execution (training, sleep, and deep work habits directly correlate with founder output)
- A shared weekly report that covers both personal discipline and startup execution in one document

**Why this matters for your portfolio:**
Two connected apps with a shared data layer and a combined score that neither can produce alone — that is a product ecosystem, not a side project. When you describe this to anyone, it immediately signals systems thinking, long-term vision, and product strategy. Those are the things that get you hired, funded, or taken seriously.

**Schema design (build this now):**
```
users table:
  id, email, created_at, identity_statement, tone_preference

habits table:
  id, user_id, name, category, frequency, proof_type, source (disciplex | foundrly)

completions table:
  id, habit_id, user_id, completed_at, proof_data, proof_type, score_contribution

reflections table:
  id, user_id, date, win, miss, commitment, self_score, ai_annotation

scores table:
  id, user_id, date, daily_score, volatility_index, identity_alignment, legacy_score

identity_claims table:
  id, user_id, who_i_am, non_negotiables[], who_i_refuse_to_be, created_at
```

This schema supports both apps from day one.

---

## The Tech Stack (Chosen for Speed and Scale)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React Native + Expo SDK 51 | OTA updates, faster dev cycle |
| Navigation | Expo Router v3 | File-based, typed routes |
| State | Zustand + React Query | Local state + server sync without Redux overhead |
| Backend | Supabase | Auth, DB, Edge Functions, Realtime — one platform |
| AI | Claude API (claude-sonnet-4-6) | Better nuanced coaching responses, less robotic than GPT |
| Animations | Reanimated 3 + Skia | Skia for the Genome/DNA visualizations, Reanimated for UI |
| Charts | Custom SVG via react-native-svg | Full control over Genome and Clock visualizations |
| Subscriptions | RevenueCat | Industry standard, handles iOS + Android |
| Notifications | Expo Notifications | Proactive AI briefings and consequence triggers |
| Share Cards | react-native-view-shot | Reliable, high-res capture |
| X Integration | expo-auth-session | OAuth for Public Commitment feature |
| Fonts | expo-font + Google Fonts | Bebas Neue (display), DM Sans (body), DM Mono (scores) |
| Theme System | `/theme/colors.ts` single source | All color tokens in one file, never hardcode hex values |

---

## The AI Architecture That Makes This Feel Real

This is the most important technical decision in the entire app. The AI needs to feel like it knows the user — and that requires context engineering, not just prompting.

**The Context Builder:**

Before every AI call, assemble a structured context object:

```javascript
const buildDisciplexContext = (user, last90Days) => ({
  identity: {
    statement: user.identity_statement,
    non_negotiables: user.non_negotiables,
    refused_identity: user.refused_identity
  },
  current_performance: {
    today_score: calculateTodayScore(last90Days),
    week_avg: calculateWeekAvg(last90Days),
    month_avg: calculateMonthAvg(last90Days),
    volatility_index: calculateVolatility(last90Days),
    identity_alignment: calculateIdentityAlignment(last90Days, user)
  },
  habit_data: {
    completion_rates: getHabitCompletionRates(last90Days),
    streaks: getCurrentStreaks(last90Days),
    worst_habit: getWorstPerformingHabit(last90Days),
    best_habit: getBestPerformingHabit(last90Days),
    bottleneck_habit: getBottleneckHabit(last90Days)
  },
  behavioral_patterns: {
    best_day_of_week: getBestDayPattern(last90Days),
    worst_day_of_week: getWorstDayPattern(last90Days),
    peak_completion_window: getPeakTimeWindow(last90Days),
    recent_trend: getTrend(last90Days, 14) // 14-day trend
  },
  tone: user.tone_preference // hard_coach | strategic_advisor | stoic
})
```

Pass this entire object into every AI call. This is what makes responses feel personal.

**The System Prompt by Tone:**

```
// Hard Coach
You are the Disciplex AI — a strict, data-driven performance coach. 
You speak in short sentences. You reference specific numbers from the user's data. 
You do not offer comfort or excuses. You do not use rhetorical questions. 
You tell the user exactly what you see and exactly what they need to do. 
Your job is not to make them feel good. Your job is to make them better.

// Strategic Advisor  
You are the Disciplex AI — a behavioral analyst and strategic coach.
You identify patterns in data before making recommendations.
You speak analytically but with clarity. You make the user think, not feel.
Your recommendations are systemic, not motivational.
Always connect observations to the user's stated identity.

// Stoic
You are the Disciplex AI. You speak rarely and with precision.
Every word you say should be worth the user's attention.
You reference Marcus Aurelius and Epictetus only when directly relevant.
You treat obstacles as information, not problems.
Your responses are short, weighted, and permanent-feeling.
```

---

## Launch: The Strategy That Matches the Product

Disciplex is not a mass-market app. It is an app for a specific type of person — someone who is serious about their performance and not interested in being coddled. That person is findable, concentrated in specific communities, and extremely influential within them.

**Week 1–4: Build in Public on X**
Post the build process. Show actual code. Show design decisions. Show the features that don't exist anywhere else — the Identity Mirror, the Behavioral DNA, the Consequence Engine. These features are worth talking about. Your target audience will follow a founder building something they'd actually use.

**Week 5–8: The Beta Community**
Recruit 50 serious users from X, Reddit (r/selfimprovement, r/Entrepreneur, r/productivity), and Discord productivity servers. Not for feedback on whether the app is good — for behavioral data to make the AI smarter. Treat them like co-builders. They'll become your first advocates.

**Launch Week: The Consequence**
On launch day, post your own Identity Mirror result — your claimed identity vs your behavioral reality after 90 days of building this app. This is the most authentic marketing possible. It shows you use your own product, it demonstrates the feature in the most compelling way, and it invites people into the story.

**The Organic Loop:**
The Share Cards are your paid advertising substitute. Every user who shares their weekly verdict on X is a free impression on exactly your target demographic. Design the cards to be worth sharing. Make the verdict sharp enough that people want to post it. The growth loop is built into the product.

---

## What This Is, Actually

When someone asks you what Disciplex is, don't say "a habit tracker." Say this:

*"It's an AI system that measures the gap between who you claim to be and who your behavior proves you are — and it doesn't let you look away from that gap."*

That is a product worth building. That is a portfolio that tells a story. That is the kind of work that gets remembered.

---

*Disciplex Feature Guide v3.0 — Built for Founders Who Ship*
