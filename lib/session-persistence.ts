/**
 * "Oturumumu bu cihazda açık tut" support.
 *
 * The choice is stored in a long-lived cookie (ef_remember=1|0). When it is 0, every Supabase
 * auth cookie is written as a *session cookie* (no Max-Age / Expires), so the browser drops the
 * login when it is closed. Browser and server cookie writers both apply this, otherwise the
 * middleware would turn the cookies back into 400-day cookies on the next token refresh.
 */

export const REMEMBER_COOKIE = 'ef_remember';
export const REMEMBER_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

interface ExpiringCookieOptions {
  maxAge?: number;
  expires?: Date;
}

/**
 * True when the visitor chose not to stay signed in on this device.
 */
export function isSessionOnly(rememberValue: string | undefined | null): boolean {
  return rememberValue === '0';
}

/**
 * Strips the lifetime from auth cookie options when the visitor chose a browser-session login.
 * Cookie deletions (Max-Age <= 0 or an Expires in the past) are left untouched.
 */
export function withRememberPreference<T extends ExpiringCookieOptions>(
  options: T | undefined,
  rememberValue: string | undefined | null
): T | undefined {
  if (!options || !isSessionOnly(rememberValue)) return options;
  const isDeletion =
    (options.maxAge !== undefined && options.maxAge <= 0) ||
    (options.expires !== undefined && options.expires.getTime() <= Date.now());
  if (isDeletion) return options;
  const { maxAge: _maxAge, expires: _expires, ...rest } = options;
  return rest as T;
}

/**
 * Cookie string that records the visitor's choice; written right before signing in.
 */
export function rememberCookieString(remember: boolean, secure: boolean): string {
  return `${REMEMBER_COOKIE}=${remember ? '1' : '0'}; Path=/; Max-Age=${REMEMBER_COOKIE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/**
 * Reads the remember choice from a document.cookie style header.
 */
export function readRememberCookie(cookieHeader: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${REMEMBER_COOKIE}=([^;]*)`));
  return match ? match[1] : undefined;
}
