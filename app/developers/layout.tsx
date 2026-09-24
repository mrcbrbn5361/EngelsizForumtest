import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geliştirici Portalı | OAuth 2.0 & WebMCP API | Engelsiz Forum',
  description: 'Engelsiz Forum ile Giriş Yap (OAuth 2.0 RFC 6749), Model Context Protocol (WebMCP) ve REST API entegrasyon dokümantasyonu.',
  alternates: {
    canonical: 'https://engelsizforum.com/developers',
  },
  openGraph: {
    title: 'Geliştirici Portalı | OAuth 2.0 & WebMCP API | Engelsiz Forum',
    description: 'OAuth 2.0 ve WebMCP açık entegrasyon standartları ile erişilebilir uygulamalar geliştirin.',
    url: 'https://engelsizforum.com/developers',
    type: 'website',
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
