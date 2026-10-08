'use client';

import React, { useState } from 'react';
import { Rocket, Sparkles, Heart, ExternalLink, QrCode, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export function TeknofestBanner() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section 
      aria-label="TEKNOFEST Özel Duyurusu"
      className="relative overflow-hidden mb-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all"
    >
      {/* Decorative top accent line with Turkey / TEKNOFEST energetic theme */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-sky-600 to-teal-400" />

      <div className="p-4 sm:p-5">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center shrink-0">
              <Rocket size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-2xs">
                  TEKNOFEST ÖZEL
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline-flex items-center gap-1">
                  <QrCode size={13} />
                  Stant QR Ziyaretçileri İçin
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight mt-0.5 m-0">
                Miraç Birben&apos;den TEKNOFEST Ziyaretçilerine &amp; Ekibine Mesaj
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Mesajı daralt" : "Mesajı genişlet"}
            >
              <span>{isExpanded ? 'Gizle' : 'Oku'}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Message Content */}
        {isExpanded && (
          <div className="pt-3.5 space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-medium text-slate-900 dark:text-slate-200">
              Selam değerli <strong>TEKNOFEST Ziyaretçileri</strong> ve <strong>TEKNOFEST ekibi</strong>, ben <strong>Miraç Birben</strong>!
            </p>

            <p>
              Eğer TEKNOFEST&apos;te bu stantta gördüğünüz <strong>QR&apos;ı okuttuğunuzda</strong> bu siteye geldiyseniz size bu proje hakkında birkaç şey diyeceğim:
            </p>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-slate-800 dark:text-slate-200">
              <p>
                <strong>1. olarak</strong> bu projeyi tamamen kendi cebimden <strong>1 TL bile harcamadan</strong> yaptım. Küçük sponsorluklarla 2 yılda elimden geldiğince buraya kadar getirdim, sıra büyük sponsorluklarda!
              </p>
              <p>
                Ama şunu söylemek gerekirse günümüzde bu sitedeki özelliklere (tam %100 WCAG AAA erişilebilirlik, canlı Balthazard/ÖTV 2026 robotları, OAuth 2.0 ve Chrome WebMCP yapay zeka ajan desteği) sahip forum siteleri yok veya nadir bulunuyor.
              </p>
              <p>
                Evet biliyorum, hala birkaç kısımda bozukluklar var ama şu anlık bu kadarı bence yeterli. Ancak <strong>sponsorluğunuzu alabilirsem ülkemi dünya çapında daha fazla duyuracağımı düşünüyorum</strong>; zaten globalde 5-6 ülkeden bile etkileşim alıyorum, sponsorluğu yakalarsak tüm dünya sesimizi duyabilir!
              </p>
            </div>

            {/* Sponsor Gratitude & CTA */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  Sponsorlarımıza Teşekkürler:
                </span>
                
                <a 
                  href="https://yeterly.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  <Sparkles size={12} className="text-amber-500" />
                  <span>yeterly.ai</span>
                  <ExternalLink size={11} className="text-slate-400" />
                </a>

                <a 
                  href="https://goldhost.com.tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  <span>goldhost.com.tr</span>
                  <ExternalLink size={11} className="text-slate-400" />
                </a>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="mailto:miracbirben@engelsizforum.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold transition-all shadow-xs"
                >
                  <Mail size={13} />
                  <span>Sponsorluk &amp; İletişim</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
