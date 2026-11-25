/**
 * Cookie consent shared by the cookie banner and the /tercihler page.
 * Stored only in the visitor's browser; applied to Google Consent Mode v2.
 */

export const COOKIE_CONSENT_STORAGE_KEY = 'engelsizforum_cookie_consent_v2';
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

/**
 * The visitor's saved choice, or null when they have not decided yet.
 */
export function readCookieConsent(): ConsentPreferences | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return { necessary: true, analytics: parsed.analytics === true, marketing: parsed.marketing === true, timestamp: parsed.timestamp || '' };
  } catch {
    return null;
  }
}

/**
 * Tells Google tags what the visitor allowed.
 */
export function applyCookieConsent(analytics: boolean, marketing: boolean): void {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
    });
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: 'consent_status_update', analytics_consent: analytics, marketing_consent: marketing });
  }
}

/**
 * Saves the choice, applies it and notifies other open components (banner, preferences page).
 */
export function saveCookieConsent(analytics: boolean, marketing: boolean): ConsentPreferences {
  const data: ConsentPreferences = { necessary: true, analytics, marketing, timestamp: new Date().toISOString() };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode: the choice still applies for this page view.
  }
  applyCookieConsent(analytics, marketing);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: data }));
  return data;
}
