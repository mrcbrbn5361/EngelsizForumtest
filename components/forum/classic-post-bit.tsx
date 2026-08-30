'use client';

import { ThumbsUp, Quote, Flag, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

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

export default function ClassicPostBit({ 
  id, 
  author, 
  content, 
  date, 
  postNumber, 
  signature 
}: ClassicPostBitProps) {
  
  const roleColors = {
    'YÖNETİCİ': 'bg-red-600 text-white',
    'MODERATÖR': 'bg-green-700 text-white',
    'UZMAN': 'bg-blue-600 text-white',
    'ÜYE': 'bg-slate-200 text-slate-700'
  };

  return (
    <article className="xf-post rounded-sm overflow-hidden flex flex-col md:flex-row">
      {/* Mobile Author Bar (Visible only on < 768px) */}
      <div className="md:hidden bg-[#f8f9fa] border-b border-[#d8dee4] p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-slate-300 rounded-full border border-[#d8dee4]"></div>
            {author.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </div>
          <div className="flex flex-col">
            <Link href={`/uyeler/${author.name}`} className="font-bold text-[#18587a] hover:underline">
              {author.name}
            </Link>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[author.role]}`}>
              {author.role}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          #{postNumber}
        </div>
      </div>

      {/* Desktop Author Column (Visible only on > 768px) */}
      <div className="xf-post-author hidden md:flex flex-col items-center">
        <Link href={`/uyeler/${author.name}`} className="font-bold text-[#18587a] text-lg hover:underline mb-2">
          {author.name}
        </Link>
        
        <div className="relative mb-3">
          <div className="w-32 h-32 bg-slate-300 rounded border border-[#d8dee4]"></div>
          {author.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md" title="Çevrimiçi"></div>
          )}
        </div>

        <div className={`text-[11px] px-3 py-1 rounded-sm font-bold w-full text-center mb-3 ${roleColors[author.role]}`}>
          {author.role}
        </div>

        <div className="w-full flex flex-col gap-1 text-[11px] text-slate-600 text-left px-2">
          <div className="flex justify-between">
            <span>Katılım:</span>
            <span className="font-semibold">{author.joinedDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Mesajlar:</span>
            <span className="font-semibold">{author.messageCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Beğeni:</span>
            <span className="font-semibold">{author.likeScore}</span>
          </div>
        </div>

        {author.role === 'YÖNETİCİ' && (
          <div className="mt-4 text-red-600 flex items-center gap-1.5 text-[11px] font-bold">
            <ShieldCheck size={14} />
            DOĞRULANMIŞ
          </div>
        )}
      </div>

      {/* Message Content Column */}
      <div className="xf-post-content">
        {/* Post Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100 text-[12px] text-slate-500">
          <time dateTime={date}>{date}</time>
          <div className="flex items-center gap-3">
            <Link href={`#post-${id}`} className="hover:text-[#18587a] font-mono">#{postNumber}</Link>
          </div>
        </div>

        {/* Post Body */}
        <div className="xf-post-body leading-relaxed">
          {content}
        </div>

        {/* Signature */}
        {signature && (
          <div className="xf-post-signature italic">
            {signature}
          </div>
        )}

        {/* Post Actions Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#18587a] hover:bg-[#e8f0fe] px-2 py-1 rounded transition-colors group">
              <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
              Beğen
            </button>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-bold text-[#18587a]">
            <button className="flex items-center gap-1.5 hover:bg-[#e8f0fe] px-2 py-1 rounded transition-colors">
              <Quote size={14} />
              Cevapla
            </button>
            <button className="flex items-center gap-1.5 hover:bg-[#e8f0fe] px-2 py-1 rounded transition-colors hidden sm:flex">
              <MessageSquare size={14} />
              Alıntı Yap
            </button>
            <div className="w-[1px] h-3 bg-slate-200 hidden sm:block mx-1"></div>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              Rapor Et
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
