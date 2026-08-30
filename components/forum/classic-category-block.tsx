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
        <Link href={`/category/${id}`} className="xf-node-title text-[#18587a] hover:underline">
          {title}
        </Link>
        <div className="xf-node-description">
          {description}
        </div>
      </div>

      {/* Stats */}
      <div className="xf-node-stats hidden md:flex">
        <dl className="flex flex-col gap-0.5">
          <div className="flex justify-between gap-4">
            <dt>Konular:</dt>
            <dd className="font-mono">{threadCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Mesajlar:</dt>
            <dd className="font-mono">{messageCount}</dd>
          </div>
        </dl>
      </div>

      {/* Last Post Info */}
      <div className="xf-node-lastPost hidden lg:flex">
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 bg-slate-200 rounded shrink-0 border border-slate-300"></div>
          <div className="flex flex-col min-w-0">
            <Link href={`/threads/latest`} className="text-[#18587a] font-semibold truncate hover:underline text-[13px]">
              {lastPost.title}
            </Link>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="font-medium text-[#18587a]">{lastPost.author}</span>
              <span>•</span>
              <span>{lastPost.date}</span>
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
