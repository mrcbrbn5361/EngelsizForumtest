import type { Metadata, Viewport } from 'next';
import VisitorTracker from '@/components/layout/visitor-tracker';
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { WebMCPProvider } from '@/components/providers/webmcp-provider';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
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
  themeColor: '#090a0f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.engelsizforum.com'),
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
    canonical: 'https://www.engelsizforum.com',
    languages: {
      'tr-TR': 'https://www.engelsizforum.com',
    },
  },
  other: {
    'geo.region': 'TR',
    'geo.placename': 'Istanbul',
    'geo.position': '41.0082;28.9784',
    'ICBM': '41.0082, 28.9784',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
    description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu.',
    url: 'https://www.engelsizforum.com',
    siteName: 'EngelsizForum',
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: 'https://www.engelsizforum.com/og-image.png',
        secureUrl: 'https://www.engelsizforum.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EngelsizForum - Tam Erişilebilir Topluluk Platformu',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
    description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu.',
    site: '@engelsizforum',
    creator: '@engelsizforum',
    images: ['https://www.engelsizforum.com/og-image.png'],
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
      "logo": "https://engelsizforum.com/logo.png?v=2026",
      "description": "Engelli bireyler için tam erişilebilir, kapsayıcı bir topluluk ve forum platformu.",
      "sameAs": [
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
    <html lang="tr" className={`dark ${headingFont.variable} ${bodyFont.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="48x48" />
        <link rel="icon" type="image/png" href="/icon.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        
        {/* OpenGraph / WhatsApp / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EngelsizForum" />
        <meta property="og:url" content="https://www.engelsizforum.com" />
        <meta property="og:title" content="EngelsizForum | Tam Erişilebilir Topluluk Platformu" />
        <meta property="og:description" content="Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu." />
        <meta property="og:image" content="https://www.engelsizforum.com/og-image.png" />
        <meta property="og:image:url" content="https://www.engelsizforum.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://www.engelsizforum.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="EngelsizForum - Tam Erişilebilir Topluluk Platformu" />
        
        {/* Twitter Card / Discord */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@engelsizforum" />
        <meta name="twitter:creator" content="@engelsizforum" />
        <meta name="twitter:title" content="EngelsizForum | Tam Erişilebilir Topluluk Platformu" />
        <meta name="twitter:description" content="Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu." />
        <meta name="twitter:image" content="https://www.engelsizforum.com/og-image.png" />
        <meta name="twitter:image:src" content="https://www.engelsizforum.com/og-image.png" />
        <meta name="twitter:image:alt" content="EngelsizForum - Tam Erişilebilir Topluluk Platformu" />
        
        {/* Search Engine & Chat Scraper Fallbacks */}
        <meta itemProp="name" content="EngelsizForum | Tam Erişilebilir Topluluk Platformu" />
        <meta itemProp="description" content="Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu." />
        <meta itemProp="image" content="https://www.engelsizforum.com/og-image.png" />
        <link rel="image_src" href="https://www.engelsizforum.com/og-image.png" />
        
        <link rel="alternate" type="text/plain" title="LLM Rules" href="/llms.txt" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
      </head>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipNav />
        <AuthProvider>
          <AccessibilityProvider>
            <WebMCPProvider>
              <main id="main-content" className="flex-1 w-full flex flex-col outline-none" tabIndex={-1}>
                {children}
              </main>
              <VisitorTracker />
              <Toaster position="top-right" richColors closeButton />
            </WebMCPProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
