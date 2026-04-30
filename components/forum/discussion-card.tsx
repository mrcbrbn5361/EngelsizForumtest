'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User, Calendar, Pin, Sparkles } from 'lucide-react';
import { Topic } from '@/types/database';

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
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {topic.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                <Pin size={12} /> Sabitlendi
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {topic.category?.name || topic.category_id}
            </span>
          </div>
          <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors break-words">
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
          className="relative z-10 flex h-10 items-center gap-2 rounded-full bg-primary/5 px-4 text-xs font-bold text-primary hover:bg-primary/10 transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Bu tartışmayı AI ile özetle"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles size={14} />
          )}
          <span className="hidden sm:inline">{isLoading ? 'Özetleniyor...' : 'AI Özetle'}</span>
        </button>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed relative z-10 pointer-events-none">
        {topic.content}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground relative z-10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          {(() => {
            console.log('DiscussionCard debug - topic author:', topic.author);
            return topic.author?.avatar_url ? (
              <img src={topic.author.avatar_url} alt={topic.author.username || 'User'} className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <User size={14} />
            );
          })()}
          <span>{topic.author?.username || 'Anonim'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={14} />
          <span>{topic.comments?.length || 0} Yanıt</span>
        </div>
      </div>
    </motion.article>
  );
}
