/**
 * "Bu konuyu şu an okuyanlar" — who is reading a topic right now.
 *
 * Every open topic page joins the Supabase Realtime presence channel of that topic and
 * announces itself as a member (with username) or a guest. Members who turned on
 * "Okuduğum konularda adımı gösterme" announce themselves without a name or user id: their
 * presence key is a random id kept only in their own browser, so they cannot be identified.
 * Nothing is stored in the database.
 */

export type ReaderMeta =
  | { kind: 'member'; userId: string; username: string; hidden?: false }
  | { kind: 'member'; hidden: true }
  | { kind: 'guest' };

export interface ReaderSummary {
  members: { userId: string; username: string }[];
  hiddenMembers: number;
  guests: number;
}

/**
 * Presence channel name for a topic.
 */
export function topicPresenceChannel(topicId: string): string {
  return `presence:topic:${topicId}`;
}

/**
 * Collapses raw presence state (one entry per open tab) into unique readers.
 * Each presence key is one reader: a member's tabs share a key, as do a guest's or a hidden member's.
 */
export function summarizeReaders(state: Record<string, ReaderMeta[] | undefined>): ReaderSummary {
  const visible = new Map<string, string>();
  let hiddenMembers = 0;
  let guests = 0;

  for (const metas of Object.values(state)) {
    const meta = metas?.[0];
    if (!meta) continue;
    if (meta.kind === 'guest') guests += 1;
    else if (meta.hidden) hiddenMembers += 1;
    else visible.set(meta.userId, meta.username);
  }

  const members = [...visible.entries()]
    .map(([userId, username]) => ({ userId, username }))
    .sort((a, b) => a.username.localeCompare(b.username, 'tr'));
  return { members, hiddenMembers, guests };
}

/**
 * Turkish sentence for the summary, e.g. "ali, ayşe, 1 gizli üye ve 3 misafir".
 */
export function describeReaders({ members, hiddenMembers, guests }: ReaderSummary): string {
  const parts = [
    ...members.map((m) => m.username),
    ...(hiddenMembers ? [`${hiddenMembers} gizli üye`] : []),
    ...(guests ? [`${guests} misafir`] : []),
  ];
  if (parts.length === 0) return 'Şu an başka okuyan yok.';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} ve ${parts[parts.length - 1]}`;
}

/**
 * Total number of distinct readers.
 */
export function countReaders({ members, hiddenMembers, guests }: ReaderSummary): number {
  return members.length + hiddenMembers + guests;
}
