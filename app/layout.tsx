import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { WebMCPProvider } from '@/components/providers/webmcp-provider';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SkipNav } from '@/components/accessibility/skip-nav';
import ClassicNavbar from '@/components/layout/classic-navbar';
import { Footer } from '@/components/layout/footer';

import VisitorTracker from '@/components/layout/lazy-visitor-tracker';
import EngelsizAI from '@/components/layout/lazy-engelsiz-ai';
import AccessibilityInspector from '@/components/accessibility/lazy-accessibility-inspector';
import CookieConsentBanner from '@/components/layout/lazy-cookie-consent';

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
      'balthazard formülü 2026',
      'baltazar hesaplama',
      'baltazart formülü',
      'özür oranı birleştirme formülü',
      'sağlık kurulu heyet raporu oranı',
      'vücut fonksiyon kaybı oranı cetveli',
      'ötv 2026 hesaplama',
      'ötv muafiyetli araç 2026 üst limit',
      '2.873.972 tl ötv limiti',
      'otv indirimi',
      'otvsiz sıfır araba',
      'otvli araç alımı',
      'özel tüketim vergisi istisnası',
      'engelli taşıt alım şartları',
      'yüzde 90 engelli oto alımı',
      'özel tertibatlı araç kodları',
      'sol bacak otomatik vites ötv muafiyeti',
      'mtv muafiyeti engelli',
      'motorlu taşıtlar vergisi istisnası',
      'engelli erken emeklilik',
      'kademeli engelli emeklilik tablosu',
      'yaş şartsız engelli emekliliği',
      '5510 sayılı kanun 28 madde',
      '506 sayılı kanun geçici 8 madde',
      'sgk engelli prim gün sayısı',
      'malulen emeklilik',
      'malülen emekli şartları',
      '1800 günle malullük aylığı',
      'sağlık kurulu raporu',
      'erişkinler için engellilik değerlendirmesi',
      'eskr raporu',
      'heyet raporu yenileme',
      'hakem hastane sevk itiraz',
      'çözger özel gereksinim raporu',
      'cozger raporu',
      'özel koşul gereksinimi vardır ökgv',
      'çok ileri düzeyde özel gereksinim çögv',
      'evde bakım maaşı gelir kriteri',
      '2828 sayılı sosyal hizmetler kanunu',
      'tam bağımlı engelli bakım ücreti',
      'bakıcı maaşı şartları',
      'evde bakım parası 2026',
      '2022 engelli aylığı',
      'engelli maaşı muhtaçlık sınırı',
      'sydv kaymakamlık engelli yardımı',
      'gvk 31 vergi indirimi',
      'gelir vergisi kanunu sakatlık indirimi',
      '1 2 3 derece sakatlık indirimi bordro',
      'e-kpss tercih kılavuzu',
      'ekpss puanları memur alımı',
      'kura ile engelli memur ataması',
      'iş kanunu 30 madde engelli kotası',
      'yüzde 3 engelli işçi çalıştırma zorunluluğu',
      'iş kanunu 24 1 a haklı fesih',
      'sağlık nedeniyle kıdem tazminatlı istifa',
      'ortopedik bedensel engelli hakları',
      'görme engelli beyaz baston braille',
      'işitme engelli koklear implant sut desteği',
      'otizm down sendromu ram raporu',
      'kronik hastalık diyabet koah onkoloji malullük',
      'sosyal güvenlik kurumu sgk il müdürlüğü',
      'türkiye iş kurumu işkur engelli hibe',
      'aile ve sosyal hizmetler bakanlığı engelli kartı',
      'rehberlik ve araştırma merkezi ram özel eğitim',
      'gelir idaresi başkanlığı gib vergi dairesi',
      'şehir hastaneleri ve hakem hastaneler',
      'istanbul engelli hakları ve hizmetleri',
      'ankara engelli heyet hastaneleri',
      'izmir engelli sağlık raporu',
      'bursa engelli danışma merkezi',
      'antalya engelli ulaşım kartı',
      'istanbul kadıköy üsküdar bağcılar esenyurt pendik ümraniye fatih başakşehir beşiktaş engelli hizmetleri',
      'ankara çankaya keçiören yenimahalle mamak etimesgut sincan altındağ engelli heyet raporu',
      'izmir konak karşıyaka bornova buca bayraklı karabağlar çiğli engelli ulaşım',
      'bursa osmangazi yıldırım nilüfer inegöl gemlik engelli hakları',
      'antalya kepez muratpaşa alanya manavgat konyaaltı engelli danışma',
      'adana seyhan yüreğir çukurova sarıçam ceyhan engelli maaşı',
      'gaziantep şahinbey şehitkamil nizip islahiyesydv engelli yardımı',
      'kocaeli gebze izmit darıca körfez gölcük derince engelli bakım',
      'konya selçuklu meram karatay ereğli akşehir engelli sağlık kurulu',
      'diyarbakır bağlar kayapınar yenişehir sur ergani engelli raporu',
      'samsun ilkadım atakum bafra çarşamba canik engelli heyet hastanesi',
      'şanlıurfa eyyübiye haliliye siverek viranşehir karaköprü 2022 engelli maaşı',
      'adana adıyaman afyonkarahisar ağrı amasya ankara antalya artvin aydın balıkesir bilecik bingöl bitlis bolu burdur bursa çanakkale çankırı çorum denizli diyarbakır edirne elazığ erzincan erzurum eskişehir gaziantep giresun gümüşhane hakkari hatay ısparta mersin istanbul izmir kars kastamonu kayseri kırklareli kırşehir kocaeli konya kütahya malatya manisa kahramanmaraş mardin muğla muş nevşehir niğde ordu rize sakarya samsun siirt sinop sivas tekirdağ tokat trabzon tunceli şanlıurfa uşak van yozgat zonguldak aksaray bayburt karaman kırıkkale batman şırnak bartın ardahan ığdır yalova karabük kilis osmaniye düzce 973 ilçe engelli hizmetleri',
      'ücretsiz toplu taşıma tcdd tren indirimi',
      'türk hava yolları thy engelli bilet indirimi',
      'belediye mesken su faturası yüzde 50 indirim',
      'elektrik tüketim desteği kronik hasta yardımı',
      'erişilebilirlik wcag aaa',
      'bariyersiz forum'
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
        "addressLocality": "İstanbul",
        "addressRegion": "İstanbul",
        "addressCountry": "TR"
      },
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
        {/* Google tag (gtag.js) & Google Consent Mode v2 */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Check existing consent from localStorage
            var savedConsent = null;
            try {
              var item = localStorage.getItem('engelsizforum_cookie_consent_v2');
              if (item) {
                savedConsent = JSON.parse(item);
              }
            } catch(e) {}

            gtag('consent', 'default', {
              'ad_storage': (savedConsent && savedConsent.marketing) ? 'granted' : 'denied',
              'ad_user_data': (savedConsent && savedConsent.marketing) ? 'granted' : 'denied',
              'ad_personalization': (savedConsent && savedConsent.marketing) ? 'granted' : 'denied',
              'analytics_storage': (savedConsent && savedConsent.analytics) ? 'granted' : 'denied',
              'wait_for_update': 500
            });
            gtag('js', new Date());
            gtag('config', 'G-XBFZ4BS7GJ');
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XBFZ4BS7GJ"
          strategy="afterInteractive"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #0d1117 !important; color: #f0f6fc !important; margin: 0; }
          .min-h-screen { min-height: 100vh; }
          .bg-background { background-color: #0d1117; }
        `}} />
        <link rel="preconnect" href="https://vtmozdquvamjeniwhonm.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vtmozdquvamjeniwhonm.supabase.co" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="alternate" type="text/plain" title="LLM Rules" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="AI Catalog" href="/ai-catalog.json" />
      </head>
      <body className="bg-background text-foreground overflow-x-hidden min-h-screen flex flex-col font-sans antialiased">
        <noscript>
          <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#ffffff', textAlign: 'center', fontSize: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            EngelsizForum, tam erişilebilir bir topluluk platformudur. Lütfen tarayıcınızda JavaScript&apos;i etkinleştirin.
          </div>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1868964903102165"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <SkipNav />
        <AuthProvider>
          <AccessibilityProvider>
            <WebMCPProvider>
              <div className="flex flex-col min-h-screen">
                <ClassicNavbar />
                <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 min-w-0 overflow-x-hidden outline-none" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
              <VisitorTracker />
              <EngelsizAI />
              <Toaster position="top-right" richColors closeButton />
              <AccessibilityInspector />
              <CookieConsentBanner />
            </WebMCPProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
