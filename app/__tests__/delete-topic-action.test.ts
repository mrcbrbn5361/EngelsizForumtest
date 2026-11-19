import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, any>;

const db: { topics: Row[]; threads: Row[]; profiles: Row[]; threadsIsView: boolean } = {
  topics: [],
  threads: [],
  profiles: [],
  threadsIsView: false,
};
let currentUserId: string | null = null;

/**
 * Returns the rows a table exposes; a `threads` view mirrors `topics`.
 */
function rowsOf(table: string): Row[] {
  if (table === 'threads' && db.threadsIsView) return db.topics;
  return (db as any)[table];
}

/**
 * Minimal stand-in for the Supabase query builder used by deleteTopicAction.
 */
function fakeFrom(table: string) {
  return {
    select: () => ({
      eq: (col: string, val: any) => ({
        maybeSingle: async () => ({ data: rowsOf(table).find(r => r[col] === val) ?? null, error: null }),
      }),
    }),
    delete: () => ({
      eq: async (col: string, val: any) => {
        if (table === 'threads' && db.threadsIsView) return { error: null };
        (db as any)[table] = (db as any)[table].filter((r: Row) => r[col] !== val);
        return { error: null };
      },
    }),
  };
}

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
vi.mock('next/cache', () => ({ revalidatePath: () => {} }));
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: currentUserId ? { id: currentUserId } : null },
        error: currentUserId ? null : { message: 'no session' },
      }),
    },
  }),
}));
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: {},
  getSupabaseServer: () => ({ from: fakeFrom }),
}));

const { deleteTopicAction } = await import('@/app/actions');

const TOPIC = 't-1';

describe('deleteTopicAction', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    db.topics = [{ id: TOPIC, author_id: 'author' }];
    db.threads = [{ id: TOPIC, author_id: 'author' }];
    db.profiles = [
      { id: 'author', role: 'user' },
      { id: 'other', role: 'user' },
      { id: 'mod', role: 'moderator' },
    ];
    db.threadsIsView = false;
    currentUserId = 'author';
  });

  it('removes the topic from both topics and a separate threads table', async () => {
    const result = await deleteTopicAction(TOPIC);
    expect(result).toEqual({ success: true });
    expect(db.topics).toHaveLength(0);
    expect(db.threads).toHaveLength(0);
  });

  it('works when threads is a view over topics', async () => {
    db.threadsIsView = true;
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(true);
    expect(db.topics).toHaveLength(0);
  });

  it('removes a topic that only exists in the threads table', async () => {
    db.topics = [];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(true);
    expect(db.threads).toHaveLength(0);
  });

  it('lets a moderator delete someone else\'s topic', async () => {
    currentUserId = 'mod';
    expect((await deleteTopicAction(TOPIC)).success).toBe(true);
  });

  it('refuses a user who is neither the author nor staff', async () => {
    currentUserId = 'other';
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(1);
    expect(db.threads).toHaveLength(1);
  });

  it('refuses an anonymous request', async () => {
    currentUserId = null;
    expect((await deleteTopicAction(TOPIC)).success).toBe(false);
    expect(db.topics).toHaveLength(1);
  });

  it('reports a missing topic instead of claiming success', async () => {
    db.topics = [];
    db.threads = [];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
  });
});
