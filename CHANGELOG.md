# Changelog

All notable changes to Disciplex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Production-ready TypeScript types for all domains
- Comprehensive error handling with ErrorBoundary components
- Loading states with skeleton loaders throughout the app
- Performance monitoring with performance marks
- Structured logging utility with log levels
- Secure storage wrapper with encryption
- Input validation utilities
- Configuration management with environment support
- Database schema with debt_ledger table
- Row Level Security (RLS) policies for all tables
- Retry logic for network requests
- Environment configuration template (.env.example)

### Changed
- Improved Supabase client with error handling and retry logic
- Enhanced useHabitStore with better error handling and logging
- Updated app.json with production configuration
- Enhanced .gitignore with comprehensive patterns
- Updated master.sql with debt_ledger table and policies

### Fixed
- Missing error states in habit store
- Incomplete type definitions
- Database schema inconsistencies

## [1.0.0] - 2024-01-XX

### Added
- Initial production release

#### Core Features
- Identity-based habit tracking system
- Identity Alignment Score (0-100)
- Identity Debt tracking
- Daily execution logging
- Weekly AI Reckoning
- Bottleneck detection
- Share cards for social distribution

#### Technical Foundation
- React Native with Expo SDK 54
- Expo Router for file-based navigation
- Zustand for state management
- Supabase for backend (Auth, Database, Realtime)
- Google Generative AI for AI Reckoning
- RevenueCat for subscription management
- Moti for animations

#### Scoring System
- 8-step scoring engine
- Raw daily execution score
- Non-negotiable weighting
- Late log penalty
- Consistency penalty (anti-spike protection)
- Identity Alignment Score (7-day weighted average)
- Identity Debt calculation
- Volatility Index

#### UI/UX
- Premium dark theme
- Gold accent color for achievement
- Red for consequences (identity debt)
- Monospaced fonts for score display
- Animated transitions
- Haptic feedback
- Skeleton loading states

#### Authentication
- Email/password authentication
- Secure session management
- Automatic token refresh
- PKCE flow

#### Onboarding
- Identity claim setup
- Counter-identity definition
- Non-negotiable habits configuration
- AI tone preference selection
- Reckoning delivery time selection

#### Subscription Tiers
- **Free Tier**: 3 habits, basic scoring, basic weekly summary
- **Pro Tier** ($9.99/month or $79.99/year): Unlimited habits, AI Reckoning, Identity Debt, advanced analytics

---

## Version History Legend

### Types
- **Added** — New features
- **Changed** — Changes in existing functionality
- **Deprecated** — Soon-to-be removed features
- **Removed** — Removed features
- **Fixed** — Bug fixes
- **Security** — Security improvements

---

## Notes

- All dates are in YYYY-MM-DD format
- Version numbers follow semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes will be clearly marked with migration guides
- For detailed migration instructions, see DEPLOYMENT.md

---

## Upcoming Features (Roadmap)

### Version 1.1.0
- Widget support (iOS Home Screen, Android Widgets)
- Improved bottleneck detection with ML
- Custom themes (multiple accent colors)
- Habit categories

### Version 1.2.0
- Web app with full sync
- Apple Watch / Wear OS companion apps
- Data export (CSV, JSON, PDF)
- Advanced sharing options

### Version 2.0.0
- Team/Accountability partner features
- Group challenges
- API for third-party integrations
- Custom AI personas

---

## Support

For questions about this changelog or specific versions:
- Open a GitHub issue
- Check the DEPLOYMENT.md for version-specific notes
- Review commit history for detailed changes

---

**Prove it. Daily.**
