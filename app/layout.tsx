import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'EngelsizForum | Erişilebilir Topluluk',
  description: 'Herkes için bariyersiz, tam erişilebilir forum ve bilgi paylaşım platformu.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${headingFont.variable} ${bodyFont.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col font-sans">
        <AuthProvider>
            <AccessibilityProvider>
              <div className="flex-1 w-full flex flex-col">
                {children}
              </div>
            </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
