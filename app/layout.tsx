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
import ClassicNavbar from '@/components/layout/classic-navbar';
import Link from 'next/link';
import { EngelsizAI } from '@/components/layout/engelsiz-ai';
import { Footer } from '@/components/layout/footer';

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

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = 'https://engelsizforum.com';
  const ogImageUrl = `${baseUrl}/og-image.png?v=3`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'Engelsiz Forum | Engelli Hakları, Balthazard, ÖTV & Topluluk Platformu',
      template: '%s | Engelsiz Forum'
    },
    description: 'Türkiye\'nin ilk tam erişilebilir (WCAG AAA) engelli topluluk platformu. Balthazard formülü, 2026 ÖTV muafiyeti, engelli erken emeklilik ve mevzuat rehberi.',
    keywords: [
      'engelsiz forum',
      'engelli hakları',
      'balthazard hesaplama',
      'ötv 2026 hesaplama',
      'engelli erken emeklilik',
      'özür oranı cetveli',
      'sağlık kurulu raporu',
      'erişilebilirlik',
      'topluluk',
      'yardımlaşma',
      'bariyersiz forum',
      'evde bakım maaşı',
      'engelli araç alımı'
    ],
    authors: [{ name: 'EngelsizForum Ekibi' }],
    creator: 'EngelsizForum',
    publisher: 'EngelsizForum',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    alternates: {
      canonical: baseUrl,
      languages: {
        'tr-TR': baseUrl,
        'x-default': baseUrl,
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
        { url: '/favicon.png', type: 'image/png', sizes: '48x48' },
        { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: ['/favicon.ico'],
    },
    openGraph: {
      title: 'Engelsiz Forum | Engelli Hakları, Balthazard, ÖTV & Topluluk Platformu',
      description: 'Türkiye\'nin ilk tam erişilebilir (WCAG AAA) engelli topluluk platformu. Balthazard formülü, 2026 ÖTV muafiyeti, engelli erken emeklilik ve mevzuat rehberi.',
      url: baseUrl,
      siteName: 'Engelsiz Forum',
      type: 'website',
      locale: 'tr_TR',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Engelsiz Forum - Tam Erişilebilir Topluluk Platformu',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Engelsiz Forum | Engelli Hakları, Balthazard, ÖTV & Topluluk Platformu',
      description: 'Türkiye\'nin ilk tam erişilebilir (WCAG AAA) engelli topluluk platformu. Balthazard formülü, 2026 ÖTV muafiyeti, engelli erken emeklilik ve mevzuat rehberi.',
      site: '@engelsizforum',
      creator: '@engelsizforum',
      images: [ogImageUrl],
    },
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
    manifest: '/manifest.json',
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://engelsizforum.com/#organization",
      "name": "EngelsizForum",
      "alternateName": "Engelsiz Forum",
      "url": "https://engelsizforum.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://engelsizforum.com/icon.png",
        "width": 192,
        "height": 192
      },
      "description": "Engelli bireyler için tam erişilebilir, kapsayıcı bir topluluk ve mevzuat danışma platformu.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Büyükdere Cad. Levent",
        "addressLocality": "Istanbul",
        "addressRegion": "Istanbul",
        "postalCode": "34330",
        "addressCountry": "TR"
      },
      "sameAs": [
        "https://github.com/engelsizforum",
        "https://twitter.com/engelsizforum"
      ],
      "knowsAbout": ["Accessibility", "Disability Rights", "Community Support", "Assistive Technology", "Generative Engine Optimization", "Balthazard Formula", "ÖTV Exemption 2026"],
      "makesOffer": {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tam Erişilebilir Topluluk ve Dayanışma Platformu"
        }
      },
      "accessibilityControl": ["fullKeyboardControl", "fullMouseControl", "fullVoiceControl"],
      "accessibilityFeature": ["alternativeText", "highContrastDisplay", "noFlashingHazard", "screenReaderFriendly"],
      "accessibilityHazard": "noFlashingHazard"
    },
    {
      "@type": "WebSite",
      "@id": "https://engelsizforum.com/#website",
      "url": "https://engelsizforum.com",
      "name": "Engelsiz Forum",
      "description": "Tam Erişilebilir Engelli Topluluğu, Hakları ve Hesaplama Platformu",
      "publisher": { "@id": "https://engelsizforum.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://engelsizforum.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "tr-TR"
    },
    {
      "@type": "WebApplication",
      "@id": "https://engelsizforum.com/#webapplication",
      "name": "Engelsiz Forum",
      "url": "https://engelsizforum.com",
      "applicationCategory": "CommunityApplication",
      "operatingSystem": "All",
      "description": "Engelli bireyler için tam erişilebilir forum, mevzuat danışma ve resmi Balthazard / ÖTV hesaplama robotları.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY"
      }
    },
    {
      "@type": "Person",
      "@id": "https://engelsizforum.com/#person",
      "name": "EngelsizForum Ekibi",
      "url": "https://engelsizforum.com/about",
      "sameAs": [
        "https://www.linkedin.com/company/engelsizforum",
        "https://www.linkedin.com/in/miracbirben"
      ],
      "worksFor": { "@id": "https://engelsizforum.com/#organization" }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" title="LLM Rules" href="/llms.txt" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1868964903102165"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-foreground overflow-x-hidden min-h-screen flex flex-col font-sans antialiased">
        <noscript>
          <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#ffffff', textAlign: 'center', fontSize: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            EngelsizForum, tam erişilebilir bir topluluk platformudur. Lütfen tarayıcınızda JavaScript'i etkinleştirin.
          </div>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipNav />
        <AuthProvider>
          <AccessibilityProvider>
            <WebMCPProvider>
              <div className="flex flex-col min-h-screen">
                <ClassicNavbar />
                <main id="main-content" className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-6 outline-none" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
              <VisitorTracker />
              <EngelsizAI />
              <Toaster position="top-right" richColors closeButton />
            </WebMCPProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
