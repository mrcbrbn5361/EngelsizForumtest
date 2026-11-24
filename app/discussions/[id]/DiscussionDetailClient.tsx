'use client';

import React, { useState, useEffect } from 'react';
import { Quote, CheckCircle2, Pin, Home, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import WriteLockNotice from '@/components/layout/write-lock-notice';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { base64ToBlobUrl } from '@/lib/utils';

function DiscussionAudioPlayer({ base64 }: { base64: string }) {
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    if (!base64) return;
    try {
      const url = base64ToBlobUrl(base64, 'audio/webm');
      setBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Error creating Blob URL for discussion audio:', e);
    }
  }, [base64]);

  if (!blobUrl) {
    return <span className="text-xs text-slate-500 italic block my-2">Ses yükleniyor...</span>;
  }

  return (
    <audio controls src={blobUrl} className="w-full h-8 outline-none" />
  );
}

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  level: number;
  xp: number;
  full_name: string | null;
  bio: string | null;
}

interface CommentData {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  author?: ProfileData;
}

interface TopicData {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  created_at: string;
  author?: ProfileData;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface DiscussionDetailClientProps {
  initialTopic: TopicData;
  initialComments: CommentData[];
}

export default function DiscussionDetailClient({ initialTopic, initialComments }: DiscussionDetailClientProps) {
  const topic = initialTopic;
  const comments = initialComments;

  // Render Role with color mapping
  const mapRole = (role: string): 'YÖNETİCİ' | 'MODERATÖR' | 'UZMAN' | 'ÜYE' => {
    if (role === 'admin') return 'YÖNETİCİ';
    if (role === 'moderator') return 'MODERATÖR';
    if (role === 'uzman') return 'UZMAN';
    return 'ÜYE';
  };

  const roleColors = {
    'YÖNETİCİ': 'bg-rose-950/40 text-rose-300 border border-rose-800/60 font-semibold',
    'MODERATÖR': 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-semibold',
    'UZMAN': 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 font-semibold',
    'ÜYE': 'bg-[#18243A] text-slate-300 border border-[#1E293B] font-medium'
  };

  // Unified markdown, BBCode [QUOTE], and math equation parser
  const renderPostContent = (text: string): React.ReactNode => {
    if (!text) return null;

    // Preprocess legacy HTML audio tags with base64 data URIs to safe [AUDIO] tags
    const processedText = text.replace(/<audio[^>]+src=["'](data:audio\/[^"']+)["'][^>]*>(?:<\/audio>)?/g, '\n\n[AUDIO]$1[/AUDIO]\n\n');

    // Regex for BBCode quotes [QUOTE="Username"]content[/QUOTE]
    const quoteRegex = /\[QUOTE="([^"]*)"\]([\s\S]*?)\[\/QUOTE\]/g;

    const formatTextChunk = (chunk: string) => {
      return chunk.split('\n').map((line, lineIdx) => {
        // Audio Message Player
        if (line.includes('[AUDIO]') && line.includes('[/AUDIO]')) {
          const audioMatch = /\[AUDIO\](data:[^\]]+)\[\/AUDIO\]/.exec(line);
          if (audioMatch) {
            const audioUrl = audioMatch[1];
            return (
              <div key={lineIdx} className="my-3 p-3 bg-[#18243A] border border-[#1E293B] rounded-md flex items-center gap-3 max-w-sm">
                <div className="w-8 h-8 rounded-md bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center shrink-0">
                  <Volume2 size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sesli Mesaj</p>
                  <DiscussionAudioPlayer base64={audioUrl} />
                </div>
              </div>
            );
          }
        }

        // Markdown Headers
        if (line.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-sm font-bold text-indigo-400 mt-3 mb-1.5 uppercase tracking-wide font-heading">
              {line.substring(4)}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="text-base font-bold text-indigo-400 mt-4 mb-2 uppercase tracking-wide border-b border-[#1E293B] pb-1 font-heading">
              {line.substring(3)}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={lineIdx} className="text-lg font-bold text-indigo-400 mt-5 mb-2 uppercase tracking-wide border-b border-[#1E293B] pb-1 font-heading">
              {line.substring(2)}
            </h2>
          );
        }

        // Beautiful Math Formulas rendering
        if (line.includes('\\text') || line.includes('\\frac') || line.includes('\\times') || line.includes('\\\\')) {
          const displayMath = line
            .replace(/\\\\/g, '\\')
            .replace(/\\text{([^}]+)}/g, '$1')
            .replace(/\\times/g, ' × ')
            .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1 / $2)');

          return (
            <div key={lineIdx} className="my-3 p-3.5 bg-[#18243A] border border-[#1E293B] rounded-md font-mono text-center text-xs sm:text-sm text-indigo-300 font-medium select-all tracking-wide">
              {displayMath}
            </div>
          );
        }

        // Inline bold parsing **bold**
        let elements: React.ReactNode[] = [];
        let lastIdx = 0;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            elements.push(line.substring(lastIdx, match.index));
          }
          elements.push(<strong key={match.index} className="font-semibold text-white">{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }

        if (lastIdx < line.length) {
          elements.push(line.substring(lastIdx));
        }

        return (
          <p key={lineIdx} className="min-h-[1.25rem] leading-relaxed text-slate-200">
            {elements.length > 0 ? elements : line}
          </p>
        );
      });
    };

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = quoteRegex.exec(processedText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <React.Fragment key={`text-${lastIndex}`}>
            {formatTextChunk(processedText.substring(lastIndex, match.index))}
          </React.Fragment>
        );
      }

      const author = match[1];
      const quoteBody = match[2];

      parts.push(
        <div key={`quote-${match.index}`} className="bg-[#18243A] border border-[#1E293B] p-3.5 my-3 rounded-md text-xs text-slate-300 select-text">
          <div className="font-semibold text-indigo-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
            <Quote size={11} className="text-indigo-400" /> {author} dedi ki:
          </div>
          <div className="text-slate-300 leading-relaxed pl-1">
            {renderPostContent(quoteBody)}
          </div>
        </div>
      );

      lastIndex = quoteRegex.lastIndex;
    }

    if (lastIndex < processedText.length) {
      parts.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {formatTextChunk(processedText.substring(lastIndex))}
        </React.Fragment>
      );
    }

    return <div className="space-y-1.5 select-text">{parts}</div>;
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* Breadcrumbs */}
      <div className="bg-[#111B2E] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 border border-[#1E293B] rounded-md mb-2">
        <Link href="/" className="hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/" className="hover:text-indigo-400 font-medium transition-colors">Forumlar</Link>
        {topic.category && (
          <>
            <span className="opacity-40">/</span>
            <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-indigo-400 font-medium transition-colors">{topic.category.name}</Link>
          </>
        )}
        <span className="opacity-40">/</span>
        <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
      </div>

      {/* Thread Header */}
      <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-snug break-words flex items-center flex-wrap gap-2 font-heading">
            {topic.is_pinned && (
              <span className="bg-amber-950/40 text-amber-300 border border-amber-700/50 text-[10px] px-2 py-0.5 rounded uppercase font-semibold tracking-wider flex items-center gap-1">
                <Pin size={10} className="fill-current" /> Sabit
              </span>
            )}
            {topic.is_solved && (
              <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 text-[10px] px-2 py-0.5 rounded uppercase font-semibold tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> ÇÖZÜLDÜ
              </span>
            )}
            <span>{topic.title}</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 flex-wrap">
            <span>Konuyu başlatan: <span className="text-indigo-400 hover:underline font-semibold">@{topic.author?.username || 'Anonim'}</span></span>
            <span>&middot;</span>
            <span suppressHydrationWarning>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
            <span>&middot;</span>
            <span className="font-mono text-slate-400">Okunma: {topic.views_count || 1}</span>
          </div>
        </div>

      </div>


      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Main OP Post */}
          <article className="bg-[#111B2E] rounded-md overflow-hidden flex flex-col md:flex-row border border-[#1E293B] shadow-sm">
            {/* Mobile Author Info */}
            <div className="md:hidden bg-[#0E1726] border-b border-[#1E293B] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  src={topic.author?.avatar_url}
                  username={topic.author?.username}
                  name={topic.author?.full_name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-semibold text-indigo-400 hover:underline text-xs">
                    {topic.author?.full_name || topic.author?.username || 'Anonim'}
                  </Link>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold w-fit ${roleColors[mapRole(topic.author?.role || 'user')]}`}>
                    {mapRole(topic.author?.role || 'user')}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 font-medium">#1</div>
            </div>

            {/* Desktop Author Column */}
            <div className="hidden md:flex flex-col items-center bg-[#0E1726] shrink-0 w-44 p-4 border-r border-[#1E293B]">
              <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-semibold text-indigo-400 hover:underline text-xs mb-2 truncate max-w-full">
                @{topic.author?.username || 'Anonim'}
              </Link>
              <UserAvatar 
                src={topic.author?.avatar_url}
                username={topic.author?.username}
                name={topic.author?.full_name}
                size="lg"
                className="mb-3"
              />
              <div className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider w-full text-center mb-3 ${roleColors[mapRole(topic.author?.role || 'user')]}`}>
                {mapRole(topic.author?.role || 'user')}
              </div>
              <div className="w-full flex flex-col gap-1.5 text-xs text-slate-400">
                <div className="flex justify-between border-b border-[#1E293B] pb-1">
                  <span>Seviye:</span>
                  <span className="font-semibold text-indigo-400">{topic.author?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Puan:</span>
                  <span className="font-mono font-medium text-slate-300">{topic.author?.xp || 10} XP</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col bg-[#111B2E]">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#1E293B] text-[11px] text-slate-400 font-medium">
                <time suppressHydrationWarning>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</time>
                <span className="font-mono text-slate-400">#1</span>
              </div>

              <div className="leading-relaxed text-slate-200 text-xs sm:text-sm flex-1 min-h-[100px]">
                {renderPostContent(topic.content)}
              </div>

            </div>
          </article>

          {/* Solution & Comments Section */}
          <div className="space-y-4">
            {comments.map((comment, index) => {
              const isCommentAuthorOp = comment.author_id === topic.author_id;

              return (
                <article 
                  key={comment.id}
                  id={`comment-${comment.id}`}
                  className={`rounded-md overflow-hidden flex flex-col md:flex-row border transition-all ${
                    comment.is_solution 
                      ? 'border-emerald-500/80 bg-[#111B2E] border-2 shadow-xs' 
                      : 'border-[#1E293B] bg-[#111B2E]'
                  }`}
                >
                  {/* Mobile View Author Bar */}
                  <div className="md:hidden bg-[#0E1726] border-b border-[#1E293B] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={comment.author?.avatar_url}
                        username={comment.author?.username}
                        name={comment.author?.full_name}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-semibold text-indigo-400 hover:underline text-xs">
                            {comment.author?.full_name || comment.author?.username || 'Anonim'}
                          </Link>
                          {isCommentAuthorOp && (
                            <span className="text-[8px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-1 rounded uppercase font-semibold">OP</span>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold w-fit ${roleColors[mapRole(comment.author?.role || 'user')]}`}>
                          {mapRole(comment.author?.role || 'user')}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 font-medium">#{index + 2}</div>
                  </div>

                  {/* Desktop view Author Column */}
                  <div className="hidden md:flex flex-col items-center bg-[#0E1726] shrink-0 w-44 p-4 border-r border-[#1E293B]">
                    <div className="flex flex-col items-center max-w-full">
                      <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-semibold text-indigo-400 hover:underline text-xs mb-1 truncate max-w-full">
                        @{comment.author?.username || 'Anonim'}
                      </Link>
                      {isCommentAuthorOp && (
                        <span className="text-[9px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-1.5 rounded uppercase font-semibold mb-2">Konu Sahibi</span>
                      )}
                    </div>
                    
                    <UserAvatar 
                      src={comment.author?.avatar_url}
                      username={comment.author?.username}
                      name={comment.author?.full_name}
                      size="lg"
                      className="mb-3"
                    />
                    
                    <div className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider w-full text-center mb-3 ${roleColors[mapRole(comment.author?.role || 'user')]}`}>
                      {mapRole(comment.author?.role || 'user')}
                    </div>
                    
                    <div className="w-full flex flex-col gap-1.5 text-xs text-slate-400">
                      <div className="flex justify-between border-b border-[#1E293B] pb-1">
                        <span>Seviye:</span>
                        <span className="font-semibold text-indigo-400">{comment.author?.level || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Puan:</span>
                        <span className="font-mono font-medium text-slate-300">{comment.author?.xp || 10} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col bg-[#111B2E]">
                    <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#1E293B] text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <time suppressHydrationWarning>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}</time>
                        {comment.is_solution && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold uppercase text-[10px] tracking-wider bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                            <CheckCircle2 size={11} /> Çözüm Olarak Onaylandı
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-400">#{index + 2}</span>
                    </div>

                    <div className="leading-relaxed text-slate-200 text-xs sm:text-sm flex-1 min-h-[80px]">
                      {renderPostContent(comment.content)}
                    </div>

                  </div>
                </article>
              );
            })}
          </div>

          <WriteLockNotice />

          {/* Bottom Breadcrumbs */}
          <div className="bg-[#111B2E] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 border border-[#1E293B] rounded-md mt-4">
            <Link href="/" className="hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/" className="hover:text-indigo-400 font-medium transition-colors">Forumlar</Link>
            {topic.category && (
              <>
                <span className="opacity-40">/</span>
                <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-indigo-400 font-medium transition-colors">{topic.category.name}</Link>
              </>
            )}
            <span className="opacity-40">/</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
          </div>

        </div>

        {/* Sidebar Component */}
        <div className="lg:w-80 shrink-0">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}
