import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, any>;
type Who = 'user' | 'service';

const db: {
  topics: Row[];
  threads: Row[];
  profiles: Row[];
  threadsIsView: boolean;
  rlsBlocksUserDelete: boolean;
  failSelect: string[];
  failDelete: string[];
  failNth: { table: string; nth: number } | null;
} = {
  topics: [],
  threads: [],
  profiles: [],
  threadsIsView: false,
  rlsBlocksUserDelete: false,
  failSelect: [],
  failDelete: [],
  failNth: null,
};
const selectCounts: Record<string, number> = {};
const revalidatePath = vi.hoisted(() => vi.fn());
let currentUserId: string | null = null;
let deletes: { table: string; who: Who }[] = [];

/**
 * Returns the rows a table exposes; a `threads` view mirrors `topics`.
 */
function rowsOf(table: string): Row[] {
  if (table === 'threads' && db.threadsIsView) return db.topics;
  return (db as any)[table];
}

/**
 * Minimal stand-in for the Supabase query builder. The `user` client mimics row-level
 * security on topics (author or staff only, and silently nothing when blocked); the
 * `service` client bypasses it. Every delete is recorded with the client that made it.
 */
function fakeFrom(table: string, who: Who) {
  return {
    select: () => ({
      eq: (col: string, val: any) => ({
        maybeSingle: async () => {
          selectCounts[table] = (selectCounts[table] ?? 0) + 1;
          if (db.failSelect.includes(table)) return { data: null, error: { message: 'raw select failure' } };
          if (db.failNth?.table === table && db.failNth.nth === selectCounts[table]) return { data: null, error: { message: 'raw select failure' } };
          return { data: rowsOf(table).find(r => r[col] === val) ?? null, error: null };
        },
      }),
    }),
    delete: () => ({
      eq: async (col: string, val: any) => {
        deletes.push({ table, who });
        if (db.failDelete.includes(table)) return { error: { message: 'raw delete failure' } };
        if (who === 'user') {
          if (db.rlsBlocksUserDelete) return { error: null };
          const me = db.profiles.find(p => p.id === currentUserId);
          const staff = me?.role === 'admin' || me?.role === 'moderator';
          const target = rowsOf(table).find(r => r[col] === val);
          if (!staff && target?.author_id !== currentUserId) return { error: null };
        }
        if (table === 'threads' && db.threadsIsView) {
          db.topics = db.topics.filter(r => r[col] !== val);
          return { error: null };
        }
        (db as any)[table] = (db as any)[table].filter((r: Row) => r[col] !== val);
        return { error: null };
      },
    }),
  };
}

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: currentUserId ? { id: currentUserId } : null },
        error: currentUserId ? null : { message: 'no session' },
      }),
    },
    from: (table: string) => fakeFrom(table, 'user'),
  }),
}));
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: {},
  getSupabaseServer: () => ({ from: (table: string) => fakeFrom(table, 'service') }),
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
    db.rlsBlocksUserDelete = false;
    db.failSelect = [];
    db.failDelete = [];
    db.failNth = null;
    Object.keys(selectCounts).forEach(key => delete selectCounts[key]);
    deletes = [];
    revalidatePath.mockClear();
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

  it('deletes the topic with the caller\'s own session, never with the service client', async () => {
    await deleteTopicAction(TOPIC);
    expect(deletes.filter(d => d.table === 'topics')).toEqual([{ table: 'topics', who: 'user' }]);
  });

  it('uses the service client only for a leftover legacy threads row', async () => {
    await deleteTopicAction(TOPIC);
    expect(deletes.filter(d => d.who === 'service')).toEqual([{ table: 'threads', who: 'service' }]);
  });

  it('does not touch the service client for deletion when threads is a view', async () => {
    db.threadsIsView = true;
    await deleteTopicAction(TOPIC);
    expect(deletes.filter(d => d.who === 'service')).toHaveLength(0);
  });

  it('stops and keeps everything when row-level security blocks the user delete', async () => {
    db.rlsBlocksUserDelete = true;
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(1);
    expect(db.threads).toHaveLength(1);
    expect(deletes.filter(d => d.who === 'service')).toHaveLength(0);
  });

  it('stops when row-level security blocks the delete even if threads is a view', async () => {
    db.threadsIsView = true;
    db.rlsBlocksUserDelete = true;
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(1);
    expect(deletes.filter(d => d.who === 'service')).toHaveLength(0);
  });

  it('makes no delete call at all for a user who is neither author nor staff', async () => {
    currentUserId = 'other';
    await deleteTopicAction(TOPIC);
    expect(deletes).toHaveLength(0);
  });

  it('stops without deleting when the topic lookup fails', async () => {
    db.failSelect = ['topics'];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(deletes).toHaveLength(0);
    expect(db.threads).toHaveLength(1);
  });

  it('does not let a failed role lookup turn into a silent denial or an unchecked delete', async () => {
    currentUserId = 'mod';
    db.failSelect = ['profiles'];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(deletes).toHaveLength(0);
  });

  it('refreshes caches and hides raw database errors when the legacy cleanup fails after topics is gone', async () => {
    db.failDelete = ['threads'];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(result.error).not.toContain('raw delete failure');
    expect(db.topics).toHaveLength(0);
    expect(revalidatePath).toHaveBeenCalledWith(`/discussions/${TOPIC}`);
  });

  it('refreshes caches after a normal delete and not after a refusal', async () => {
    await deleteTopicAction(TOPIC);
    expect(revalidatePath).toHaveBeenCalledWith('/discussions');
    revalidatePath.mockClear();
    db.topics = [{ id: 't-2', author_id: 'author' }];
    db.threads = [];
    currentUserId = 'other';
    await deleteTopicAction('t-2');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses a user who is neither author nor staff when the topic exists only in threads', async () => {
    db.topics = [];
    currentUserId = 'other';
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.threads).toHaveLength(1);
    expect(deletes).toHaveLength(0);
  });

  it('does not borrow the author from the threads copy when the topic row has no author', async () => {
    db.topics = [{ id: TOPIC, author_id: null }];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(deletes).toHaveLength(0);
  });

  it('still refreshes caches when the check after the user delete fails', async () => {
    db.failNth = { table: 'topics', nth: 2 };
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(0);
    expect(revalidatePath).toHaveBeenCalledWith(`/discussions/${TOPIC}`);
  });

  it('still refreshes caches when the final threads check fails on a threads-only topic', async () => {
    db.topics = [];
    db.failNth = { table: 'threads', nth: 3 };
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.threads).toHaveLength(0);
    expect(revalidatePath).toHaveBeenCalledWith(`/discussions/${TOPIC}`);
  });
});
