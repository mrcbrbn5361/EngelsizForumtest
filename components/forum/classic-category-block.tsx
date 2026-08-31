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
    <div className="xf-node-row">
      {/* Node Icon */}
      <div className="xf-node-icon">
        <MessageSquare size={32} strokeWidth={1.5} />
      </div>

      {/* Main Content */}
      <div className="xf-node-main">
        <Link href={`/category/${id}`} className="xf-node-title text-sky-400 hover:text-sky-300 hover:underline">
          {title}
        </Link>
        <div className="xf-node-description text-slate-400">
          {description}
        </div>
      </div>

      {/* Stats */}
      <div className="xf-node-stats hidden md:flex text-slate-400">
        <dl className="flex flex-col gap-0.5">
          <div className="flex justify-between gap-4">
            <dt>Konular:</dt>
            <dd className="font-mono text-slate-200">{threadCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Mesajlar:</dt>
            <dd className="font-mono text-slate-200">{messageCount}</dd>
          </div>
        </dl>
      </div>

      {/* Last Post Info */}
      <div className="xf-node-lastPost hidden lg:flex">
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 bg-slate-800 rounded shrink-0 border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold uppercase text-xs">
            {(lastPost?.author || '-').substring(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <Link href={`/threads/latest`} className="text-sky-400 hover:text-sky-300 font-semibold truncate hover:underline text-[13px]">
              {lastPost?.title || 'Henüz konu yok'}
            </Link>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="font-medium text-sky-400">{lastPost?.author || '-'}</span>
              <span>•</span>
              <span className="text-slate-500">{lastPost?.date || '-'}</span>
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
      <div className="xf-block-header">
        <Link href="#" className="hover:underline">{title}</Link>
      </div>
      <div className="flex flex-col">
        {nodes.map((node) => (
          <ClassicNodeRow key={node.id} {...node} />
        ))}
      </div>
    </section>
  );
}
