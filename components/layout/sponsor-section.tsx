'use client';

import React from 'react';
import { Sparkles, Heart, ExternalLink, Mail } from 'lucide-react';

interface SponsorSectionProps {
  compact?: boolean;
}

export function SponsorSection({ compact = false }: SponsorSectionProps) {
  return (
    <section 
      aria-label="Sponsorlarımız ve Destekçilerimiz"
      className="w-full bg-surface-raised border border-line rounded-lg p-4 sm:p-5 my-6 text-fg-1"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-rose-500 fill-rose-500 shrink-0" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-2 font-heading">
            Proje Destekçileri &amp; Partnerler
          </h2>
          <span className="text-[10px] font-mono font-medium bg-surface-hover border border-line text-indigo-400 px-2 py-0.5 rounded">
            Topluluk
          </span>
        </div>

        <a
          href="mailto:miracbirben@engelsizforum.com"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-hover hover:bg-line text-fg-2 hover:text-fg border border-line text-xs font-medium transition-colors shrink-0"
        >
          <Mail size={13} />
          <span>İletişim &amp; Destek</span>
        </a>
      </div>

      <div className="pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <p className="text-xs text-fg-3 font-normal max-w-xl leading-relaxed">
          EngelsizForum, engelli bireylerin mevzuata, haklarına ve Balthazard hesaplamalarına bağımsız ve eşit erişebilmesi için geliştirilen açık topluluk platformudur.
        </p>

        {/* Sponsor Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a 
            href="https://yeterly.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-hover hover:bg-line text-fg-2 hover:text-fg font-medium border border-line transition-colors shadow-2xs group"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span className="group-hover:text-indigo-400 transition-colors">yeterly.ai</span>
            <ExternalLink size={11} className="text-fg-4" />
          </a>

          <a 
            href="https://goldhost.com.tr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-hover hover:bg-line text-fg-2 hover:text-fg font-medium border border-line transition-colors shadow-2xs group"
          >
            <span className="group-hover:text-indigo-400 transition-colors">goldhost.com.tr</span>
            <ExternalLink size={11} className="text-fg-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
