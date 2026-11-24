import type { FontSize } from '@/components/providers/accessibility-provider';

export type DisabilityProfileId = 'standard' | 'vision' | 'hearing' | 'neuro' | 'motor';

export interface ProfileState {
  highContrast: boolean;
  fontSize: FontSize;
  dyslexicFont: boolean;
  readingRuler: boolean;
  largeCursor: boolean;
  audioGuide: boolean;
  reducedMotion: boolean;
  visualAlerts: boolean;
}

/**
 * Finds the quick profile that matches the current settings, so its button shows as pressed.
 */
export function detectProfile(state: ProfileState): DisabilityProfileId {
  if (state.highContrast && state.fontSize === 'xl') return 'vision';
  if (state.dyslexicFont || state.readingRuler) return 'neuro';
  if (state.reducedMotion) return 'motor';
  if (state.visualAlerts) return 'hearing';
  return 'standard';
}

/**
 * Returns the settings that switch one quick profile off again. The standard profile has nothing to switch off.
 */
export function profileOffSettings(id: DisabilityProfileId): Partial<ProfileState> {
  switch (id) {
    case 'vision':
      return { highContrast: false, fontSize: 'md', largeCursor: false, audioGuide: false };
    case 'hearing':
      return { visualAlerts: false };
    case 'neuro':
      return { dyslexicFont: false, readingRuler: false, fontSize: 'md', reducedMotion: false };
    case 'motor':
      return { reducedMotion: false, fontSize: 'md', largeCursor: false };
    default:
      return {};
  }
}
