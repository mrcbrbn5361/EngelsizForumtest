'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * RouteAnnouncer: SPA sayfa geçişlerini ekran okuyuculara bildirir.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!pathname) return;

    const pageName = pathname === '/' 
      ? 'Anasayfa' 
      : pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Sayfa';
    
    const capitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    setAnnouncement(`${capitalized} sayfası yüklendi`);
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
