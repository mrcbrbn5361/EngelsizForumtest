'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageSquare, Eye, Pin, Lock, User, Clock } from 'lucide-react';
import { BionicText } from '@/components/accessibility/bionic-text';
import { useAccessibility } from '@/components/providers/accessibility-provider';

interface Topic {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  author_id?: string;
  author?: {
    id?: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  posts_count?: number;
}

/**
 * Accessible Topic Card (WCAG 2.2 AAA)
 * Modern Discourse & Linear inspired styling.
 */
export function TopicCard({ topic }: { topic: Topic }) {
  const { bionicReading } = useAccessibility();

  return (
    <article 
      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center p-4 sm:p-5 rounded-2xl bg-card/70 hover:bg-card border border-border/80 hover:border-sky-500/30 transition-all duration-200 shadow-xs hover:shadow-md"
      aria-labelledby={`topic-title-${topic.id}`}
    >
      {/* Category Indicator & Status Icons */}
      <div className="flex flex-row sm:flex-col gap-1.5 shrink-0 items-center">
        {topic.is_pinned && (
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20" title="Sabitlenmiş Konu">
            <Pin size={16} aria-hidden="true" />
            <span className="sr-only">Sabitlenmiş Konu</span>
          </div>
        )}
        {topic.is_locked && (
          <div className="p-2 bg-muted text-muted-foreground rounded-xl border border-border/50" title="Kilitlenmiş Konu">
            <Lock size={16} aria-hidden="true" />
            <span className="sr-only">Kilitlenmiş Konu</span>
          </div>
        )}
        {!topic.is_pinned && !topic.is_locked && (
          <div className="p-2 bg-muted/40 text-muted-foreground rounded-xl border border-border/40 group-hover:border-sky-500/20 group-hover:text-sky-400 transition-colors">
            <MessageSquare size={16} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/category/${topic.category?.slug}`}
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            {topic.category?.name}
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock size={11} className="text-muted-foreground/60" />
            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}
          </span>
        </div>

        <h3 id={`topic-title-${topic.id}`} className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-sky-400 transition-colors break-words">
          <Link href={`/discussions/${topic.id}`} className="focus:outline-none focus-visible:underline after:absolute after:inset-0">
            <BionicText text={topic.title} enabled={bionicReading} />
          </Link>
        </h3>

        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-0.5">
          {topic.author?.id || (topic as any).author_id || topic.author?.username ? (
            <Link 
              href={`/profile/${topic.author?.id || (topic as any).author_id || topic.author?.username}`}
              className="flex items-center gap-1.5 truncate max-w-[150px] relative z-10 hover:text-sky-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <User size={13} className="text-sky-400/70 shrink-0" />
              <span className="truncate">{topic.author?.username || 'Anonim'}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              <User size={13} className="text-sky-400/70 shrink-0" />
              <span className="truncate">{topic.author?.username || 'Anonim'}</span>
            </div>
          )}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1">
              <MessageSquare size={13} className="text-sky-400/70" />
              {topic.posts_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} className="text-sky-400/70" />
              {topic.views_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Interaction Hint for Screen Readers */}
      <div className="sr-only">
        Konu detaylarını okumak ve yanıtlamak için Enter tuşuna basın.
      </div>
    </article>
  );
}
