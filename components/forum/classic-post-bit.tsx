'use client';

import { ThumbsUp, Quote, Flag, MessageSquare, ExternalLink, ShieldCheck, Volume2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { base64ToBlobUrl } from '@/lib/utils';

interface ClassicPostBitProps {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: 'YÖNETİCİ' | 'MODERATÖR' | 'UZMAN' | 'ÜYE';
    joinedDate: string;
    messageCount: string;
    likeScore: string;
    isOnline: boolean;
  };
  content: string;
  date: string;
  postNumber: string;
  signature?: string;
}

function AudioPlayer({ base64 }: { base64: string }) {
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
    <div className="my-3 p-3 rounded-lg bg-slate-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-3 max-w-md shadow-inner">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
          <Volume2 size={16} className="animate-pulse" />
        </div>
        <span className="text-xs font-bold text-amber-200 shrink-0">Sesli Mesaj</span>
      </div>
      <audio controls src={blobUrl} className="w-full h-8 max-w-xs accent-amber-500 text-xs" />
    </div>
  );
}

function renderPostContent(text: string) {
  if (!text) return null;

  // Preprocess HTML audio tags to [AUDIO] format
  const processedText = text.replace(/<audio[^>]+src=["'](data:audio\/[^"']+)["'][^]*>(?:<\/audio>)?/g, '[AUDIO]$1');

  const parts = [];
  let currentIndex = 0;
  const regex = /\[AUDIO\](data:audio\/[a-zA-Z0-9-+/;.,=_]+)/g;
  let match;

  while ((match = regex.exec(processedText)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > currentIndex) {
      parts.push(<span key={`text-${currentIndex}`}>{processedText.substring(currentIndex, matchIndex)}</span>);
    }

    const base64Data = match[1];
    parts.push(<AudioPlayer key={`audio-${matchIndex}`} base64={base64Data} />);
    currentIndex = regex.lastIndex;
  }

  if (currentIndex < processedText.length) {
    parts.push(<span key="text-end">{processedText.substring(currentIndex)}</span>);
  }

  return parts.length > 0 ? parts : processedText;
}

export default function ClassicPostBit({ 
  id, 
  author, 
  content, 
  date, 
  postNumber, 
  signature 
}: ClassicPostBitProps) {
  
  const roleColors = {
    'YÖNETİCİ': 'bg-red-500/10 text-red-400 border border-red-500/20 font-black',
    'MODERATÖR': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black',
    'UZMAN': 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black',
    'ÜYE': 'bg-slate-800 text-slate-300 border border-white/[0.08]'
  };

  return (
    <article className="xf-post rounded-sm overflow-hidden flex flex-col md:flex-row border border-white/[0.08]">
      {/* Mobile Author Bar (Visible only on < 768px) */}
      <div className="md:hidden bg-[#0b0f19] border-b border-white/[0.08] p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-slate-800 rounded-full border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold uppercase text-xs">
              {author.name.substring(0, 2)}
            </div>
            {author.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#090A0F] shadow-sm"></div>
            )}
          </div>
          <div className="flex flex-col">
            <Link href={`/uyeler/${author.name}`} className="font-bold text-sky-400 hover:text-sky-300 hover:underline">
              {author.name}
            </Link>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[author.role]}`}>
              {author.role}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          #{postNumber}
        </div>
      </div>

      {/* Desktop Author Column (Visible only on > 768px) */}
      <div className="xf-post-author hidden md:flex flex-col items-center bg-[#0b0f19]/80">
        <Link href={`/uyeler/${author.name}`} className="font-bold text-sky-400 hover:text-sky-300 text-lg hover:underline mb-2">
          {author.name}
        </Link>
        
        <div className="relative mb-3">
          <div className="w-24 h-24 bg-slate-800 rounded border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold uppercase text-2xl">
            {author.name.substring(0, 2)}
          </div>
          {author.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#090A0F] shadow-md" title="Çevrimiçi"></div>
          )}
        </div>

        <div className={`text-[11px] px-3 py-1 rounded-sm font-bold w-full text-center mb-3 ${roleColors[author.role]}`}>
          {author.role}
        </div>

        <div className="w-full flex flex-col gap-1 text-[11px] text-slate-400 text-left px-2">
          <div className="flex justify-between">
            <span>Katılım:</span>
            <span className="font-semibold text-slate-200">{author.joinedDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Mesajlar:</span>
            <span className="font-semibold text-slate-200">{author.messageCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Beğeni:</span>
            <span className="font-semibold text-slate-200">{author.likeScore}</span>
          </div>
        </div>

        {author.role === 'YÖNETİCİ' && (
          <div className="mt-4 text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 flex items-center gap-1.5 text-[10px] font-black">
            <ShieldCheck size={14} />
            DOĞRULANMIŞ
          </div>
        )}
      </div>

      {/* Message Content Column */}
      <div className="xf-post-content bg-[#111726]/60">
        {/* Post Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/[0.08] text-[12px] text-slate-400">
          <time dateTime={date}>{date}</time>
          <div className="flex items-center gap-3">
            <Link href={`#post-${id}`} className="hover:text-sky-400 text-slate-400 font-mono">#{postNumber}</Link>
          </div>
        </div>

        {/* Post Body */}
        <div className="xf-post-body leading-relaxed text-slate-200">
          {renderPostContent(content)}
        </div>

        {/* Signature */}
        {signature && (
          <div className="xf-post-signature italic text-slate-400">
            {signature}
          </div>
        )}

        {/* Post Actions Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/[0.04]">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-[12px] font-bold text-sky-400 hover:bg-white/[0.04] px-2 py-1 rounded transition-colors group">
              <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
              Beğen
            </button>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-bold text-sky-400">
            <button className="flex items-center gap-1.5 hover:bg-white/[0.04] px-2 py-1 rounded transition-colors">
              <Quote size={14} />
              Cevapla
            </button>
            <button className="flex items-center gap-1.5 hover:bg-white/[0.04] px-2 py-1 rounded transition-colors hidden sm:flex">
              <MessageSquare size={14} />
              Alıntı Yap
            </button>
            <div className="w-[1px] h-3 bg-white/[0.08] hidden sm:block mx-1"></div>
            <button className="text-slate-500 hover:text-red-400 font-medium transition-colors">
              Rapor Et
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
