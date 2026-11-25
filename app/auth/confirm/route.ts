import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseEmailOtpType, sanitizeRedirectPath } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

/**
 * Verifies an email link (password reset, sign-up confirmation, email change …) on the server.
 *
 * Email templates link here as
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password
 *
 * Unlike the PKCE code exchange in /auth/callback, this needs nothing stored in the browser that
 * requested the email, so the link also works when it is opened on another device.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = parseEmailOtpType(searchParams.get('type'));
  const defaultNext = type === 'recovery' ? '/auth/reset-password' : '/discussions';
  const next = sanitizeRedirectPath(searchParams.get('next'), defaultNext);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const failure = type === 'recovery'
    ? new URL('/auth/forgot-password', origin)
    : new URL('/login', origin);
  failure.searchParams.set(
    'error',
    type === 'recovery'
      ? 'Şifre sıfırlama bağlantısının süresi dolmuş ya da daha önce kullanılmış. Lütfen yeni bir bağlantı isteyin.'
      : 'Doğrulama bağlantısının süresi dolmuş ya da daha önce kullanılmış. Lütfen tekrar deneyin.'
  );
  return NextResponse.redirect(failure);
}
