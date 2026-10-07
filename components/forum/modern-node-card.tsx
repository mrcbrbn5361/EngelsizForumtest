'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Accessibility, 
  Folder 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ModernNodeCardProps {
  id: string;
  title: string;
  description: string;
  threadCount: string;
  messageCount: string;
  badge?: string;
  accentColor?: 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'teal' | 'slate';
  lastPost?: {
    title: string;
    author: string;
    date: string;
  };
}

export function ModernNodeCard({
  id,
  title,
  description,
  threadCount,
  messageCount,
  badge,
  accentColor = 'sky',
  lastPost
}: ModernNodeCardProps) {
  const accentClasses = {
    sky: 'border-l-sky-500 hover:border-l-sky-600',
    emerald: 'border-l-emerald-500 hover:border-l-emerald-600',
    amber: 'border-l-amber-500 hover:border-l-amber-600',
    indigo: 'border-l-indigo-500 hover:border-l-indigo-600',
    rose: 'border-l-rose-500 hover:border-l-rose-600',
    teal: 'border-l-teal-500 hover:border-l-teal-600',
    slate: 'border-l-slate-400 hover:border-l-slate-600'
  };

  const iconBgClasses = {
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all duration-150 hover:shadow-md border-l-[5px] ${accentClasses[accentColor]} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
      
      {/* Node Info */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${iconBgClasses[accentColor]} flex items-center justify-center shrink-0 border border-current/20 mt-0.5`}>
          <Folder size={20} />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href={`/category/${id}`}
              className="text-sm font-extrabold text-slate-950 dark:text-white hover:text-sky-700 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:underline"
            >
              {title}
            </Link>
            {badge && (
              <Badge variant="primary" size="sm" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>

      {/* Stats and Last Post */}
      <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
        
        {/* Counts */}
        <div className="flex items-center gap-4 text-center">
          <div className="space-y-0.5">
            <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
              {threadCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Konu
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-0.5">
            <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
              {messageCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              Mesaj
            </span>
          </div>
        </div>

        {/* Last Post Snippet */}
        {lastPost && (
          <div className="hidden lg:block w-48 text-left space-y-0.5">
            <Link 
              href={`/category/${id}`} 
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 truncate block focus:outline-none focus:underline"
              title={lastPost.title}
            >
              {lastPost.title}
            </Link>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{lastPost.author}</span>
              <span>•</span>
              <span className="shrink-0">{lastPost.date}</span>
            </div>
          </div>
        )}

        {/* Arrow Link */}
        <Link 
          href={`/category/${id}`}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-600 dark:text-slate-400 hover:text-sky-700 flex items-center justify-center transition-colors"
          aria-label={`${title} kategorisine git`}
        >
          <ChevronRight size={16} />
        </Link>
      </div>

    </div>
  );
}
