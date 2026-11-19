import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveTheme } from '@/lib/theme';

/**
 * Stubs window.matchMedia so "prefers-color-scheme: light" reports the given value.
 */
function osPrefersLight(light: boolean) {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: light }) });
}

describe('resolveTheme', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps explicit themes', () => {
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('sepia')).toBe('sepia');
  });

  it('defaults to dark for missing or unknown values', () => {
    expect(resolveTheme(undefined)).toBe('dark');
    expect(resolveTheme('neon' as any)).toBe('dark');
  });

  it('follows the operating system for "system"', () => {
    osPrefersLight(true);
    expect(resolveTheme('system')).toBe('light');
    osPrefersLight(false);
    expect(resolveTheme('system')).toBe('dark');
  });
});
