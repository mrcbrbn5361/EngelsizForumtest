/**
 * Utility functions for handling authentication errors, validation, and session security.
 */

/** Minimum length of every newly chosen password (sign-up, reset, change). */
export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordChecks {
  hasLength: boolean;
  hasNumberOrSpecial: boolean;
}

export interface PasswordValidationResult extends PasswordChecks {
  isValid: boolean;
  errors: string[];
}

/**
 * Single password policy for the whole site: at least 8 characters and at least one
 * digit or special character. Existing passwords keep working; this applies only
 * when a new password is set.
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const value = password || '';
  const hasLength = value.length >= PASSWORD_MIN_LENGTH;
  const hasNumberOrSpecial = /[^\p{L}\s]/u.test(value);
  const errors: string[] = [];
  if (!hasLength) errors.push(`Şifre en az ${PASSWORD_MIN_LENGTH} karakter uzunluğunda olmalıdır.`);
  if (!hasNumberOrSpecial) errors.push('Şifre en az bir rakam veya özel karakter içermelidir.');
  return { isValid: errors.length === 0, hasLength, hasNumberOrSpecial, errors };
}

/**
 * Returns a safe same-site path to redirect to after authentication.
 * Rejects absolute URLs, protocol-relative URLs and backslash tricks (open redirect).
 */
export function sanitizeRedirectPath(value: string | null | undefined, fallback = '/discussions'): string {
  if (!value) return fallback;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\') || /[\u0000-\u001f]/.test(decoded)) {
    return fallback;
  }
  return decoded;
}

/** Email link types that /auth/confirm can verify with a token hash. */
export const EMAIL_OTP_TYPES = ['recovery', 'signup', 'email', 'email_change', 'invite', 'magiclink'] as const;
export type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

/**
 * Narrows an untrusted query-string value to a supported email link type.
 */
export function parseEmailOtpType(value: string | null): EmailOtpType | null {
  return (EMAIL_OTP_TYPES as readonly string[]).includes(value || '') ? (value as EmailOtpType) : null;
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Formats authentication errors into user-friendly Turkish messages.
 */
export function formatAuthError(err: any, fallbackMessage: string = 'İşlem gerçekleştirilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'): string {
  if (!err) return fallbackMessage;

  // Handle string errors
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[]' || trimmed === '{}') return fallbackMessage;
    return mapErrorMessage(trimmed, fallbackMessage);
  }

  // Extract raw message from error objects
  let rawMsg: any = err.message || err.error_description || err.msg || err.details;

  if (Array.isArray(rawMsg)) {
    rawMsg = rawMsg.filter(Boolean).map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
  } else if (typeof rawMsg === 'object' && rawMsg !== null) {
    try {
      rawMsg = JSON.stringify(rawMsg);
    } catch (e) {
      rawMsg = '';
    }
  }

  const strMsg = String(rawMsg || '').trim();

  if (!strMsg || strMsg === '[]' || strMsg === '{}' || strMsg === 'null' || strMsg === 'undefined' || strMsg === '[object Object]') {
    return fallbackMessage;
  }

  return mapErrorMessage(strMsg, fallbackMessage);
}

function mapErrorMessage(msg: string, fallback: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Lütfen e-posta adresinize gönderilen onaylama bağlantısına tıklayarak hesabınızı doğrulayın.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('unique constraint') || lower.includes('user_already_exists')) {
    return 'Bu e-posta adresi veya kullanıcı adı ile zaten kayıtlı bir hesap bulunmaktadır. Lütfen giriş yapın.';
  }
  if (lower.includes('password should be at least')) {
    return 'Şifre en az 6 karakter uzunluğunda olmalıdır.';
  }
  if (lower.includes('signup requires a valid password')) {
    return 'Geçerli bir şifre girmeniz gerekmektedir.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email') || lower.includes('email is invalid')) {
    return 'Lütfen geçerli bir e-posta adresi girin.';
  }
  if (lower.includes('database error saving new user') || lower.includes('profile creation failed')) {
    return 'Kullanıcı profili oluşturulurken geçici bir sorun oluştu. Lütfen tekrar deneyin.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Çok fazla istek yapıldı. Güvenliğiniz için lütfen birkaç dakika bekleyip tekrar deneyin.';
  }
  if (lower.includes('session expired') || lower.includes('token expired') || lower.includes('refresh_token_not_found') || lower.includes('invalid token')) {
    return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
  }
  if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('connection refused')) {
    return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
  }

  return msg;
}

