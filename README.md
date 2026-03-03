# Disciplex — The AI Discipline Operating System

> **Prove it. Daily.**

Disciplex is not a habit tracker. It is a behavioral measurement system that quantifies the gap between who you claim to be and what your actions prove you are.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-black)](https://docs.expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey)](https://reactnative.dev/)

![Disciplex Banner](./assets/images/banner.png)

---

## The Problem

The market is full of apps that make you feel good about trying. Disciplex makes you confront what you are actually doing.

> "I know what I should do, but I don't execute consistently."

Disciplex measures **execution**, **alignment**, and **consistency** — not motivation.

---

## The Solution

Disciplex is the only app that tells you the truth about who you're actually becoming.

### Core Philosophy

- **Identity > Goals**
- **Consistency > Perfection**
- **Data > Feelings**
- **Accountability > Motivation**

---

## Features

### 🎯 Identity-Based System

- Define who you are becoming (Identity Claim)
- Define who you refuse to be (Counter-Identity)
- Set 3 non-negotiable daily behaviors

### 📊 Identity Alignment Score

A 0-100 score calculated from:
- Raw daily execution
- Non-negotiable weighting
- Late log penalties
- Consistency (volatility) penalties
- 7-day weighted average
- Identity debt

### ⚖️ Identity Debt

- Every missed non-negotiable adds debt
- Debt persists until cleared through overperformance
- Debt directly reduces your Alignment Score

### 🤖 Weekly AI Reckoning

Every Sunday, the AI delivers a cold, data-driven verdict:
- Week score and trend
- Most missed habit
- Bottleneck detection
- One concrete directive for next week

### 📱 Share Cards

Generate stark, shareable score cards:
- Score (color-coded)
- Alignment state
- Verdict excerpt
- Distribution engine built-in

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Google AI API key (for AI Reckoning)

### Installation

```bash
# Clone the repository
git clone https://github.com/MuhammadUsmanGM/Disciplex.git
cd Disciplex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the development server
npm start
```

### Environment Setup

Required environment variables in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key
EXPO_PUBLIC_APP_ENV=development
```

### Database Setup

1. Create a new Supabase project
2. Run `master.sql` in the SQL Editor
3. All tables, indexes, and RLS policies will be created automatically

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Backend | Supabase (PostgreSQL, Auth) |
| AI | Google Generative AI (Gemini) |
| Payments | RevenueCat |
| Notifications | Expo Notifications |
| Animations | Moti |
| Language | TypeScript |

---

## Project Structure

```
Disciplex/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home (Dashboard)
│   │   ├── insights.tsx   # Analytics + Reckoning
│   │   ├── identity.tsx   # Identity + Debt
│   │   └── settings.tsx   # Settings
│   ├── (auth)/            # Authentication screens
│   ├── onboarding.tsx     # Onboarding flow
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   ├── habit/        # Habit-related components
│   │   ├── identity/     # Identity components
│   │   └── reckoning/    # AI Reckoning components
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # External library wrappers
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── constants/            # App constants (theme, colors)
├── assets/               # Images, fonts, icons
├── scripts/              # Build and utility scripts
└── master.sql            # Database schema
```

---

## Scoring System

The Identity Alignment Score is calculated using an 8-step engine:

1. **Raw Daily Execution**: `(CompletedHabits / TotalHabits) * 100`
2. **Non-Negotiable Weighting**: Non-negotiables carry double weight
3. **Late Log Penalty**: Logging >4 hours late reduces weight by 30%
4. **Consistency Penalty**: Volatility is punished (anti-spike protection)
5. **Identity Alignment**: 7-day weighted average (40% today, 60% last 6 days)
6. **Identity Debt**: Each missed non-negotiable adds 10 points
7. **Volatility Index**: Standard deviation of last 30 scores
8. **Bottleneck Detection**: Finds the habit correlating with low scores

### Score Interpretation

| Score | Label | Color |
|-------|-------|-------|
| ≥ 75 | Aligned | Gold |
| 50-74 | Drifting | White |
| < 50 | Identity Gap | Red |

---

## Subscription Tiers

### Free Tier

- Up to 3 habits
- Daily execution logging
- Identity Alignment Score
- Basic weekly summary (no AI)
- 1 share card per month

### Pro Tier — $9.99/month or $79.99/year

- Unlimited habits
- Full Weekly AI Reckoning
- Identity Debt engine
- Advanced analytics (30-day trends, volatility)
- Unlimited share cards
- Reckoning archive

---

## Development

### Available Scripts

```bash
npm start              # Start development server
npm run dev            # Start with dev client
npm run dev:ios        # iOS simulator
npm run dev:android    # Android emulator
npm run dev:web        # Web browser

npm run lint           # Run ESLint
npm run typecheck      # TypeScript type checking
npm test               # Run tests
npm run test:coverage  # Tests with coverage

npm run build:ios      # Build for iOS
npm run build:android  # Build for Android
npm run deploy         # Submit to app stores
```

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## Documentation

- **[README.md](./README.md)** — Project overview and quick start
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production deployment guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines
- **[CHANGELOG.md](./CHANGELOG.md)** — Version history
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** — Database migration instructions
- **[disciplex.md](./disciplex.md)** — Full product specification

---

## Roadmap

### Version 1.1.0
- [ ] Widget support (iOS, Android)
- [ ] Improved bottleneck detection
- [ ] Custom themes
- [ ] Habit categories

### Version 1.2.0
- [ ] Web app with full sync
- [ ] Apple Watch / Wear OS apps
- [ ] Data export (CSV, JSON, PDF)
- [ ] Advanced sharing

### Version 2.0.0
- [ ] Accountability partners
- [ ] Group challenges
- [ ] Public API
- [ ] Custom AI personas

---

## Community

- [GitHub Issues](https://github.com/MuhammadUsmanGM/Disciplex/issues) — Bug reports and feature requests
- [Discord](https://discord.gg/disciplex) — Community discussions
- [Twitter/X](https://twitter.com/disciplex) — Updates and announcements

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

Built with:
- [Expo](https://expo.dev/) — Universal React apps
- [Supabase](https://supabase.com/) — Open source Firebase alternative
- [Google AI](https://ai.google/) — Generative AI
- [RevenueCat](https://www.revenuecat.com/) — In-app subscriptions
- [Zustand](https://zustand-demo.pmnd.rs/) — State management

---

## Support

For business inquiries: contact@disciplex.app

For technical support: [Open an issue](https://github.com/MuhammadUsmanGM/Disciplex/issues)

---

**Prove it. Daily.**

© 2024 Muhammad Usman. All rights reserved.
