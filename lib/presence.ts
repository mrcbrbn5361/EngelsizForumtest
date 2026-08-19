/**
 * Presence & Activity Utility Functions
 * Evaluates online status based on real profiles.last_seen_at timestamp.
 */

export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes standard forum presence window

/**
 * Checks if a user is currently considered online based on their last_seen_at timestamp.
 * @param lastSeenAt ISO string timestamp of the user's last recorded heartbeat/activity
 * @param thresholdMs Time window in milliseconds (default: 5 minutes)
 * @returns boolean true if user was active within threshold, false otherwise
 */
export function isUserOnline(lastSeenAt?: string | null, thresholdMs: number = ONLINE_THRESHOLD_MS): boolean {
  if (!lastSeenAt || typeof lastSeenAt !== 'string') {
    return false;
  }

  const timestamp = new Date(lastSeenAt).getTime();
  if (isNaN(timestamp) || timestamp <= 0) {
    return false;
  }

  const diff = Date.now() - timestamp;
  // User cannot be in the future beyond clock skew (allow 10s skew) and must be within threshold
  return diff >= -10000 && diff < thresholdMs;
}
