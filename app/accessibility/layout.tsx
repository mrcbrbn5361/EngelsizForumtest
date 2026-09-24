import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erişilebilirlik Standartları & WCAG 2.1 AAA Uyumluluğu | Engelsiz Forum',
  description: 'Engelsiz Forum\'un dijital erişilebilirlik politikası, ekran okuyucu optimizasyonu, biyonik okuma ve WCAG 2.1 Level AAA uyumluluk standartları.',
  alternates: {
    canonical: 'https://engelsizforum.com/accessibility',
  },
  openGraph: {
    title: 'Erişilebilirlik Standartları & WCAG 2.1 AAA Uyumluluğu | Engelsiz Forum',
    description: 'Engelsiz Forum\'un dijital erişilebilirlik politikası ve WCAG 2.1 Level AAA uyumluluk standartları.',
    url: 'https://engelsizforum.com/accessibility',
    type: 'website',
  },
};

export default function AccessibilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
