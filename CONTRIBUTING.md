# Contributing to Disciplex

Thank you for considering contributing to Disciplex! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in Disciplex a harassment-free experience for everyone. We welcome contributors of all backgrounds and identities.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy toward others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Disciplex.git
cd Disciplex
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your environment variables
# See DEPLOYMENT.md for details
```

### 3. Create a Branch

```bash
# Always branch from main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Branch Naming Convention

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `test/` — Adding or updating tests
- `chore/` — Maintenance tasks

Examples:
```
feature/add-habit-categories
fix/score-calculation-bug
docs/update-readme
refactor/auth-flow
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(habits): add habit categories
fix(scores): correct volatility calculation
docs(readme): add deployment instructions
refactor(auth): simplify authentication flow
```

### Making Changes

1. **Write code** following the coding standards
2. **Add tests** for new features
3. **Update documentation** as needed
4. **Run linting** before committing
5. **Test thoroughly** on multiple platforms

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Changes tested on iOS and Android

### PR Title

Use the same convention as commit messages:
```
feat(habits): add ability to categorize habits
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tested on iOS
- [ ] Tested on Android
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Changes tested on real devices
4. **Merge**: Squash and merge by maintainers

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types (avoid `any`)
- Use interfaces for object types
- Export types from dedicated type files

```typescript
// ✅ Good
interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

// ❌ Avoid
type Habit = any;
```

### React Components

- Use functional components with hooks
- Destructure props
- Use meaningful variable names
- Keep components small and focused

```typescript
// ✅ Good
function HabitItem({ habit, onToggle }: HabitItemProps) {
  return (
    <View style={styles.container}>
      <Text>{habit.name}</Text>
    </View>
  );
}

// ❌ Avoid
function HabitItem(props) {
  return (
    <View>
      <Text>{props.habit.name}</Text>
    </View>
  );
}
```

### Styling

- Use StyleSheet.create()
- Follow the design system in `constants/theme.ts`
- Use theme colors, not hardcoded values
- Support dark mode (always dark for Disciplex)

```typescript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    padding: theme.spacing.md,
  },
});

// ❌ Avoid
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    padding: 16,
  },
});
```

### Error Handling

- Always handle errors gracefully
- Log errors with context
- Show user-friendly messages
- Never expose stack traces to users

```typescript
// ✅ Good
try {
  await saveHabit(habit);
} catch (error) {
  logger.error('[HABIT] Failed to save', error as Error);
  setError('Failed to save habit. Please try again.');
}

// ❌ Avoid
try {
  await saveHabit(habit);
} catch (error) {
  console.log(error);
}
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

```
components/
  HabitItem.tsx
  ScoreDisplay.tsx

utils/
  scoring.ts
  validation.ts

constants/
  theme.ts
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test HabitStore.test.ts
```

### Writing Tests

```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateDailyScore } from '@/src/lib/scoring';

describe('calculateDailyScore', () => {
  it('should return 100 when all habits completed', () => {
    const result = calculateDailyScore({
      habits: [{ id: '1', name: 'Test', weight: 1 }],
      completions: [{ habit_id: '1', completed: true }],
      last7DayScores: [],
      identityDebt: 0,
    });
    
    expect(result.rawScore).toBe(100);
  });
});
```

### Integration Tests

Test complete user flows:
- Onboarding → Habit creation → First completion
- Subscription purchase → Feature unlock
- AI Reckoning generation → Display

---

## Documentation

### Code Comments

- Comment **why**, not **what**
- Document complex business logic
- Add JSDoc for public APIs

```typescript
/**
 * Calculates the Identity Alignment Score based on daily execution.
 * 
 * The scoring system rewards consistency over perfection and applies
 * penalties for volatile behavior patterns.
 * 
 * @param habits - Array of user habits
 * @param completions - Today's completions
 * @param last7DayScores - Previous 7 days for consistency calculation
 * @param identityDebt - Current accumulated debt
 * @returns Complete score calculation result
 */
export function calculateDailyScore(params: ScoreParams): ScoreResult {
  // Implementation
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing installation steps
- Modifying environment variables
- Adding new dependencies

---

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Description**: Clear description of the bug
- **Reproduction**: Steps to reproduce
- **Expected**: What should happen
- **Actual**: What actually happens
- **Environment**: OS, app version, device
- **Logs**: Error messages or crash logs

### Feature Requests

Use the feature request template:

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Other solutions considered
- **Context**: Additional context or mockups

---

## Architecture Overview

```
Disciplex/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── (auth)/            # Auth screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── config/            # Configuration files
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # External library wrappers
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── constants/             # App constants
└── assets/                # Images, fonts, etc.
```

### State Management

- **Zustand**: Global state (habits, scores, user)
- **React Query**: Server state (future)
- **Local State**: Component-specific state

### Data Flow

```
User Action → Component → Store → Supabase
                              ↓
                        Store Update
                              ↓
                      Component Re-render
```

---

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update version in `app.json`
- [ ] Update CHANGELOG.md
- [ ] Run all tests
- [ ] Build for production
- [ ] Create release tag
- [ ] Publish to app stores

---

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open an Issue
- **Feature Requests**: Open an Issue with "enhancement" label
- **Security Issues**: Email security@disciplex.app

---

## Thank You!

Every contribution, no matter how small, helps make Disciplex better. We appreciate your time and effort in helping us build a tool that helps people become who they claim to be.

**Prove it. Daily.**
