
import validator from 'validator';

export const PASSWORD_HASH_ROUNDS = 12;

// Common passwords list (subset - in production, use a comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
  'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', 'superman',
  '123456789', 'password1', 'welcome', 'admin', 'root', 'user',
];

export interface PasswordStrength {
  valid: boolean;
  score: number; // 0-4 (weak to very strong)
  errors: string[];
  suggestions: string[];
}

/**
 * Validate password strength with comprehensive rules
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Minimum length check (12 characters)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 1;
  }

  // Maximum length check (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Consider adding special characters for stronger security');
  } else {
    score += 1;
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common - please choose a more unique password');
    score = 0;
  }

  // Check for sequential characters (123, abc)
  if (/(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password)) {
    suggestions.push('Avoid sequential characters');
    score = Math.max(0, score - 1);
  }

  // Check for repeated characters (aaa, 111)
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeated characters');
    score = Math.max(0, score - 1);
  }

  // Add suggestions based on score
  if (score < 3) {
    suggestions.push('Use a mix of uppercase, lowercase, numbers, and symbols');
    suggestions.push('Make your password at least 12 characters long');
  }

  return {
    valid: errors.length === 0 && score >= 3,
    score: Math.min(4, score),
    errors,
    suggestions,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
}
