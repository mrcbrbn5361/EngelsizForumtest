import { Profile } from '@/types/database';
import { getSupabaseServer } from '@/lib/supabase-server';

export type GlobalRole = 'user' | 'member' | 'moderator' | 'admin' | 'owner' | 'founder' | 'system';
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';

export interface PrivacySettings {
  show_email?: boolean;
  show_online_status?: boolean;
  show_activity?: boolean;
  allow_messages?: boolean;
  profile_visibility?: 'public' | 'members' | 'private' | boolean;
  show_activity_history?: boolean;
  allow_direct_messages?: 'everyone' | 'members' | 'none' | boolean;
  showEmail?: boolean;
  showOnlineStatus?: boolean;
  showActivity?: boolean;
  allowMessages?: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  show_email: false,
  show_online_status: true,
  show_activity: true,
  allow_messages: true,
  profile_visibility: true,
  show_activity_history: true,
  allow_direct_messages: true,
  showEmail: false,
  showOnlineStatus: true,
  showActivity: true,
  allowMessages: true,
};

export interface NotificationPreferences {
  email_replies?: boolean;
  email_mentions?: boolean;
  email_digest?: boolean;
  in_app_notifications?: boolean;
  email?: boolean;
  browser?: boolean;
  sound?: boolean;
  digest_frequency?: string;
  emailReplies?: boolean;
  emailMentions?: boolean;
  emailDigest?: boolean;
  inAppNotifications?: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  email_replies: true,
  email_mentions: true,
  email_digest: false,
  in_app_notifications: true,
  email: true,
  browser: true,
  sound: true,
  digest_frequency: 'weekly',
  emailReplies: true,
  emailMentions: true,
  emailDigest: false,
  inAppNotifications: true,
};

/**
 * Checks if a profile has staff privileges (admin or moderator)
 */
export function isStaff(profile?: Profile | null | { role?: string }): boolean {
  if (!profile || !profile.role) return false;
  return profile.role === 'admin' || profile.role === 'moderator' || profile.role === 'system';
}

/**
 * Checks if a profile has administrator privileges
 */
export function isAdmin(profile?: Profile | null | { role?: string }): boolean {
  if (!profile || !profile.role) return false;
  return profile.role === 'admin' || profile.role === 'system';
}

/**
 * Checks if the account is in good standing (not suspended, banned, or deleted)
 */
export function isAccountActive(profile?: Profile | null | { account_status?: string }): boolean {
  if (!profile) return true; // Default fallback for backwards compatibility
  const status = (profile as any).account_status;
  if (!status) return true;
  return status === 'active';
}

/**
 * Strips privileged and read-only fields from any client-supplied profile update payload.
 * Prevents privilege escalation (role, is_staff, is_verified, xp, level, account_status).
 */
export function sanitizeProfileUpdatePayload(payload: Record<string, any>): Record<string, any> {
  const allowedFields = [
    'username',
    'full_name',
    'avatar_url',
    'bio',
    'accessibility_prefs',
    'privacy_settings',
    'notification_prefs',
  ];

  const sanitized: Record<string, any> = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  }

  // Handle camelCase variants safely
  if (payload.fullName !== undefined && sanitized.full_name === undefined) {
    sanitized.full_name = payload.fullName;
  }
  if (payload.avatarUrl !== undefined && sanitized.avatar_url === undefined) {
    sanitized.avatar_url = payload.avatarUrl;
  }
  if (payload.accessibilityPrefs !== undefined && sanitized.accessibility_prefs === undefined) {
    sanitized.accessibility_prefs = payload.accessibilityPrefs;
  }
  if (payload.privacySettings !== undefined && sanitized.privacy_settings === undefined) {
    sanitized.privacy_settings = payload.privacySettings;
  }
  if (payload.notificationPrefs !== undefined && sanitized.notification_prefs === undefined) {
    sanitized.notification_prefs = payload.notificationPrefs;
  }

  return sanitized;
}

/**
 * Validates and clamps accessibility preferences to ensure safe layout rendering.
 */
export function sanitizeAccessibilityPrefs(prefs: Record<string, any>): Record<string, any> {
  if (!prefs || typeof prefs !== 'object') return {};

  const clean: Record<string, any> = { ...prefs };

  // Clamp font size if present (12px - 26px)
  if (typeof clean.fontSize === 'number') {
    clean.fontSize = Math.max(12, Math.min(26, clean.fontSize));
  } else if (clean.fontSize) {
    const parsed = parseInt(String(clean.fontSize), 10);
    if (!isNaN(parsed)) {
      clean.fontSize = Math.max(12, Math.min(26, parsed));
    }
  }

  // Clamp line height (1.2 - 2.4)
  if (typeof clean.lineHeight === 'number') {
    clean.lineHeight = Math.max(1.2, Math.min(2.4, clean.lineHeight));
  }

  // Ensure boolean flags are strictly boolean
  const booleanFlags = [
    'highContrast',
    'reducedMotion',
    'dyslexiaFont',
    'bionicReading',
    'readingGuide',
    'largeCursor',
    'screenReaderOptimized',
    'monochrome',
  ];

  for (const flag of booleanFlags) {
    if (clean[flag] !== undefined) {
      clean[flag] = Boolean(clean[flag]);
    }
  }

  return clean;
}

/**
 * Checks if a user has moderation rights for a specific category
 */
export async function canModerateCategory(
  userId: string,
  categoryId: string,
  userRole?: string
): Promise<boolean> {
  if (!userId || !categoryId) return false;
  if (userRole === 'admin' || userRole === 'moderator' || userRole === 'owner' || userRole === 'founder') return true;

  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from('category_moderators')
      .select('id')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Checks if a user has moderation rights for a specific community
 */
export async function canModerateCommunity(
  userId: string,
  communityId: string,
  userRole?: string
): Promise<boolean> {
  if (!userId || !communityId) return false;
  if (userRole === 'admin' || userRole === 'moderator' || userRole === 'owner' || userRole === 'founder') return true;

  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from('community_moderators')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

