import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

const headingFont = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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
  description: 'Herkes için bariyersiz, tam erişilebilir ve yapay zeka destekli forum ve bilgi paylaşım platformu. Görme, işitme ve fiziksel kısıtlılığı olan kullanıcılar için optimize edilmiştir.',
  keywords: ['engelsiz forum', 'erişilebilirlik', 'accessibility', 'topluluk', 'yardımlaşma', 'bariyersiz iletişim', 'engelli hakları', 'erişilebilir web'],
  authors: [{ name: 'EngelsizForum Ekibi' }],
  creator: 'EngelsizForum',
  publisher: 'EngelsizForum',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://engelsizforum.miracdeveloper.com.tr',
  },
  openGraph: {
    title: 'EngelsizForum | Erişilebilir Topluluk',
    description: 'Herkes için bariyersiz forum deneyimi.',
    url: 'https://engelsizforum.miracdeveloper.com.tr',
    siteName: 'EngelsizForum',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngelsizForum | Erişilebilir Topluluk',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${headingFont.variable} ${bodyFont.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
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
