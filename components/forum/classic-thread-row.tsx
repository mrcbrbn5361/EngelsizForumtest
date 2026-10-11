'use client';

import { Lock, Pin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ClassicThreadRowProps {
  topic: {
    id: string;
    title: string;
    author: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    created_at: string;
    is_pinned: boolean;
    is_locked: boolean;
    replyCount: number;
    viewCount: number;
    lastReply?: {
      author: string;
      date: string;
    };
  };
}

export default function ClassicThreadRow({ topic }: ClassicThreadRowProps) {
  const authorName = topic.author?.username || 'Anonim';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3.5 border-b border-[#30363d] hover:bg-[#161b22] px-3 -mx-3 rounded-md transition-colors group">
      {/* Title & Author Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {topic.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-amber-300 bg-amber-950/60 border border-amber-700/60 px-1.5 py-0.5 rounded">
              <Pin size={11} className="fill-amber-300" /> Sabit
            </span>
          )}
          {topic.is_locked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold text-slate-300 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
              <Lock size={11} /> Kilitli
            </span>
          )}
          <Link 
            href={`/discussions/${topic.id}`} 
            className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition-colors block"
          >
            {topic.title}
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-sky-300">@{authorName}</span>
          <span className="text-slate-500">&middot;</span>
          <span className="font-mono text-slate-300">{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
        </div>
      </div>

      {/* Stats - Clear White / Slate Numbers */}
      <div className="flex items-center gap-6 shrink-0 text-right self-end sm:self-center">
        <div>
          <div className="text-sm font-mono font-bold text-white">
            {topic.replyCount}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Yanıt
          </div>
        </div>

        <div>
          <div className="text-sm font-mono font-bold text-white">
            {topic.viewCount}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Görüntüleme
          </div>
        </div>

        <Link 
          href={`/discussions/${topic.id}`}
          className="p-1 rounded text-slate-400 group-hover:text-white transition-colors"
          aria-label={`${topic.title} konusuna git`}
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}
