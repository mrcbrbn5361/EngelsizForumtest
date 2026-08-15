'use client';
import { toast } from 'sonner';

import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Pin, Sparkles, Loader2, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { Topic } from '@/types/database';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';
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
 * Modern Discourse & Linear inspired styling (WCAG AA).
 */
export function DiscussionCard({ topic, onSummarize, isLoading }: DiscussionCardProps) {
  const { isStaff } = useRole();

  const handleDelete = async () => {
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('topics').delete().eq('id', topic.id);
    if (error) toast.error('Silme işlemi başarısız: ' + error.message);
    else window.location.reload();
  };

  return (
    <motion.article 
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
        topic.is_pinned 
          ? 'bg-sky-500/[0.04] border-sky-500/30 shadow-[0_0_20px_-10px_rgba(14,165,233,0.15)]' 
          : 'bg-card/70 hover:bg-card border-border/80 hover:border-sky-500/30 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {topic.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-black text-sky-400 border border-sky-500/20 shrink-0">
                <Pin size={11} /> <span>SABİT</span>
              </span>
            )}
            {topic.is_solved && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle2 size={11} /> <span>ÇÖZÜLDÜ</span>
              </span>
            )}
            {topic.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-400 border border-rose-500/20 shrink-0">
                <Lock size={11} /> <span>KİLİTLİ</span>
              </span>
            )}
            <span className="text-sky-400/90 font-black truncate max-w-[140px] sm:max-w-[200px]">
              {topic.category?.name || 'GENEL'}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="whitespace-nowrap">{topic.views_count || 0} GÖRÜNTÜLENME</span>
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-bold leading-snug text-foreground group-hover:text-sky-400 transition-colors tracking-tight break-words" lang="tr">
            <Link href={`/discussions/${topic.id}`} className="outline-none focus-visible:underline after:absolute after:inset-0 after:content-[''] after:z-0">
              {topic.title}
            </Link>
          </h2>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 relative z-10 shrink-0">
          {isStaff && (
            <button
              onClick={handleDelete}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              aria-label="Tartışmayı sil"
            >
              <Trash2 size={14} />
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
              className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-bold text-sky-400 hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50 border border-sky-500/20 group/ai uppercase tracking-wider"
              aria-label="AI ile özetle"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={13} />
              ) : (
                <Sparkles size={13} className="group-hover/ai:rotate-12 transition-transform" />
              )}
              <span className="hidden sm:inline whitespace-nowrap">{isLoading ? 'ÖZETLENİYOR...' : 'AI ÖZET'}</span>
            </button>
          )}
        </div>
      </div>

      <p className="mt-2.5 line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed relative z-10 pointer-events-none font-normal">
        {topic.content}
      </p>

      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-muted-foreground relative z-10">
        <Link href={`/profile/${topic.author?.id}`} className="flex items-center gap-2 min-w-0 relative z-20 pointer-events-auto hover:opacity-80 transition-opacity">
          <UserAvatar 
            src={topic.author?.avatar_url}
            username={topic.author?.username}
            name={topic.author?.full_name}
            size="sm"
            isOnline={true}
          />
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[180px] hover:underline text-left">
              {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
            </span>
            <UserRoleBadge role={topic.author?.role} size="xs" />
          </div>
        </Link>

        <div className="flex items-center gap-3 text-muted-foreground/80 shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={12} className="text-sky-400/80" />
            <span className="font-medium">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <MessageSquare size={12} className="text-sky-400/80" />
            <span className="font-bold text-foreground">{(topic.comments as any)?.[0]?.count || (topic as any).comments_count || 0}</span>
            <span className="hidden sm:inline">YANIT</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
