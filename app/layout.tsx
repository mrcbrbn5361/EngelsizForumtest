import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
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
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}>
      <body className="bg-background text-foreground transition-colors duration-300 overflow-x-hidden min-h-screen flex flex-col">
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
