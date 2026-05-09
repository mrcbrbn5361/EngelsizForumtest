'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * RouteAnnouncer: Ensures screen readers announce page changes in SPAs.
 * WCAG 2.2 Requirement for Single Page Applications.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Generate a user-friendly name for the current route
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
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      {announcement}
    </div>
  );
}
