'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User, Calendar, Pin, Sparkles, Loader2 } from 'lucide-react';
import { Topic } from '@/types/database';
import Image from 'next/image';

import Link from 'next/link';

interface DiscussionCardProps {
  topic: Topic;
  onSummarize: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Accessible Discussion Card with AI Summary feature.
 */
export function DiscussionCard({ topic, onSummarize, isLoading }: DiscussionCardProps) {
  return (
    <motion.article 
      whileHover={{ y: -4 }}
      className="group relative flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            {topic.is_pinned && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] md:text-xs font-bold text-primary shrink-0">
                <Pin size={10} className="md:w-3 md:h-3" /> <span className="hidden sm:inline">SABİT</span>
              </span>
            )}
            {topic.is_solved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[10px] md:text-xs font-bold text-green-600 shrink-0">
                ÇÖZÜLDÜ
              </span>
            )}
            {topic.is_locked && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[10px] md:text-xs font-bold text-red-600 shrink-0">
                KİLİTLİ
              </span>
            )}
            <span className="truncate">
              {topic.category?.name || 'GENEL'}
            </span>
          </div>
          <h2 className="text-lg md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors tracking-tight break-words">
            <Link href={`/discussions/${topic.id}`} className="outline-none after:absolute after:inset-0 after:z-0">
              {topic.title}
            </Link>
          </h2>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSummarize(topic.id);
          }}
          disabled={isLoading}
          className="relative z-10 flex h-9 md:h-11 items-center justify-center gap-2 rounded-xl bg-primary/5 px-3 md:px-5 text-[10px] md:text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 border border-primary/10 group/ai uppercase tracking-widest"
          aria-label="AI ile özetle"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Sparkles size={14} className="group-hover/ai:rotate-12 transition-transform" />
          )}
          <span className="hidden sm:inline">{isLoading ? 'ÖZETLENİYOR...' : 'AI ÖZETLE'}</span>
        </button>
      </div>

      <p className="line-clamp-2 text-sm md:text-base text-muted-foreground leading-relaxed relative z-10 pointer-events-none font-medium">
        {topic.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-muted-foreground relative z-10 pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-5 w-5 md:h-7 md:w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
            {topic.author?.avatar_url ? (
              <Image src={topic.author.avatar_url} alt="" width={28} height={28} className="object-cover h-full w-full" unoptimized referrerPolicy="no-referrer" />
            ) : (
              <User size={12} />
            )}
          </div>
          <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-none">{topic.author?.full_name || topic.author?.username || 'Kullanıcı'}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70 whitespace-nowrap">
          <Calendar size={12} className="md:w-3.5 md:h-3.5" />
          <span className="font-bold tracking-wider uppercase">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70 whitespace-nowrap">
          <MessageSquare size={12} className="md:w-3.5 md:h-3.5" />
          <span className="font-bold tracking-wider uppercase">{(topic.comments as any)?.[0]?.count || 0} YANIT</span>
        </div>
      </div>
    </motion.article>
  );
}
