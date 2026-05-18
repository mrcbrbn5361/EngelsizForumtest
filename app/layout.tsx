import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

const headingFont = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
    template: '%s | EngelsizForum'
  },
  description: 'Herkes için bariyersiz, tam erişilebilir ve yapay zeka destekli forum ve bilgi paylaşım platformu. Görme, işitme ve fiziksel kısıtlılığı olan kullanıcılar için optimize edilmiştir. SEO ve GEO (Generative Engine Optimization) uyumlu altyapı.',
  keywords: ['engelsiz forum', 'erişilebilirlik', 'accessibility', 'topluluk', 'yardımlaşma', 'bariyersiz iletişim', 'engelli hakları', 'erişilebilir web', 'GEO optimization', 'generative engine optimization'],
  authors: [{ name: 'EngelsizForum Ekibi' }],
  creator: 'EngelsizForum',
  publisher: 'EngelsizForum',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr',
  },
  openGraph: {
    title: 'EngelsizForum | Erişilebilir Topluluk ve Bilgi Paylaşım Platformu',
    description: 'Herkes için bariyersiz forum deneyimi. Yapay zeka ile güçlendirilmiş erişilebilirlik özellikleri.',
    url: 'https://engelsizforum.miracdeveloper.com.tr',
    siteName: 'EngelsizForum',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngelsizForum | Erişilebilir Topluluk Platformu',
    description: 'Herkes için bariyersiz forum deneyimi.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EngelsizForum',
  },
  formatDetection: {
    telephone: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EngelsizForum",
  "url": "https://engelsizforum.miracdeveloper.com.tr",
  "logo": "https://engelsizforum.miracdeveloper.com.tr/logo.png",
  "description": "Engelli bireyler için tam erişilebilir, kapsayıcı bir topluluk ve forum platformu.",
  "sameAs": [
    "https://twitter.com/engelsizforum",
    "https://github.com/engelsizforum"
  ],
  "accessibilityControl": ["fullKeyboardControl", "fullMouseControl", "fullVoiceControl"],
  "accessibilityFeature": ["alternativeText", "highContrastDisplay", "noFlashingHazard", "screenReaderFriendly"],
  "accessibilityHazard": "noFlashingHazard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${headingFont.variable} ${bodyFont.variable} ${jetbrainsMono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Ana içeriğe atla
        </a>
        <AuthProvider>
            <AccessibilityProvider>
              <main id="main-content" className="flex-1 w-full flex flex-col outline-none" tabIndex={-1}>
                {children}
              </main>
            </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
