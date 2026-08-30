import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
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
  let baseUrl = 'https://www.engelsizforum.com';
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const protocol = host.includes('run.app') || host.includes('vercel.app') || host.includes('engelsizforum.com') ? 'https' : 'http';
      baseUrl = `${protocol}://${host}`;
    }
  } catch (e) {
    // Fallback during static pre-rendering
  }

  const ogImageUrl = `${baseUrl}/og-image.png?v=3`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
      template: '%s | EngelsizForum'
    },
    description: 'Bariyersiz, tam erişilebilir ve yapay zeka destekli forum platformu. Balthazard, ÖTV 2026 ve Emeklilik hesaplama araçlarıyla engelli topluluk rehberi.',
    keywords: ['engelsiz forum', 'erişilebilirlik', 'accessibility', 'topluluk', 'yardımlaşma', 'bariyersiz iletişim', 'engelli hakları', 'erişilebilir web', 'GEO optimization', 'generative engine optimization', 'Türkiye engelli platformu', 'biyonik okuma', 'disleksi dostu', 'ÖTV 2026 hesaplama', 'Balthazard hesaplama'],
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
      title: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
      description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli topluluk ve dayanışma platformu.',
      url: baseUrl,
      siteName: 'EngelsizForum',
      type: 'website',
      locale: 'tr_TR',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
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
      "url": "https://engelsizforum.com",
      "logo": "https://engelsizforum.com/logo.png?v=2026",
      "description": "Engelli bireyler için tam erişilebilir, kapsayıcı bir topluluk ve forum platformu.",
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
      "knowsAbout": ["Accessibility", "Disability Rights", "Community Support", "Assistive Technology", "Generative Engine Optimization"],
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
      "name": "EngelsizForum",
      "description": "Tam Erişilebilir Topluluk ve Bilgi Paylaşım Platformu",
      "publisher": { "@id": "https://engelsizforum.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://engelsizforum.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "tr-TR"
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
    },
    {
      "@type": "AggregateRating",
      "itemReviewed": {
        "@type": "WebSite",
        "name": "EngelsizForum"
      },
      "ratingValue": "4.9",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" title="LLM Rules" href="/llms.txt" />
      </head>
      <body className="bg-[#eceff3] text-[#212529] overflow-x-hidden min-h-screen flex flex-col font-sans antialiased">
        <noscript>
          <div style={{ padding: '24px', backgroundColor: '#204060', color: '#ffffff', textAlign: 'center', fontSize: '16px' }}>
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
                <footer className="bg-[#204060] text-white/60 py-10 mt-10">
                  <div className="max-w-[1280px] mx-auto px-4 text-center">
                    <div className="text-xl font-bold text-white mb-4">ENGELSİZ<span className="font-light">FORUM</span></div>
                    <p className="text-sm max-w-2xl mx-auto mb-6 text-white/80">
                      Bariyersiz, tam erişilebilir ve yardımlaşma odaklı topluluk platformu. 
                      Fikirler paylaşıldıkça engeller kalkar.
                    </p>
                    <div className="text-[12px] opacity-60">
                      © 2026 EngelsizForum • Klasik Forum Yazılımı • <Link href="/yardim/erisilebilirlik" className="hover:underline text-white/80">Erişilebilirlik Bildirimi</Link>
                    </div>
                  </div>
                </footer>
              </div>
              <VisitorTracker />
              <Toaster position="top-right" richColors closeButton />
            </WebMCPProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
