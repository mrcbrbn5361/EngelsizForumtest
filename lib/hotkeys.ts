'use client';

import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    if (!Array.isArray(shortcuts) || shortcuts.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Guard against undefined or unpopulated key event
      if (!event || typeof event.key !== 'string') return;

      const target = event.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      );

      const eventKeyLower = event.key.toLowerCase();

      for (const shortcut of shortcuts) {
        if (!shortcut || typeof shortcut.key !== 'string') continue;

        const matchesKey = eventKeyLower === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const matchesAlt = shortcut.alt ? event.altKey : true;
        const matchesShift = shortcut.shift ? event.shiftKey : true;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          // If Alt key is used, allow it even in inputs for accessibility navigation
          if (!isInput || shortcut.alt) {
            event.preventDefault();
            shortcut.action?.();
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
