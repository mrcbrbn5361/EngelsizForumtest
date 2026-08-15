import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { ForumIndex } from '@/components/forum/forum-index';
import { ShieldCheck, Sparkles, Volume2, BookOpen } from 'lucide-react';

/**
 * EngelsizForum Home Page (Server Component)
 * Optimized for WCAG 2.1 AAA accessibility and responsive design.
 */
export default async function Home() {
  return (
    <SiteLayout>
      {/* 
        The ForumIndex component handles the main interactive forum area.
        It's designed to be the central hub of the application.
      */}
      <ForumIndex />

      {/* SEO & Accessibility Information Section */}
      <section 
        className="bg-[#0b0f19] border-t border-white/[0.08] py-10 sm:py-14 px-3.5 sm:px-6 lg:px-8 overflow-hidden min-w-0" 
        aria-labelledby="about-title"
      >
        <div className="vibe-container max-w-5xl space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles size={14} className="shrink-0" />
              <span>Erişilebilir Topluluk Standardı</span>
            </div>
            <h2 id="about-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Dijital Bariyerleri Birlikte Kaldırıyoruz
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
              EngelsizForum, Türkiye&apos;nin <strong>WCAG 2.1 AAA</strong> standartlarını hedefleyen tam erişilebilir dijital topluluk platformudur. 
              Ekran okuyucu kullanan, disleksiye sahip veya motor kısıtlılığı bulunan tüm bireyler için optimize edilmiş kapsayıcı bir ekosistemdir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 bg-[#111726] rounded-xl border border-white/[0.08] shadow-xs space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Akıllı Okuma Modları</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Biyonik Okuma ve OpenDyslexic yazı tipi desteği ile bilişsel yükü azaltıyor, okuma hızını ve odaklanmayı artırıyoruz.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#111726] rounded-xl border border-white/[0.08] shadow-xs space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Sesli Etkileşim</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Web Speech API entegrasyonu ile sesle mesaj yazma ve sesli tartışma özeti desteği sunuyoruz.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#111726] rounded-xl border border-white/[0.08] shadow-xs space-y-2.5 sm:col-span-2 lg:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Güvenilir Bilgi (E-E-A-T)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paylaşılan mevzuat bilgileri ve hak rehberleri topluluk ve uzman denetiminden geçer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
