'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  QrCode, 
  Heart, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  Award,
  Users2,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

/**
 * TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri Showcase Notice.
 * High-contrast, interactive announcement banner with zero generic clichés.
 */
export default function TeknofestNotice() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section 
      aria-label="TEKNOFEST 2027 Engelsiz Yaşam Teknolojileri Bildirimi"
      className="mb-6 rounded-2xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
    >
      {/* Dynamic Header */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
            <Rocket size={19} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md">
                TEKNOFEST 2027
              </span>
              <span className="text-xs font-bold text-amber-300">
                Engelsiz Yaşam Teknolojileri Yarışması
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white m-0 tracking-tight truncate">
              Milli Teknoloji Hamlesi &bull; Engelsiz Dijital Dayanışma Ekosistemi
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shrink-0 border border-slate-700"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Duyuruyu Daralt" : "Duyuruyu Genişlet"}
        >
          <span className="hidden sm:inline">{isExpanded ? 'Detayları Kapat' : 'Genişlet'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Interactive Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4 text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Feature 1 */}
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-200 dark:border-sky-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-700 text-white shrink-0">
                <Cpu size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-sky-950 dark:text-sky-200">
                  WCAG 2.1 AAA Erişilebilirlik
                </h3>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5 leading-snug">
                  Az görenler, disleksi, DEHB, renk körlüğü ve işitme engelliler için optimize edilmiş 10+ yerel araç.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                  Doğrulanmış 2026-2027 Mevzuatı
                </h3>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-snug">
                  Balthazard cetveli, ÖTV araç muafiyet üst limiti (2.247.100 TL) ve kademeli erken emeklilik simülatörü.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0">
                <Users2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-950 dark:text-amber-200">
                  Gerçek Topluluk &amp; Uzman Ağı
                </h3>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-snug">
                  Avukatlar, medikal uzmanlar ve engelli bireylerin birebir bilgi ve tecrübe paylaştığı dayanışma ortamı.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              EngelsizForum ekibi olarak TEKNOFEST 2027 standımıza bekliyoruz. Görüş ve önerilerinizi forum üzerinden bizimle paylaşabilirsiniz.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link 
                href="/about" 
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Proje Manifestosu
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
