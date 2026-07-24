'use client';
import { toast } from 'sonner';

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, User, Calendar, Pin, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Topic } from '@/types/database';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/use-role';
import Link from 'next/link';

interface DiscussionCardProps {
  topic: Topic;
  onSummarize?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Accessible Discussion Card with AI Summary feature.
 */
export function DiscussionCard({ topic, onSummarize, isLoading }: DiscussionCardProps) {
  const { isStaff } = useRole();

  // ... rest of the component
  
  // In the JSX, conditionally render the AI button:
  // {onSummarize && (
  //   <button ... onClick={(e) => { ... onSummarize(topic.id); }} ...>
  // ...

  const handleDelete = async () => {
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('topics').delete().eq('id', topic.id);
    if (error) toast.error('Silme işlemi başarısız: ' + error.message);
    else window.location.reload();
  };

  return (
    <motion.article 
      whileHover={{ y: -4 }}
      className={`vibe-card vibe-card-hover relative p-6 md:p-8 ${
        topic.is_pinned 
          ? 'border-primary/30 bg-primary/[0.02] shadow-[0_0_20px_-12px_rgba(var(--primary),0.2)]' 
          : ''
      }`}
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
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{topic.views_count || 0} GÖRÜNTÜLENME</span>
          </div>
          <h2 className="text-lg md:text-2xl font-black leading-tight group-hover:text-primary transition-colors tracking-tight [overflow-wrap:anywhere] [hyphens:auto]" lang="tr">
            <Link href={`/discussions/${topic.id}`} className="outline-none after:absolute after:inset-0 after:content-[''] after:z-0">
              {topic.title}
            </Link>
          </h2>
        </div>
        
        <div className="flex gap-2 relative z-10">
          {isStaff && (
            <button
              onClick={handleDelete}
              className="flex h-9 md:h-11 items-center justify-center rounded-xl bg-red-500/10 px-3 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
              aria-label="Tartışmayı sil"
            >
              <Trash2 size={16} />
            </button>
          )}

          {onSummarize && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSummarize(topic.id);
              }}
              disabled={isLoading}
              className="flex h-9 md:h-11 items-center justify-center gap-2 rounded-xl bg-primary/5 px-3 md:px-5 text-[10px] md:text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 border border-primary/10 group/ai uppercase tracking-widest"
              aria-label="AI ile özetle"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Sparkles size={14} className="group-hover/ai:rotate-12 transition-transform" />
              )}
              <span className="hidden sm:inline">{isLoading ? 'ÖZETLENİYOR...' : 'AI ÖZETLE'}</span>
            </button>
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-sm md:text-base text-muted-foreground leading-relaxed relative z-10 pointer-events-none font-medium">
        {topic.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-muted-foreground relative z-10">
        <Link href={`/profile/${topic.author?.id}`} className="flex items-center gap-2 min-w-0 relative z-20 pointer-events-auto hover:opacity-80 transition-opacity">
          <div className="h-5 w-5 md:h-7 md:w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
            <img 
              src={topic.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${topic.author?.username || 'user'}`} 
              alt={`${topic.author?.username || 'Kullanıcı'} profil resmi`} 
              width={28} 
              height={28} 
              className="object-cover h-full w-full" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-none hover:underline text-left">
              {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
            </span>
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-80 text-left">
              {topic.author?.role === 'admin' ? 'YÖNETİCİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
            </span>
          </div>
        </Link>
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
