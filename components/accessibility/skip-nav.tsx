'use client';

import React from 'react';

/**
 * Skip Navigation component (WCAG 2.2 AAA)
 * Allows keyboard users to jump directly to the main content.
 */
export function SkipNav({ targetId = 'main-content' }: { targetId?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      // Smooth scroll if possible, but immediate focus is critical for a11y
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      Ana içeriğe atla
    </a>
  );
}
