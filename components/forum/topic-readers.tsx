'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { countReaders, describeReaders, type ReaderSummary } from '@/lib/topic-presence';

/**
 * "Bu konuyu şu an okuyanlar" box shown under a topic. Not a live region on purpose:
 * readers coming and going should not interrupt screen-reader users.
 */
export function TopicReaders({ summary }: { summary: ReaderSummary | null }) {
  if (!summary) return null;
  const { members, hiddenMembers, guests } = summary;
  const others = [
    ...(hiddenMembers ? [`${hiddenMembers} gizli üye`] : []),
    ...(guests ? [`${guests} misafir`] : []),
  ];
  const total = countReaders(summary);

  return (
    <section aria-labelledby="topic-readers-title" className="bg-surface-raised border border-line rounded-md px-4 py-3 text-xs text-fg-3">
      <h2 id="topic-readers-title" className="flex items-center gap-2 font-bold text-fg-2 mb-1.5">
        <Eye size={14} aria-hidden="true" className="text-indigo-400 light:text-indigo-700" />
        Bu konuyu şu an okuyanlar ({total})
      </h2>
      <p className="leading-relaxed" aria-label={describeReaders(summary)}>
        {members.map((m, i) => (
          <React.Fragment key={m.userId}>
            {i > 0 && ', '}
            <Link href={`/profile/${m.userId}`} className="font-semibold text-indigo-400 light:text-indigo-700 hover:underline">
              {m.username}
            </Link>
          </React.Fragment>
        ))}
        {members.length > 0 && others.length > 0 && (others.length === 1 ? ' ve ' : ', ')}
        {others.join(' ve ')}
        {total === 0 && 'Şu an başka okuyan yok.'}
      </p>
    </section>
  );
}
