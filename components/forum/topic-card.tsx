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
  author?: {
    username: string;
    avatar_url?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  posts_count?: number;
}

/**
 * Accessible Topic Card (WCAG 2.2 AAA)
 * Designed for keyboard focus and screen readers.
 */
export function TopicCard({ topic }: { topic: Topic }) {
  const { bionicReading } = useAccessibility();

  return (
    <article 
      className="vibe-card vibe-card-hover group relative flex flex-col sm:flex-row gap-6 items-start sm:items-center"
      aria-labelledby={`topic-title-${topic.id}`}
    >
      {/* Category Indicator & Status Icons */}
      <div className="flex flex-row sm:flex-col gap-2 shrink-0 items-center">
        {topic.is_pinned && (
          <div className="p-2 bg-primary/10 text-primary rounded-xl" title="Sabitlenmiş Konu">
            <Pin size={18} aria-hidden="true" />
            <span className="sr-only">Sabitlenmiş Konu</span>
          </div>
        )}
        {topic.is_locked && (
          <div className="p-2 bg-muted text-muted-foreground rounded-xl" title="Kilitlenmiş Konu">
            <Lock size={18} aria-hidden="true" />
            <span className="sr-only">Kilitlenmiş Konu</span>
          </div>
        )}
        {!topic.is_pinned && !topic.is_locked && (
          <div className="p-2 bg-muted/50 text-muted-foreground rounded-xl">
            <MessageSquare size={18} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/category/${topic.category?.slug}`}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            {topic.category?.name}
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Clock size={10} />
            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}
          </span>
        </div>

        <h3 id={`topic-title-${topic.id}`} className="text-lg sm:text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">
          <Link href={`/discussions/${topic.id}`} className="focus:outline-none after:absolute after:inset-0">
            <BionicText text={topic.title} enabled={bionicReading} />
          </Link>
        </h3>

        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-primary/60" />
            <span>{topic.author?.username || 'Anonim'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare size={14} className="text-primary/60" />
              {topic.posts_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} className="text-primary/60" />
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
