/**
 * Utility functions for handling authentication errors and formatting user-friendly messages.
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
  if (msg.includes('Invalid login credentials')) {
    return 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Lütfen e-posta adresinize gönderilen onaylama bağlantısına tıklayarak hesabınızı doğrulayın.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('unique constraint')) {
    return 'Bu e-posta adresi veya kullanıcı adı ile zaten kayıtlı bir hesap bulunmaktadır. Lütfen giriş yapın.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Şifre en az 6 karakter uzunluğunda olmalıdır.';
  }
  if (msg.includes('Signup requires a valid password')) {
    return 'Geçerli bir şifre girmeniz gerekmektedir.';
  }
  if (msg.includes('Unable to validate email address') || msg.includes('invalid email')) {
    return 'Lütfen geçerli bir e-posta adresi girin.';
  }
  if (msg.includes('Database error saving new user')) {
    return 'Kullanıcı profili oluşturulurken geçici bir sorun oluştu. Lütfen tekrar deneyin.';
  }

  return msg;
}
