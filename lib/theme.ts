/** Gece (dark), Gündüz (light), Göz yormama (sepia) or follow the operating system. */
export type ThemePreference = 'dark' | 'light' | 'sepia' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

/**
 * Resolves a theme preference to the theme that is actually painted.
 * Keep in sync with THEME_BOOTSTRAP_SCRIPT in app/layout.tsx.
 */
export function resolveTheme(preference: ThemePreference | undefined): ResolvedTheme {
  if (preference === 'light' || preference === 'sepia') return preference;
  if (preference === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

/** Body/heading typeface chosen in the accessibility menu. */
export type ReadingFont = 'default' | 'lexend' | 'opendyslexic';

/**
 * Normalises a stored reading-font value; unknown values fall back to the default typeface.
 * Keep in sync with THEME_BOOTSTRAP_SCRIPT in app/layout.tsx.
 */
export function resolveReadingFont(value: string | undefined): ReadingFont {
  return value === 'lexend' || value === 'opendyslexic' ? value : 'default';
}
