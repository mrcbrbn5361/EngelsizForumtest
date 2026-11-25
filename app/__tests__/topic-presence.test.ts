import { describe, expect, it } from 'vitest';
import { countReaders, describeReaders, summarizeReaders } from '@/lib/topic-presence';

const ali = { kind: 'member' as const, userId: 'u1', username: 'ali' };
const ayse = { kind: 'member' as const, userId: 'u2', username: 'ayşe' };
const gizli = { kind: 'member' as const, hidden: true as const };
const guest = { kind: 'guest' as const };

describe('summarizeReaders', () => {
  it('lists members by name, counts hidden members and guests', () => {
    const s = summarizeReaders({ t1: [ayse], t2: [ali], t3: [gizli], g1: [guest], g2: [guest] });
    expect(s.members.map((m) => m.username)).toEqual(['ali', 'ayşe']);
    expect(s.hiddenMembers).toBe(1);
    expect(s.guests).toBe(2);
    expect(countReaders(s)).toBe(5);
  });

  it('counts each presence key (one person, all their tabs) once', () => {
    const s = summarizeReaders({ 'm:u1': [ali, ali], anonA: [gizli, gizli] });
    expect(s.members).toHaveLength(1);
    expect(s.hiddenMembers).toBe(1);
  });

  it('carries no account information for hidden members', () => {
    expect(Object.keys(gizli)).toEqual(['kind', 'hidden']);
  });

  it('ignores empty entries', () => {
    expect(countReaders(summarizeReaders({ x: [], y: undefined }))).toBe(0);
  });
});

describe('describeReaders', () => {
  it('builds a natural Turkish list', () => {
    expect(describeReaders({ members: [{ userId: 'u1', username: 'ali' }], hiddenMembers: 1, guests: 3 })).toBe('ali, 1 gizli üye ve 3 misafir');
    expect(describeReaders({ members: [], hiddenMembers: 0, guests: 2 })).toBe('2 misafir');
    expect(describeReaders({ members: [], hiddenMembers: 0, guests: 0 })).toBe('Şu an başka okuyan yok.');
  });
});
