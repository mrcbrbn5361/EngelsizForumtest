'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  MessageSquare, Calendar, Pin, Sparkles, Loader2, Trash2, 
  CheckCircle2, Lock, Eye, ArrowUpRight, Heart
} from 'lucide-react';
import { Topic } from '@/types/database';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/use-role';
import { toast } from 'sonner';
import { formatCompactNumber } from '@/lib/utils';
import { isUserOnline } from '@/lib/presence';

interface DiscussionCardProps {
  topic: Topic;
  onSummarize?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Accessible, Modernized Discussion Card for EngelsizForum.
 * Strictly WCAG AA compliant, high-contrast dark theme, micro-interactions.
 */
export function DiscussionCard({ topic, onSummarize, isLoading }: DiscussionCardProps) {
  const { isStaff } = useRole();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('topics').delete().eq('id', topic.id);
    if (error) {
      toast.error('Silme işlemi başarısız: ' + error.message);
    } else {
      toast.success('Tartışma silindi.');
      window.location.reload();
    }
  };

  const commentsCount = (topic.comments as any)?.[0]?.count ?? (topic as any).comments_count ?? 0;
  const likesCount = (topic as any).likes_count ?? 0;
  const authorName = topic.author?.full_name || topic.author?.username || 'Topluluk Üyesi';
  const authorTargetId = topic.author?.id || (topic as any).author_id || topic.author?.username;
  const authorProfileHref = authorTargetId ? `/profile/${authorTargetId}` : '#';

  return (
    <motion.article 
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      id={`topic-card-${topic.id}`}
      aria-labelledby={`topic-title-${topic.id}`}
      className={`group relative p-4 sm:p-5 md:p-6 rounded-2xl border transition-all duration-200 ${
        topic.is_pinned 
          ? 'bg-[#111726]/90 border-sky-500/40 shadow-xs' 
          : 'bg-[#111726]/80 hover:bg-[#151d30] border-white/[0.08] hover:border-sky-500/40 shadow-xs hover:shadow-lg backdrop-blur-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          
          {/* Metadata badges row */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-medium text-slate-400">
            {topic.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/30 shrink-0">
                <Pin size={11} aria-hidden="true" />
                <span>Sabit</span>
              </span>
            )}
            {topic.is_solved && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 size={11} aria-hidden="true" />
                <span>Çözüldü</span>
              </span>
            )}
            {topic.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30 shrink-0">
                <Lock size={11} aria-hidden="true" />
                <span>Kilitli</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold truncate max-w-[160px] sm:max-w-[220px]">
              {topic.category?.name || 'Genel Danışma'}
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline-flex items-center gap-1">
              <Eye size={12} className="text-sky-400/80" aria-hidden="true" />
              <span>{formatCompactNumber(topic.views_count || 0)} görüntülenme</span>
            </span>
          </div>

          {/* Title with link */}
          <h2 id={`topic-title-${topic.id}`} className="text-base sm:text-lg md:text-xl font-bold leading-snug text-slate-100 group-hover:text-sky-400 transition-colors tracking-tight break-words" lang="tr">
            <Link 
              href={`/discussions/${topic.id}`} 
              className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111726] rounded-sm after:absolute after:inset-0 after:content-[''] after:z-0 flex items-center justify-between gap-2"
            >
              <span>{topic.title}</span>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 hidden sm:inline-block" aria-hidden="true" />
            </Link>
          </h2>
        </div>
        
        {/* Actions header */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative z-10 shrink-0">
          {isStaff && (
            <button
              onClick={handleDelete}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 cursor-pointer"
              aria-label={`"${topic.title}" başlıklı tartışmayı sil`}
              title="Tartışmayı sil"
            >
              <Trash2 size={14} aria-hidden="true" />
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
              className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 px-2.5 sm:px-3 text-[11px] font-bold text-sky-400 hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50 border border-sky-500/20 group/ai uppercase tracking-wider cursor-pointer"
              aria-label={`"${topic.title}" konusunu yapay zeka ile özetle`}
              title="Tartışmayı AI ile hızlıca özetle"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={13} aria-hidden="true" />
              ) : (
                <Sparkles size={13} className="group-hover/ai:rotate-12 transition-transform" aria-hidden="true" />
              )}
              <span className="hidden sm:inline whitespace-nowrap">{isLoading ? 'Özetleniyor...' : 'AI Özet'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Snippet preview */}
      {topic.content && (
        <p className="mt-2.5 line-clamp-2 text-xs sm:text-sm text-slate-400 leading-relaxed relative z-10 pointer-events-none font-normal">
          {topic.content}
        </p>
      )}

      {/* Card footer: Author info & meta */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-slate-400 relative z-10">
        <Link 
          href={authorProfileHref} 
          className="flex items-center gap-2.5 min-w-0 relative z-20 pointer-events-auto hover:opacity-80 transition-opacity"
          aria-label={`${authorName} adlı kullanıcının profili`}
        >
          <UserAvatar 
            src={topic.author?.avatar_url}
            username={topic.author?.username}
            name={topic.author?.full_name}
            size="sm"
            isOnline={isUserOnline(topic.author?.last_seen_at)}
          />
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[200px] hover:underline text-left">
              {authorName}
            </span>
            <UserRoleBadge role={topic.author?.role} size="xs" />
          </div>
        </Link>

        <div className="flex items-center gap-3.5 text-slate-400 shrink-0 font-medium">
          {likesCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-rose-400 font-semibold" title={`${likesCount} beğeni`}>
              <Heart size={12} className="fill-rose-400" aria-hidden="true" />
              <span>{formatCompactNumber(likesCount)}</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={12} className="text-sky-400" aria-hidden="true" />
            <time dateTime={topic.created_at}>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</time>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-200 border border-white/[0.04] font-semibold">
            <MessageSquare size={12} className="text-sky-400" aria-hidden="true" />
            <span>{formatCompactNumber(commentsCount)}</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">yanıt</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
