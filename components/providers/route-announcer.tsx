'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * RouteAnnouncer: SPA sayfa geçişlerini ekran okuyuculara sayfanın Türkçe başlığıyla bildirir.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!pathname) return;
    const timer = setTimeout(() => {
      const title = document.title.split('|')[0].trim();
      const fallback = pathname === '/' ? 'Anasayfa' : 'Sayfa';
      setAnnouncement(`${title || fallback} sayfası yüklendi`);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
