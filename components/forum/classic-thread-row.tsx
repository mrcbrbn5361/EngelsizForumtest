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
  return (
    <div className="flex bg-[#111726]/60 border-b border-white/[0.08] hover:bg-white/[0.02] transition-all duration-200 p-3 items-center min-h-[60px]">
      {/* Author Avatar */}
      <div className="w-12 shrink-0 hidden sm:block">
        <div className="w-10 h-10 bg-slate-800 rounded-full border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold uppercase text-xs">
          {topic.author.username.substring(0, 2)}
        </div>
      </div>

      {/* Thread Info */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5 mb-0.5">
          {topic.is_pinned && <Pin size={12} className="text-emerald-400 shrink-0" />}
          {topic.is_locked && <Lock size={12} className="text-slate-500 shrink-0" />}
          <Link href={`/discussions/${topic.id}`} className="text-sky-400 hover:text-sky-300 font-semibold hover:underline text-[15px] truncate block">
            {topic.title}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Link href={`/uyeler/${topic.author.id}`} className="hover:underline font-medium text-sky-400">
            {topic.author.username}
          </Link>
          <span className="text-slate-600">•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex w-32 shrink-0 flex-col justify-center text-center px-2 border-l border-r border-white/[0.08]">
        <div className="text-[12px] font-mono text-slate-400">
          <span className="text-slate-500 mr-1">C:</span>
          <span className="font-semibold text-slate-200">{topic.replyCount}</span>
        </div>
        <div className="text-[12px] font-mono text-slate-400">
          <span className="text-slate-500 mr-1">G:</span>
          <span className="font-semibold text-slate-200">{topic.viewCount}</span>
        </div>
      </div>

      {/* Last Post */}
      <div className="hidden lg:flex w-48 shrink-0 flex-col justify-center pl-4 text-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-800 rounded shrink-0 border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold text-[10px] uppercase">
            {(topic.lastReply?.author || topic.author.username).substring(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sky-400 truncate">
              {topic.lastReply?.author || topic.author.username}
            </span>
            <span className="text-slate-500 text-[10px]">
              {topic.lastReply?.date || formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
