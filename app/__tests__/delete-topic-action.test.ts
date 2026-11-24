import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, any>;

const db: {
  topics: Row[];
  profiles: Row[];
  rlsBlocksDelete: boolean;
  failSelect: string[];
  failDelete: string[];
  failNth: { table: string; nth: number } | null;
} = {
  topics: [],
  profiles: [],
  rlsBlocksDelete: false,
  failSelect: [],
  failDelete: [],
  failNth: null,
};
const selectCounts: Record<string, number> = {};
const revalidatePath = vi.hoisted(() => vi.fn());
let currentUserId: string | null = null;
let deletes: string[] = [];

/**
 * Minimal stand-in for the Supabase query builder. It mimics row-level security on topics
 * (author or staff only, and silently nothing when blocked). Every delete is recorded.
 */
function fakeFrom(table: 'topics' | 'profiles') {
  return {
    select: () => ({
      eq: (col: string, val: any) => ({
        maybeSingle: async () => {
          selectCounts[table] = (selectCounts[table] ?? 0) + 1;
          if (db.failSelect.includes(table)) return { data: null, error: { message: 'raw select failure' } };
          if (db.failNth?.table === table && db.failNth.nth === selectCounts[table]) return { data: null, error: { message: 'raw select failure' } };
          return { data: db[table].find(r => r[col] === val) ?? null, error: null };
        },
      }),
    }),
    delete: () => ({
      eq: async (col: string, val: any) => {
        deletes.push(table);
        if (db.failDelete.includes(table)) return { error: { message: 'raw delete failure' } };
        if (db.rlsBlocksDelete) return { error: null };
        const me = db.profiles.find(p => p.id === currentUserId);
        const staff = me?.role === 'admin' || me?.role === 'moderator';
        const target = db[table].find(r => r[col] === val);
        if (!staff && target?.author_id !== currentUserId) return { error: null };
        db[table] = db[table].filter((r: Row) => r[col] !== val);
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
    from: (table: 'topics' | 'profiles') => fakeFrom(table),
  }),
}));

const { deleteTopicAction } = await import('@/app/actions');

const TOPIC = 't-1';

describe('deleteTopicAction', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    db.topics = [{ id: TOPIC, author_id: 'author' }];
    db.profiles = [
      { id: 'author', role: 'user' },
      { id: 'other', role: 'user' },
      { id: 'mod', role: 'moderator' },
    ];
    db.rlsBlocksDelete = false;
    db.failSelect = [];
    db.failDelete = [];
    db.failNth = null;
    Object.keys(selectCounts).forEach(key => delete selectCounts[key]);
    deletes = [];
    revalidatePath.mockClear();
    currentUserId = 'author';
  });

  it('removes the topic for its author', async () => {
    const result = await deleteTopicAction(TOPIC);
    expect(result).toEqual({ success: true });
    expect(db.topics).toHaveLength(0);
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
  });

  it('refuses an anonymous request', async () => {
    currentUserId = null;
    expect((await deleteTopicAction(TOPIC)).success).toBe(false);
    expect(db.topics).toHaveLength(1);
  });

  it('reports a missing topic instead of claiming success', async () => {
    db.topics = [];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
  });

  it('stops and keeps the topic when row-level security blocks the delete', async () => {
    db.rlsBlocksDelete = true;
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(1);
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
  });

  it('does not let a failed role lookup turn into an unchecked delete', async () => {
    currentUserId = 'mod';
    db.failSelect = ['profiles'];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(deletes).toHaveLength(0);
  });

  it('hides raw database errors and refreshes caches when the delete itself fails', async () => {
    db.failDelete = ['topics'];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(result.error).not.toContain('raw delete failure');
    expect(revalidatePath).toHaveBeenCalledWith(`/discussions/${TOPIC}`);
  });

  it('refreshes caches after a normal delete and not after a refusal', async () => {
    await deleteTopicAction(TOPIC);
    expect(revalidatePath).toHaveBeenCalledWith('/discussions');
    revalidatePath.mockClear();
    db.topics = [{ id: 't-2', author_id: 'author' }];
    currentUserId = 'other';
    await deleteTopicAction('t-2');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('does not borrow ownership when the topic row has no author', async () => {
    db.topics = [{ id: TOPIC, author_id: null }];
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(deletes).toHaveLength(0);
  });

  it('still refreshes caches when the check after the delete fails', async () => {
    db.failNth = { table: 'topics', nth: 2 };
    const result = await deleteTopicAction(TOPIC);
    expect(result.success).toBe(false);
    expect(db.topics).toHaveLength(0);
    expect(revalidatePath).toHaveBeenCalledWith(`/discussions/${TOPIC}`);
  });
});
