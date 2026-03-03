/**
 * Disciplex — Validation Utilities
 * Comprehensive input validation and sanitization
 */

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FieldValidation {
  valid: boolean;
  error?: string;
}

// ============================================
// VALIDATION PATTERNS
// ============================================

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  time24h: /^([01]\d|2[0-3]):([0-5]\d)$/,
  habitName: /^[\w\s\-'.]{2,50}$/,
  identityClaim: /^[\w\s\-'.,!?"]{10,300}$/,
  username: /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/,
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export function validateEmail(email: string): FieldValidation {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!PATTERNS.email.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

export function validatePassword(password: string): FieldValidation {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }
  
  return { valid: true };
}

export function validateHabitName(name: string): FieldValidation {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Habit name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Habit name must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Habit name must be less than 50 characters' };
  }
  
  if (!PATTERNS.habitName.test(trimmed)) {
    return { valid: false, error: 'Habit name contains invalid characters' };
  }
  
  return { valid: true };
}

export function validateIdentityClaim(claim: string): FieldValidation {
  if (!claim || claim.trim().length === 0) {
    return { valid: false, error: 'Identity claim is required' };
  }
  
  const trimmed = claim.trim();
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Identity claim must be at least 10 characters' };
  }
  
  if (trimmed.length > 300) {
    return { valid: false, error: 'Identity claim must be less than 300 characters' };
  }
  
  return { valid: true };
}

export function validateCounterIdentity(claim: string): FieldValidation {
  if (!claim || claim.trim().length === 0) {
    return { valid: false, error: 'Counter-identity is required' };
  }
  
  const trimmed = claim.trim();
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Counter-identity must be at least 10 characters' };
  }
  
  if (trimmed.length > 300) {
    return { valid: false, error: 'Counter-identity must be less than 300 characters' };
  }
  
  return { valid: true };
}

export function validateTime(time: string): FieldValidation {
  if (!time) {
    return { valid: false, error: 'Time is required' };
  }
  
  if (!PATTERNS.time24h.test(time)) {
    return { valid: false, error: 'Invalid time format (use HH:MM)' };
  }
  
  return { valid: true };
}

export function validateNonNegotiables(habits: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(habits) || habits.length !== 3) {
    errors.push('Exactly 3 non-negotiables are required');
    return { valid: false, errors };
  }
  
  habits.forEach((habit, index) => {
    const validation = validateHabitName(habit);
    if (!validation.valid) {
      errors.push(`Habit ${index + 1}: ${validation.error}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateOnboardingData(data: {
  identity_claim: string;
  refuse_to_be: string;
  non_negotiables: string[];
  tone_preference: string;
  reckoning_time: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const identityValidation = validateIdentityClaim(data.identity_claim);
  if (!identityValidation.valid) {
    errors.push(identityValidation.error!);
  }
  
  const counterValidation = validateCounterIdentity(data.refuse_to_be);
  if (!counterValidation.valid) {
    errors.push(counterValidation.error!);
  }
  
  const nonNegotiablesValidation = validateNonNegotiables(data.non_negotiables);
  if (!nonNegotiablesValidation.valid) {
    errors.push(...nonNegotiablesValidation.errors);
  }
  
  const timeValidation = validateTime(data.reckoning_time);
  if (!timeValidation.valid) {
    errors.push(timeValidation.error!);
  }
  
  const validTones = ['analytical', 'brutal'];
  if (!validTones.includes(data.tone_preference)) {
    errors.push('Invalid tone preference');
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================
// SANITIZATION
// ============================================

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeIdentityClaim(text: string): string {
  return sanitizeText(text)
    .replace(/"/g, "'") // Normalize quotes
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function sanitizeHabitName(text: string): string {
  return sanitizeText(text)
    .replace(/[^a-zA-Z0-9\s\-'.]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// SCORE VALIDATION
// ============================================

export function validateScore(score: number): boolean {
  return !isNaN(score) && score >= 0 && score <= 100;
}

export function validateScoreHistory(scores: Array<{ date: string; score: number }>): boolean {
  if (!Array.isArray(scores)) return false;
  
  return scores.every(entry => 
    typeof entry.date === 'string' && 
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    validateScore(entry.score)
  );
}

// ============================================
// DATE VALIDATION
// ============================================

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T00:00:00');
  return !isNaN(parsed.getTime());
}

export function isValidISODate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

// ============================================
// VALIDATION HOOKS (for React components)
// ============================================

export function useValidation() {
  const validateField = (field: string, value: string): FieldValidation => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'habitName':
        return validateHabitName(value);
      case 'identityClaim':
        return validateIdentityClaim(value);
      case 'counterIdentity':
        return validateCounterIdentity(value);
      case 'time':
        return validateTime(value);
      default:
        return { valid: true };
    }
  };
  
  return { validateField };
}
