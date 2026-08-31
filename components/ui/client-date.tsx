'use client';

import React, { useState, useEffect } from 'react';

interface ClientDateProps {
  dateString?: string | null;
  className?: string;
  format?: 'date' | 'datetime' | 'time';
}

export function ClientDate({ dateString, className = '', format = 'date' }: ClientDateProps) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    if (!dateString) return;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
        setFormatted(dateString);
        return;
      }
      if (format === 'date') {
        setFormatted(d.toLocaleDateString('tr-TR'));
      } else if (format === 'datetime') {
        setFormatted(d.toLocaleString('tr-TR'));
      } else {
        setFormatted(d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      setFormatted(dateString || '');
    }
  }, [dateString, format]);

  // Fallback string for SSR so it matches initial render or empty
  const ssgFallback = dateString ? dateString.split('T')[0] : '';

  return (
    <span className={className} suppressHydrationWarning>
      {formatted || ssgFallback}
    </span>
  );
}
