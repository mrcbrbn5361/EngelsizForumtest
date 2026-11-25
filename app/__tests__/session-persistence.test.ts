import { describe, expect, it } from 'vitest';
import { readRememberCookie, rememberCookieString, withRememberPreference } from '@/lib/session-persistence';

const lasting = { path: '/', sameSite: 'lax' as const, maxAge: 400 * 24 * 60 * 60 };

describe('withRememberPreference', () => {
  it('keeps the 400-day lifetime when the visitor wants to stay signed in', () => {
    expect(withRememberPreference(lasting, '1')).toEqual(lasting);
    expect(withRememberPreference(lasting, undefined)).toEqual(lasting);
  });

  it('turns auth cookies into browser-session cookies when remember is off', () => {
    const out = withRememberPreference({ ...lasting, expires: new Date(Date.now() + 1e9) }, '0');
    expect(out).toEqual({ path: '/', sameSite: 'lax' });
  });

  it('never blocks cookie deletion (sign-out)', () => {
    expect(withRememberPreference({ path: '/', maxAge: 0 }, '0')).toEqual({ path: '/', maxAge: 0 });
    const past = { path: '/', expires: new Date(0) };
    expect(withRememberPreference(past, '0')).toEqual(past);
  });
});

describe('remember cookie helpers', () => {
  it('writes and reads the choice', () => {
    expect(rememberCookieString(false, true)).toMatch(/^ef_remember=0; Path=\/; Max-Age=\d+; SameSite=Lax; Secure$/);
    expect(readRememberCookie('a=1; ef_remember=0; b=2')).toBe('0');
    expect(readRememberCookie('xef_remember=0')).toBeUndefined();
  });
});
