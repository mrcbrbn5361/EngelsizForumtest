import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { count: number | null; error: { message: string } | null };

const results: { total: Result; active: Result } = {
  total: { count: 0, error: null },
  active: { count: 0, error: null },
};

/**
 * Stand-in for the count queries: the plain select is the total, the `.gt` variant is active.
 */
function countQuery() {
  return {
    select: () => {
      const total = Promise.resolve(results.total) as Promise<Result> & { gt: () => Promise<Result> };
      total.gt = () => Promise.resolve(results.active);
      return total;
    },
  };
}

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
vi.mock('next/cache', () => ({ revalidatePath: () => {} }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({}) }));
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: { from: () => countQuery() },
  getSupabaseServer: () => ({}),
}));

const { getVisitorStats } = await import('@/app/actions');

describe('getVisitorStats', () => {
  beforeEach(() => {
    results.total = { count: 12, error: null };
    results.active = { count: 3, error: null };
  });

  it('returns the real counts', async () => {
    expect(await getVisitorStats()).toEqual({ total_visitors: 12, active_visitors: 3 });
  });

  it('treats an empty table as zero', async () => {
    results.total = { count: null, error: null };
    results.active = { count: null, error: null };
    expect(await getVisitorStats()).toEqual({ total_visitors: 0, active_visitors: 0 });
  });

  it('throws instead of reporting zeros when the total query fails', async () => {
    results.total = { count: null, error: { message: 'down' } };
    await expect(getVisitorStats()).rejects.toThrow('Visitor stats unavailable');
  });

  it('throws instead of reporting zeros when the active query fails', async () => {
    results.active = { count: null, error: { message: 'down' } };
    await expect(getVisitorStats()).rejects.toThrow('Visitor stats unavailable');
  });
});
