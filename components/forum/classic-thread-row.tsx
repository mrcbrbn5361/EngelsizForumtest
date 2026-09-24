'use client';

import { Lock, Pin, MessageSquare, Eye } from 'lucide-react';
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
    <div className="flex bg-white border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all duration-200 p-3 items-center min-h-[60px]">
      {/* Author Avatar */}
      <div className="w-12 shrink-0 hidden sm:block">
        <div className="w-10 h-10 bg-[#eef2f7] rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#185886] font-bold uppercase text-xs">
          {authorName.substring(0, 2)}
        </div>
      </div>

      {/* Thread Info */}
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="flex items-center gap-1.5 mb-0.5 m-0 font-bold text-[15px]">
          {topic.is_pinned && <Pin size={12} className="text-emerald-600 shrink-0" aria-label="Sabit Konu" />}
          {topic.is_locked && <Lock size={12} className="text-slate-400 shrink-0" aria-label="Kilitli Konu" />}
          <Link href={`/discussions/${topic.id}`} className="text-[#185886] hover:text-[#104f75] hover:underline truncate block">
            {topic.title}
          </Link>
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Link href={`/profile/${authorId}`} className="hover:underline font-bold text-[#0066a2]">
            {authorName}
          </Link>
          <span className="text-slate-300">•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex w-32 shrink-0 flex-col justify-center text-center px-2 border-l border-r border-[#e2e8f0]">
        <div className="text-[12px] font-mono text-slate-500">
          <span className="text-slate-400 mr-1">Cevap:</span>
          <span className="font-bold text-slate-700">{topic.replyCount}</span>
        </div>
        <div className="text-[12px] font-mono text-slate-500">
          <span className="text-slate-400 mr-1">Gör:</span>
          <span className="font-bold text-slate-700">{topic.viewCount}</span>
        </div>
      </div>

      {/* Last Post */}
      <div className="hidden lg:flex w-48 shrink-0 flex-col justify-center pl-4 text-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#eef2f7] rounded shrink-0 border border-[#cbd5e1] flex items-center justify-center text-[#185886] font-bold text-[10px] uppercase">
            {(topic.lastReply?.author || authorName).substring(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[#0066a2] truncate">
              {topic.lastReply?.author || authorName}
            </span>
            <span className="text-slate-400 text-[10px]">
              {topic.lastReply?.date || formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
