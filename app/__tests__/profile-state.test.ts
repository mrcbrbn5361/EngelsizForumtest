import { describe, expect, it } from 'vitest';
import { detectProfile, profileOffSettings, type ProfileState } from '@/components/accessibility/profile-state';

const base: ProfileState = {
  highContrast: false,
  fontSize: 'md',
  dyslexicFont: false,
  readingRuler: false,
  largeCursor: false,
  audioGuide: false,
  reducedMotion: false,
  visualAlerts: false,
};

const ON: Record<'vision' | 'hearing' | 'neuro' | 'motor', Partial<ProfileState>> = {
  vision: { highContrast: true, fontSize: 'xl', largeCursor: true, audioGuide: true },
  hearing: { visualAlerts: true },
  neuro: { dyslexicFont: true, readingRuler: true, fontSize: 'lg', reducedMotion: true },
  motor: { reducedMotion: true, fontSize: 'lg', largeCursor: true },
};

describe('quick profile detection and switching off', () => {
  it('detects the standard profile for default settings', () => {
    expect(detectProfile(base)).toBe('standard');
  });

  it('detects every profile from its own settings, including hearing', () => {
    for (const id of ['vision', 'hearing', 'neuro', 'motor'] as const) {
      expect(detectProfile({ ...base, ...ON[id] })).toBe(id);
    }
  });

  it('returns to standard after switching a profile off', () => {
    for (const id of ['vision', 'hearing', 'neuro', 'motor'] as const) {
      const on = { ...base, ...ON[id] };
      expect(detectProfile({ ...on, ...profileOffSettings(id) })).toBe('standard');
    }
  });

  it('keeps unrelated settings when a profile is switched off', () => {
    const state = { ...base, ...ON.vision, visualAlerts: true };
    const after = { ...state, ...profileOffSettings('vision') };
    expect(after.visualAlerts).toBe(true);
    expect(detectProfile(after)).toBe('hearing');
  });

  it('has nothing to switch off for the standard profile', () => {
    expect(profileOffSettings('standard')).toEqual({});
  });
});
