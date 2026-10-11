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
      className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-4 sm:p-5 my-6 text-white"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-500 fill-red-500 shrink-0" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Sponsorlarımız &amp; Proje Destekçileri
          </h2>
          <span className="text-[10px] font-mono font-bold bg-[#21262d] border border-[#30363d] text-sky-400 px-2 py-0.5 rounded">
            TEKNOFEST
          </span>
        </div>

        <a
          href="mailto:miracbirben@engelsizforum.com"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-white hover:text-black border border-[#30363d] text-xs font-bold transition-colors shrink-0"
        >
          <Mail size={13} />
          <span>Sponsorluk &amp; İletişim</span>
        </a>
      </div>

      <div className="pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
          EngelsizForum, engelli bireylerin haklarına, sağlık raporlarına ve Balthazard hesaplamalarına eşit ve bağımsız erişebilmesi için geliştirilmektedir. Bizi destekleyen değerli sponsorlarımıza teşekkür ederiz.
        </p>

        {/* Sponsor Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a 
            href="https://yeterly.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white font-bold border border-[#30363d] transition-colors shadow-2xs group"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span className="group-hover:text-sky-400 transition-colors">yeterly.ai</span>
            <ExternalLink size={11} className="text-slate-400" />
          </a>

          <a 
            href="https://goldhost.com.tr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white font-bold border border-[#30363d] transition-colors shadow-2xs group"
          >
            <span className="group-hover:text-sky-400 transition-colors">goldhost.com.tr</span>
            <ExternalLink size={11} className="text-slate-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
