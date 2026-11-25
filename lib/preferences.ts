/**
 * Account preferences shown on /tercihler and enforced on the server.
 *
 * Stored in profiles.notification_prefs and profiles.privacy_prefs (jsonb, see
 * supabase/maintenance/05_tercih_sutunlari.sql). Missing keys fall back to the defaults below,
 * so older rows keep working.
 */

export const NOTIFICATION_TYPES = ['comment', 'like', 'follow', 'message'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_LABELS: Record<NotificationType, { title: string; desc: string }> = {
  comment: { title: 'Konuma yanıt yazıldığında', desc: 'Açtığınız bir konuya biri cevap yazınca' },
  like: { title: 'Konum beğenildiğinde', desc: 'Açtığınız bir konuyu biri beğenince' },
  follow: { title: 'Beni biri takip ettiğinde', desc: 'Yeni bir takipçiniz olunca' },
  message: { title: 'Yeni özel mesaj geldiğinde', desc: 'Size özel mesaj gönderilince' },
};

export type ProfileVisibility = 'everyone' | 'members';

export interface NotificationPrefs {
  types: Record<NotificationType, boolean>;
}

export interface PrivacyPrefs {
  profileVisibility: ProfileVisibility;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  types: { comment: true, like: true, follow: true, message: true },
};

export const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = { profileVisibility: 'everyone' };

/**
 * Reads stored notification preferences (any shape, possibly null) into a complete object.
 */
export function normalizeNotificationPrefs(raw: unknown): NotificationPrefs {
  const types = (raw as { types?: Record<string, unknown> } | null)?.types ?? {};
  return {
    types: Object.fromEntries(
      NOTIFICATION_TYPES.map((t) => [t, typeof types[t] === 'boolean' ? (types[t] as boolean) : DEFAULT_NOTIFICATION_PREFS.types[t]])
    ) as Record<NotificationType, boolean>,
  };
}

/**
 * Reads stored privacy preferences into a complete object.
 */
export function normalizePrivacyPrefs(raw: unknown): PrivacyPrefs {
  const visibility = (raw as { profileVisibility?: unknown } | null)?.profileVisibility;
  return { profileVisibility: visibility === 'members' ? 'members' : 'everyone' };
}

/**
 * True when the recipient wants notifications of this type. Unknown types are always allowed.
 */
export function wantsNotification(rawPrefs: unknown, type: string): boolean {
  if (!(NOTIFICATION_TYPES as readonly string[]).includes(type)) return true;
  return normalizeNotificationPrefs(rawPrefs).types[type as NotificationType];
}

/**
 * True when a visitor may see the full profile.
 */
export function canViewFullProfile(rawPrivacy: unknown, viewer: { isSignedIn: boolean; isOwner: boolean }): boolean {
  if (viewer.isOwner) return true;
  return normalizePrivacyPrefs(rawPrivacy).profileVisibility === 'everyone' || viewer.isSignedIn;
}
