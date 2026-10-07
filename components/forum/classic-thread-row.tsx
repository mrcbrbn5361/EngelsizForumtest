'use client';

import { Lock, Pin, MessageSquare, Eye, ChevronRight } from 'lucide-react';
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
  const authorId = topic.author?.id || '#';

  return (
    <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors p-4 sm:items-center justify-between gap-3">
      {/* Author Avatar & Thread Info */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black uppercase text-xs shrink-0 mt-0.5 sm:mt-0">
          {authorName.substring(0, 2)}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 m-0 font-bold text-sm text-slate-950 dark:text-white">
            {topic.is_pinned && <Pin size={13} className="text-emerald-600 shrink-0 fill-emerald-600" aria-label="Sabit Konu" />}
            {topic.is_locked && <Lock size={13} className="text-slate-400 shrink-0" aria-label="Kilitli Konu" />}
            <Link 
              href={`/discussions/${topic.id}`} 
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate block"
            >
              {topic.title}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Başlatan:</span>
            <Link href={`/profile/${authorId}`} className="font-bold text-sky-700 dark:text-sky-400 hover:underline">
              @{authorName}
            </Link>
            <span>&bull;</span>
            <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-center">
          <div className="space-y-0.5">
            <span className="block text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
              {topic.replyCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Yanıt
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-0.5">
            <span className="block text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
              {topic.viewCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Görüntüleme
            </span>
          </div>
        </div>

        <Link 
          href={`/discussions/${topic.id}`}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-600 dark:text-slate-400 hover:text-sky-700 flex items-center justify-center transition-colors shrink-0"
          aria-label={`${topic.title} konusunu oku`}
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
