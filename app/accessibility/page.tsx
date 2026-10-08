'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  ShieldCheck, Accessibility, Keyboard, 
  Monitor, Sparkles, CheckCircle2, AlertCircle, 
  MessageSquare, ArrowRight, ChevronRight, Mail,
  Eye, MousePointer, Type, Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function AccessibilityStatementPage() {
  return (
    <SiteLayout>
      <div className="flex-1 w-full text-slate-800 dark:text-slate-200 space-y-6">
        
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
          <Link href="/" className="hover:text-sky-600 transition-colors font-bold">Ana Sayfa</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-950 dark:text-white font-extrabold">Erişilebilirlik Beyannamesi</span>
        </div>

        {/* HERO SECTION */}
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} /> WCAG 2.1 Seviye AAA Standartları
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Erişilebilirlik Beyannamesi ve Dijital Eşitlik Standartlarımız
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
              EngelsizForum, her bireyin bilgiye, mevzuata ve topluluk dayanışmasına bağımsız ve engelsiz biçimde ulaşmasını en temel hak kabul eder. Tüm arayüz W3C WAI ve WCAG 2.1 AAA standartlarına göre geliştirilmiştir.
            </p>
          </div>
        </section>

        {/* CORE STANDARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Eye,
              title: 'Görme ve Kontrast',
              desc: 'En az 7:1 kontrast oranı, 4 kademeli dinamik font boyutu, SVG renk körlüğü simülasyonları ve yüksek kontrast AAA teması.'
            },
            {
              icon: Keyboard,
              title: 'Klavye Erişilebilirliği',
              desc: 'Tüm buton, form ve modal ögeleri klavye (Tab, Shift+Tab, Enter, Space, Escape) ile eksiksiz kontrol edilebilir. Görsel odak halkası aktiftir.'
            },
            {
              icon: Monitor,
              title: 'Ekran Okuyucu Desteği',
              desc: 'NVDA, JAWS, VoiceOver ve TalkBack için semantik HTML5 başlık hiyerarşisi, ARIA rolleri ve durum anonsları.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                <item.icon size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">
                {item.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        {/* ASSISTIVE TECH TABLE */}
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight">Test Edilen Yardımcı Teknolojiler</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">EngelsizForum aşağıdaki işletim sistemleri ve ekran okuyucu araçlarıyla periyodik olarak doğrulanır.</p>
          </div>

          <div className="overflow-x-auto border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">İşletim Sistemi / Platform</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">Yardımcı Araç</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 text-right">Uyumluluk Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { plat: 'Windows 10 / 11', tool: 'NVDA & JAWS Son Sürümler', status: 'Tam Uyumlu (Seviye AAA)' },
                  { plat: 'macOS & iOS', tool: 'Apple VoiceOver & Safari', status: 'Tam Uyumlu' },
                  { plat: 'Android', tool: 'Google TalkBack & Chrome', status: 'Tam Uyumlu' },
                  { plat: 'Tüm Modern Tarayıcılar', tool: 'Tarayıcı Büyüteçleri (%200-%400 Yakınlaştırma)', status: 'Optimize Edildi' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{row.plat}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">{row.tool}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 size={12} /> {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FEEDBACK SECTION */}
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 mx-auto md:mx-0">
              <MessageSquare size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight">Erişilebilirlik Geri Bildirimi</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Platformumuzda herhangi bir erişilebilirlik engeliyle karşılaşırsanız veya bir öneriniz olursa lütfen bize iletin. Tüm bildirimler öncelikle değerlendirilir.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1 text-xs text-sky-700 dark:text-sky-400 font-bold">
              <Mail size={14} />
              <a href="mailto:miracbirben@gmail.com" className="hover:underline">miracbirben@gmail.com</a>
            </div>
          </div>

          <div className="shrink-0">
            <Link 
              href="/profile" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
            >
              Tercihlerinizi Özelleştirin
            </Link>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
