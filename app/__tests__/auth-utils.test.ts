import { describe, expect, it } from 'vitest';
import { parseEmailOtpType, sanitizeRedirectPath, validatePasswordStrength } from '@/lib/auth-utils';

describe('validatePasswordStrength', () => {
  it('accepts 8+ characters with a digit or special character', () => {
    expect(validatePasswordStrength('engelsiz1').isValid).toBe(true);
    expect(validatePasswordStrength('engelsiz!').isValid).toBe(true);
    expect(validatePasswordStrength('çok güzel şifre.').isValid).toBe(true);
  });

  it('rejects short passwords', () => {
    const r = validatePasswordStrength('abc12');
    expect(r.isValid).toBe(false);
    expect(r.hasLength).toBe(false);
  });

  it('rejects letters-only passwords, including Turkish letters', () => {
    const r = validatePasswordStrength('ışığıçağrış');
    expect(r.isValid).toBe(false);
    expect(r.hasNumberOrSpecial).toBe(false);
  });

  it('does not count spaces as special characters', () => {
    expect(validatePasswordStrength('uzun şifre burada').hasNumberOrSpecial).toBe(false);
  });
});

describe('sanitizeRedirectPath', () => {
  it('keeps same-site paths', () => {
    expect(sanitizeRedirectPath('/auth/reset-password')).toBe('/auth/reset-password');
    expect(sanitizeRedirectPath('/discussions?page=2')).toBe('/discussions?page=2');
  });

  it('blocks open redirects', () => {
    for (const evil of ['https://evil.com', '//evil.com', '/\\evil.com', '%2F%2Fevil.com', 'javascript:alert(1)', '/%0d%0aSet-Cookie:x']) {
      expect(sanitizeRedirectPath(evil)).toBe('/discussions');
    }
  });

  it('uses the fallback for empty or malformed input', () => {
    expect(sanitizeRedirectPath(null, '/login')).toBe('/login');
    expect(sanitizeRedirectPath('%E0%A4%A', '/login')).toBe('/login');
  });
});

describe('parseEmailOtpType', () => {
  it('accepts known link types only', () => {
    expect(parseEmailOtpType('recovery')).toBe('recovery');
    expect(parseEmailOtpType('signup')).toBe('signup');
    expect(parseEmailOtpType('sms')).toBeNull();
    expect(parseEmailOtpType(null)).toBeNull();
  });
});
