/**
 * Profile picture rules shared by the browser uploader and the server action.
 *
 * Pictures are stored in the public Supabase Storage bucket "avatars" under "<user id>/".
 * The bucket and its policies are created by supabase/maintenance/04_avatars_bucket.sql.
 */

export const AVATAR_BUCKET = 'avatars';
/** Largest file a visitor may pick; it is shrunk in the browser before upload. */
export const AVATAR_MAX_INPUT_BYTES = 10 * 1024 * 1024;
/** Side length of the stored square picture, in pixels. */
export const AVATAR_SIZE = 256;
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

/**
 * Object path for a new upload; the timestamp busts browser and CDN caches.
 */
export function avatarObjectPath(userId: string, extension: 'webp' | 'jpg' | 'png', now = Date.now()): string {
  return `${userId}/avatar-${now}.${extension}`;
}

/**
 * Public URL prefix under which a user's pictures live.
 */
export function avatarPublicPrefix(supabaseUrl: string, userId: string): string {
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/`;
}

/**
 * Accepts only pictures uploaded by this user to our own bucket (or no picture).
 * Arbitrary external URLs are refused: every visitor would request them, leaking IP addresses
 * to whoever runs that server. An external URL the profile already had is kept as-is.
 */
export function isAllowedAvatarUrl(
  url: string | null | undefined,
  { supabaseUrl, userId, currentUrl }: { supabaseUrl: string; userId: string; currentUrl?: string | null }
): boolean {
  if (!url) return true;
  if (currentUrl && url === currentUrl) return true;
  const prefix = avatarPublicPrefix(supabaseUrl, userId);
  if (!url.startsWith(prefix)) return false;
  const rest = url.slice(prefix.length);
  return /^avatar-\d+\.(webp|jpg|png)$/.test(rest);
}

/**
 * Explains why a picked file cannot be used, or returns null when it is fine.
 */
export function validateAvatarFile(file: { type: string; size: number }): string | null {
  if (!file.type.startsWith('image/')) return 'Lütfen bir resim dosyası seçin (JPG, PNG, WebP).';
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) return 'Bu resim biçimi desteklenmiyor. JPG, PNG veya WebP seçin.';
  if (file.size > AVATAR_MAX_INPUT_BYTES) return 'Resim en fazla 10 MB olabilir.';
  return null;
}
