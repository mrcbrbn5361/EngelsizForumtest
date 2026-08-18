/**
 * Utility functions for handling authentication errors, validation, and session security.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

/**
 * Validates password strength according to security standards
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Şifre en az 8 karakter uzunluğunda olmalıdır.');
  } else {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push('En az bir büyük harf içermelidir.');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    errors.push('En az bir küçük harf içermelidir.');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push('En az bir rakam içermelidir.');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 4),
    errors,
  };
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

/**
 * Sanitizes redirect URL to prevent Open Redirect attacks.
 * Only allows relative paths starting with a single '/' and disallows protocol-relative URLs '//'.
 */
export function sanitizeRedirectUrl(url: string | null | undefined, defaultUrl: string = '/'): string {
  if (!url || typeof url !== 'string') return defaultUrl;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return defaultUrl;
}

