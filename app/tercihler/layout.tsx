import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tercihler | Engelsiz Forum',
  description: 'Bildirim, gizlilik ve çerez tercihlerinizi yönetin.',
  robots: { index: false, follow: false },
};

/**
 * Layout for the preferences page (metadata only).
 */
export default function TercihlerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
