'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  ArrowLeft, 
  Home, 
  Target,
  Accessibility,
  HeartHandshake,
  Cpu,
  Eye,
  Award
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function AboutPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Hakkımızda &amp; TEKNOFEST 2027</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Welcome Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Engelsiz Topluluk Ekosistemi • TEKNOFEST 2027</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              Bariyersiz Bilgi, Eşit ve Güvenilir Topluluk.
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              EngelsizForum, engelli bireylerin haklarını öğrenmesi, mevzuat ve sağlık kurulu raporu süreçlerini çözmesi, medikal ve teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş Türkiye&apos;nin ilk tam erişilebilir bağımsız dayanışma platformudur.
            </p>
          </div>

          {/* Core Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">
                Misyonumuz
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Engellilerin sosyal hayatta, çalışma yaşamında ve yasal hak arama süreçlerinde karşılaştığı bilgi karmaşasını ortadan kaldırmak. Güncel Balthazard formülleri, ÖTV muafiyet limitleri ve mevzuatları herkes için şeffaf kılmak.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <HeartHandshake size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">
                Vizyonumuz
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Hiçbir bireyin bürokrasi veya teknoloji engeli sebebiyle hak kaybı yaşamadığı; genç mühendisler, uzmanlar ve engelli bireylerin ortak projeler ürettiği küresel standartta bir dijital ekosistem inşa etmek.
              </p>
            </div>
          </div>

          {/* Technical Standards Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <Accessibility size={15} className="text-sky-400" />
                <span>PLATFORM MİMARİSİ VE TEKNİK STANDARTLAR</span>
              </div>
              <span className="text-[10px] bg-sky-950 border border-sky-800 text-sky-300 px-2 py-0.5 rounded font-black uppercase">
                WCAG 2.1 AAA
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  icon: Eye,
                  title: 'Ekran Okuyucu Desteği', 
                  desc: 'NVDA, JAWS, VoiceOver ve TalkBack ile kusursuz semantik ARIA ağacı, mantıksal sekme akışı ve sesli yönlendirme.' 
                },
                { 
                  icon: Accessibility,
                  title: 'Yüksek Kontrast & Tipografi', 
                  desc: 'Düşük gören bireyler için 4 kademeli yazı boyutu, disleksi dostu OpenDyslexic fontu ve AAA kontrast filtreleri.' 
                },
                { 
                  icon: Cpu,
                  title: 'WebMCP AI Ajanları', 
                  desc: 'Model Context Protocol ile harici yapay zeka asistanlarına güncel mevzuat ve hesaplama verileri aktaran altyapı.' 
                },
                { 
                  icon: Award,
                  title: 'TEKNOFEST 2027 AR-GE', 
                  desc: 'Engelsiz Yaşam Teknolojileri kategorisinde genç mucitlerin projelerini toplulukla buluşturan fikir kuluçkası.' 
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                    <item.icon size={16} />
                    <h3 className="font-extrabold text-xs text-slate-950 dark:text-white uppercase">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 border-2 border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-sm sm:text-base font-black">
                Topluluğumuza Katılın ve Deneyiminizi Paylaşın
              </h2>
              <p className="text-xs text-slate-300">
                Sorularınızı foruma yazabilir veya hesaplama araçlarıyla anında simülasyon yapabilirsiniz.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/hesaplama">
                <Button variant="info" size="sm" className="font-bold">
                  Hesaplayıcılar
                </Button>
              </Link>
              <Link href="/discussions/new">
                <Button variant="primary" size="sm" className="font-bold bg-white text-slate-950 hover:bg-slate-100">
                  Konu Aç
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>

      </div>
    </div>
  );
}
