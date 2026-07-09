import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';

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
};

export const metadata: Metadata = {
  title: {
    default: 'EngelsizForum | Tam Erişilebilir Topluluk Platformu',
    template: '%s | EngelsizForum'
  },
  description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli forum platformu. Engelli bireyler için optimize edilmiş, SEO ve GEO uyumlu topluluk alanı.',
  keywords: ['engelsiz forum', 'erişilebilirlik', 'accessibility', 'topluluk', 'yardımlaşma', 'bariyersiz iletişim', 'engelli hakları', 'erişilebilir web', 'GEO optimization', 'generative engine optimization'],
  authors: [{ name: 'EngelsizForum Ekibi' }],
  creator: 'EngelsizForum',
  publisher: 'EngelsizForum',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://engelsizforum.com',
    languages: {
      'tr-TR': 'https://engelsizforum.com',
    },
  },
  openGraph: {
    title: 'EngelsizForum: Erişilebilir Forum',
    description: 'Engelli bireyler için tam erişilebilir forum platformu.',
    url: 'https://engelsizforum.com',
    siteName: 'EngelsizForum',
    images: [
      {
        url: 'https://engelsizforum.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EngelsizForum - Erişilebilir Topluluk Platformu',
      },
    ],
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngelsizForum: Tam Erişilebilir Topluluk ve Bilgi Platformu',
    description: 'Engelli bireyler için %100 erişilebilir, yapay zeka destekli ve kapsayıcı topluluk platformu. Bariyersiz iletişimin yeni adresi EngelsizForum\'a katılın.',
    site: '@engelsizforum',
    creator: '@engelsizforum',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EngelsizForum',
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
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
        
      </head>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <Toaster />
      </body>
    </html>
  );
}
