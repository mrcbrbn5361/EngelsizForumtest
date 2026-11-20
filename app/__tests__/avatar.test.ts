import { describe, expect, it } from 'vitest';
import { avatarObjectPath, isAllowedAvatarUrl, validateAvatarFile } from '@/lib/avatar';

const SB = 'https://proj.supabase.co';
const UID = '11111111-2222-3333-4444-555555555555';
const own = `${SB}/storage/v1/object/public/avatars/${UID}/avatar-1763600000000.webp`;

describe('isAllowedAvatarUrl', () => {
  it('accepts no picture and the user\'s own uploads', () => {
    expect(isAllowedAvatarUrl(null, { supabaseUrl: SB, userId: UID })).toBe(true);
    expect(isAllowedAvatarUrl(own, { supabaseUrl: SB, userId: UID })).toBe(true);
  });

  it('refuses external URLs (IP-leaking tracking pixels)', () => {
    expect(isAllowedAvatarUrl('https://tracker.example/pixel.gif', { supabaseUrl: SB, userId: UID })).toBe(false);
    expect(isAllowedAvatarUrl('http://proj.supabase.co/storage/v1/object/public/avatars/x.png', { supabaseUrl: SB, userId: UID })).toBe(false);
  });

  it('refuses another user\'s picture and path tricks', () => {
    const other = own.replace(UID, '99999999-2222-3333-4444-555555555555');
    expect(isAllowedAvatarUrl(other, { supabaseUrl: SB, userId: UID })).toBe(false);
    expect(isAllowedAvatarUrl(`${SB}/storage/v1/object/public/avatars/${UID}/../evil/avatar-1.webp`, { supabaseUrl: SB, userId: UID })).toBe(false);
    expect(isAllowedAvatarUrl(`${own}?x=https://evil`, { supabaseUrl: SB, userId: UID })).toBe(false);
  });

  it('keeps an external picture the profile already had', () => {
    const legacy = 'https://lh3.googleusercontent.com/a/abc';
    expect(isAllowedAvatarUrl(legacy, { supabaseUrl: SB, userId: UID, currentUrl: legacy })).toBe(true);
  });
});

describe('validateAvatarFile', () => {
  it('accepts common photo formats up to 10 MB', () => {
    expect(validateAvatarFile({ type: 'image/jpeg', size: 4_000_000 })).toBeNull();
    expect(validateAvatarFile({ type: 'image/heic', size: 3_000_000 })).toBeNull();
  });

  it('rejects non-images, SVG and oversized files', () => {
    expect(validateAvatarFile({ type: 'application/pdf', size: 1000 })).toMatch(/resim/);
    expect(validateAvatarFile({ type: 'image/svg+xml', size: 1000 })).toMatch(/desteklenmiyor/);
    expect(validateAvatarFile({ type: 'image/png', size: 11 * 1024 * 1024 })).toMatch(/10 MB/);
  });
});

describe('avatarObjectPath', () => {
  it('stores under the user folder', () => {
    expect(avatarObjectPath(UID, 'webp', 42)).toBe(`${UID}/avatar-42.webp`);
  });
});
