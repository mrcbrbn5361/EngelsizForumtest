import { describe, expect, it } from 'vitest';
import { canViewFullProfile, normalizeNotificationPrefs, normalizePrivacyPrefs, wantsNotification } from '@/lib/preferences';

describe('notification preferences', () => {
  it('defaults every type to on, including for old rows', () => {
    expect(normalizeNotificationPrefs(null).types).toEqual({ comment: true, like: true, follow: true, message: true });
    expect(normalizeNotificationPrefs({ email: true, browser: false }).types.like).toBe(true);
  });

  it('respects types the user turned off', () => {
    const prefs = { types: { like: false, message: false } };
    expect(wantsNotification(prefs, 'like')).toBe(false);
    expect(wantsNotification(prefs, 'message')).toBe(false);
    expect(wantsNotification(prefs, 'comment')).toBe(true);
  });

  it('ignores garbage values and unknown types', () => {
    expect(wantsNotification({ types: { like: 'no' } }, 'like')).toBe(true);
    expect(wantsNotification({ types: { like: false } }, 'system')).toBe(true);
  });
});

describe('profile visibility', () => {
  const membersOnly = { profileVisibility: 'members' };

  it('defaults to everyone', () => {
    expect(normalizePrivacyPrefs(undefined).profileVisibility).toBe('everyone');
    expect(normalizePrivacyPrefs({ profileVisibility: 'nobody' }).profileVisibility).toBe('everyone');
  });

  it('hides a members-only profile from guests only', () => {
    expect(canViewFullProfile(membersOnly, { isSignedIn: false, isOwner: false })).toBe(false);
    expect(canViewFullProfile(membersOnly, { isSignedIn: true, isOwner: false })).toBe(true);
    expect(canViewFullProfile({}, { isSignedIn: false, isOwner: false })).toBe(true);
  });
});
