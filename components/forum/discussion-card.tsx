'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User, Calendar, Pin, Sparkles } from 'lucide-react';
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
      className="group relative flex flex-col gap-3 md:gap-4 rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-6 shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
    >
      <div className="flex items-start justify-between gap-2 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 md:mb-2 flex items-center gap-2">
            {topic.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] md:text-xs font-bold text-primary shrink-0">
                <Pin size={10} className="md:w-3 md:h-3" /> Sabit
              </span>
            )}
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {topic.category?.name || topic.category_id}
            </span>
          </div>
          <h2 className="text-base md:text-xl font-bold leading-tight group-hover:text-primary transition-colors break-words line-clamp-2 md:line-clamp-none">
            <Link href={`/discussions/${topic.id}`} className="hover:underline outline-none after:absolute after:inset-0 after:z-0">
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
          className="relative z-10 flex h-8 md:h-10 items-center justify-center gap-2 rounded-full bg-primary/5 px-3 md:px-4 text-[10px] md:text-xs font-bold text-primary hover:bg-primary/10 transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Bu tartışmayı AI ile özetle"
        >
          {isLoading ? (
            <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
          )}
          <span className="hidden sm:inline">{isLoading ? 'Özetleniyor...' : 'AI Özetle'}</span>
        </button>
      </div>

      <p className="line-clamp-2 text-xs md:text-sm text-muted-foreground leading-relaxed relative z-10 pointer-events-none">
        {topic.content}
      </p>

      <div className="mt-1 md:mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-muted-foreground relative z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          {(() => {
            return topic.author?.avatar_url ? (
              <div className="relative h-4 w-4 md:h-5 md:w-5 rounded-full overflow-hidden shrink-0">
                <Image 
                  src={topic.author.avatar_url} 
                  alt={topic.author.username || 'User'} 
                  fill
                  className="object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <User size={12} className="md:w-3.5 md:h-3.5" />
            );
          })()}
          <span className="truncate">{topic.author?.username || 'Anonim'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="md:w-3.5 md:h-3.5" />
          <span>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={12} className="md:w-3.5 md:h-3.5" />
          <span>{topic.comments?.length || 0} Yanıt</span>
        </div>
      </div>
    </motion.article>
  );
}
