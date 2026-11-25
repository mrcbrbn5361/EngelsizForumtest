'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { summarizeReaders, topicPresenceChannel, type ReaderMeta, type ReaderSummary } from '@/lib/topic-presence';

const ANONYMOUS_READER_ID_KEY = 'ef_reader_id';

/**
 * Random id that groups the tabs of a guest or of a member who hides their name. It is not
 * derived from the account, so it identifies nobody; it never leaves the browser except as a
 * presence key.
 */
function anonymousReaderId(): string {
  try {
    const saved = localStorage.getItem(ANONYMOUS_READER_ID_KEY);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_READER_ID_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Joins the topic's presence channel and returns who is reading it right now
 * (null while connecting or when Supabase is not configured).
 */
export function useTopicReaders(
  topicId: string | undefined,
  me: { userId: string; username: string } | null,
  hideMe: boolean
): ReaderSummary | null {
  const [summary, setSummary] = useState<ReaderSummary | null>(null);
  const userId = me?.userId;
  const username = me?.username;

  useEffect(() => {
    if (!topicId || !isSupabaseConfigured) return;
    const key = userId && !hideMe ? `m:${userId}` : anonymousReaderId();
    const meta: ReaderMeta = !userId
      ? { kind: 'guest' }
      : hideMe
        ? { kind: 'member', hidden: true }
        : { kind: 'member', userId, username: username || 'üye' };

    const channel = supabase.channel(topicPresenceChannel(topicId), { config: { presence: { key } } });
    channel.on('presence', { event: 'sync' }, () => {
      setSummary(summarizeReaders(channel.presenceState() as unknown as Record<string, ReaderMeta[]>));
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') channel.track(meta);
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [topicId, userId, username, hideMe]);

  return summary;
}
