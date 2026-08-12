import type { Metadata, Viewport } from 'next';
import VisitorTracker from '@/components/layout/visitor-tracker';
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { AccessibilityToolbar } from '@/components/accessibility/accessibility-toolbar';
import { SkipNav } from '@/components/accessibility/skip-nav';

const headingFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = Atkinson_Hyperlegible({
  weight: ['400', '700'],
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
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://engelsizforum.com'),
  title: {
    default: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
    template: '%s | EngelsizForum'
  },
  description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli forum platformu. Balthazard, ÖTV 2026 ve Erken Emeklilik hesaplama araçları ile engelli bireyler için optimize edilmiş topluluk alanı.',
  keywords: ['engelsiz forum', 'erişilebilirlik', 'accessibility', 'topluluk', 'yardımlaşma', 'bariyersiz iletişim', 'engelli hakları', 'erişilebilir web', 'GEO optimization', 'generative engine optimization', 'Türkiye engelli platformu', 'biyonik okuma', 'disleksi dostu', 'ÖTV 2026 hesaplama', 'Balthazard hesaplama'],
  authors: [{ name: 'EngelsizForum Ekibi' }],
  creator: 'EngelsizForum',
  publisher: 'EngelsizForum',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  alternates: {
    canonical: 'https://engelsizforum.com',
    languages: {
      'tr-TR': 'https://engelsizforum.com',
    },
  },
  other: {
    'geo.region': 'TR',
    'geo.placename': 'Istanbul',
    'geo.position': '41.0082;28.9784',
    'ICBM': '41.0082, 28.9784',
  },
  openGraph: {
    title: 'EngelsizForum: Tam Erişilebilir Topluluk Platformu',
    description: 'Engelli bireyler için %100 erişilebilir, yapay zeka destekli topluluk ve mevzuat danışma platformu.',
    url: 'https://engelsizforum.com',
    siteName: 'EngelsizForum',
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: 'https://engelsizforum.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EngelsizForum - Tam Erişilebilir Topluluk Platformu',
        type: 'image/png',
      },
      {
        url: 'https://engelsizforum.com/banner.png',
        width: 1200,
        height: 630,
        alt: 'EngelsizForum Banner',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngelsizForum: Tam Erişilebilir Topluluk ve Bilgi Platformu',
    description: 'Engelli bireyler için %100 erişilebilir, yapay zeka destekli ve kapsayıcı topluluk platformu. Bariyersiz iletişimin yeni adresi EngelsizForum\'a katılın.',
    site: '@engelsizforum',
    creator: '@engelsizforum',
    images: ['https://engelsizforum.com/twitter-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EngelsizForum',
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  manifest: '/manifest.json',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://engelsizforum.com/#organization",
      "name": "EngelsizForum",
      "url": "https://engelsizforum.com",
      "logo": "https://engelsizforum.com/logo.png",
      "description": "Engelli bireyler için tam erişilebilir, kapsayıcı bir topluluk ve forum platformu.",
      "sameAs": [
        "https://twitter.com/engelsizforum",
        "https://github.com/engelsizforum"
      ],
      "accessibilityControl": ["fullKeyboardControl", "fullMouseControl", "fullVoiceControl"],
      "accessibilityFeature": ["alternativeText", "highContrastDisplay", "noFlashingHazard", "screenReaderFriendly"],
      "accessibilityHazard": "noFlashingHazard"
    },
    {
      "@type": "WebSite",
      "@id": "https://engelsizforum.com/#website",
      "url": "https://engelsizforum.com",
      "name": "EngelsizForum",
      "description": "Tam Erişilebilir Topluluk ve Bilgi Paylaşım Platformu",
      "publisher": { "@id": "https://engelsizforum.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://engelsizforum.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "tr-TR"
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${headingFont.variable} ${bodyFont.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" title="LLM Rules" href="/llms.txt" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <meta property="og:image" content="https://engelsizforum.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://engelsizforum.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="EngelsizForum - Tam Erişilebilir Topluluk Platformu" />
        <meta name="twitter:image" content="https://engelsizforum.com/twitter-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipNav />
        <AuthProvider>
          <AccessibilityProvider>
            <main id="main-content" className="flex-1 w-full flex flex-col outline-none" tabIndex={-1}>
              {children}
            </main>
            <AccessibilityToolbar />
            <VisitorTracker />
            <Toaster position="top-right" richColors closeButton />
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
