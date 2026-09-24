'use client';

import { MessageSquare, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface ClassicNodeRowProps {
  id: string;
  title: string;
  description: string;
  threadCount: string;
  messageCount: string;
  lastPost: {
    title: string;
    author: string;
    date: string;
    avatar?: string;
  };
}

export function ClassicNodeRow({ 
  id, 
  title, 
  description, 
  threadCount, 
  messageCount, 
  lastPost 
}: ClassicNodeRowProps) {
  return (
    <div className="xf-node-row bg-white border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all duration-200">
      {/* Node Icon */}
      <div className="xf-node-icon text-[#185886]">
        <MessageSquare size={32} strokeWidth={1.5} />
      </div>

      {/* Main Content */}
      <div className="xf-node-main">
        <h3 className="m-0 leading-snug">
          <Link href={`/category/${id}`} className="xf-node-title text-[#185886] hover:text-[#104f75] font-bold text-sm hover:underline">
            {title}
          </Link>
        </h3>
        <div className="xf-node-description text-slate-500 leading-relaxed mt-0.5">
          {description}
        </div>
      </div>

      {/* Stats */}
      <div className="xf-node-stats hidden md:flex text-slate-500 border-l border-r border-[#e2e8f0]">
        <dl className="flex flex-col gap-0.5">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400 font-medium">Konular:</dt>
            <dd className="font-bold text-slate-700">{threadCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400 font-medium">Mesajlar:</dt>
            <dd className="font-bold text-slate-700">{messageCount}</dd>
          </div>
        </dl>
      </div>

      {/* Last Post Info */}
      <div className="xf-node-lastPost hidden lg:flex">
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 bg-[#eef2f7] rounded shrink-0 border border-[#cbd5e1] flex items-center justify-center text-[#185886] font-bold uppercase text-xs">
            {(lastPost?.author || '-').substring(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <Link href={`/discussions`} className="text-[#185886] hover:text-[#104f75] font-bold truncate hover:underline text-[13px]">
              {lastPost?.title || 'Henüz konu yok'}
            </Link>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="font-bold text-[#0066a2]">{lastPost?.author || '-'}</span>
              <span>•</span>
              <span className="text-slate-400">{lastPost?.date || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ClassicCategoryBlockProps {
  title: string;
  nodes: ClassicNodeRowProps[];
}

export default function ClassicCategoryBlock({ title, nodes }: ClassicCategoryBlockProps) {
  return (
    <section className="xf-block rounded-sm overflow-hidden">
      <h2 className="xf-block-header text-[13px] font-black uppercase tracking-wider text-white m-0">
        <span>{title}</span>
      </h2>
      <div className="flex flex-col">
        {nodes.map((node) => (
          <ClassicNodeRow key={node.id} {...node} />
        ))}
      </div>
    </section>
  );
}
