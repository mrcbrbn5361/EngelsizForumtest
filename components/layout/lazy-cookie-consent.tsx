'use client';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(
  () => import('@/components/layout/cookie-consent-banner').then((mod) => mod.CookieConsentBanner),
  { ssr: false }
);

export default CookieConsentBanner;
