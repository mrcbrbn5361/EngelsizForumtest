'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Home, 
  ChevronRight,
  Target,
  Accessibility,
  HeartHandshake,
  Cpu,
  Eye,
  Award,
  ArrowRight
} from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-4 text-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#161b22] border border-[#30363d] px-4 py-2.5 rounded-md flex items-center gap-2 text-xs text-slate-300">
        <Link href="/" className="hover:text-white font-bold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-slate-500" />
        <span className="font-bold text-white">Hakkımızda &amp; Proje Vizyonu</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Section */}
          <div className="border-b border-[#30363d] pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Engelsiz Topluluk Ekosistemi • TEKNOFEST 2027</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Bariyersiz Bilgi, Eşit ve Güvenilir Topluluk.
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
              EngelsizForum; engelli bireylerin haklarını öğrenmesi, sağlık kurulu raporu ve mevzuat süreçlerini çözmesi, medikal ve teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş bağımsız bir dayanışma platformudur.
            </p>
          </div>

          {/* Misyon & Vizyon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-md space-y-3">
              <div className="w-8 h-8 rounded bg-[#21262d] text-sky-400 flex items-center justify-center font-bold">
                <Target size={18} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Misyonumuz
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sosyal yaşamda, istihdamda ve yasal hak arama süreçlerinde karşılaşılan bürokratik bilgi kirliliğini ortadan kaldırmak. Güncel Balthazard cetveli, 2.873.972 TL 2026 ÖTV araç istisnası ve erken emeklilik mevzuatını herkes için şeffaf kılmak.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-md space-y-3">
              <div className="w-8 h-8 rounded bg-[#21262d] text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake size={18} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Vizyonumuz
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hiçbir engelli bireyin dijital bariyerler yüzünden hak kaybına uğramadığı; genç mühendislerin, uzman hekimlerin ve engelli bireylerin ortak çözümler ürettiği küresel standartta bir açık kaynak ekosistemi inşa etmek.
              </p>
            </div>
          </div>

          {/* Teknik Standartlar */}
          <div className="border border-[#30363d] rounded-md overflow-hidden bg-[#161b22]">
            <div className="bg-[#21262d] py-3 px-4 flex items-center justify-between border-b border-[#30363d]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-200">
                <Accessibility size={15} className="text-sky-400" />
                <span>Platform Mimarisi ve Teknik Standartlar</span>
              </div>
              <span className="text-[10px] bg-sky-950 border border-sky-800 text-sky-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                WCAG 2.1 AAA
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  icon: Eye,
                  title: 'Ekran Okuyucu Uyumluluğu', 
                  desc: 'NVDA, JAWS, VoiceOver ve TalkBack ile eksiksiz semantik ARIA etiketlemesi, mantıksal odaklanma akışı.' 
                },
                { 
                  icon: Accessibility,
                  title: 'Yüksek Kontrast & Tipografi', 
                  desc: 'Düşük gören bireyler için doğrudan font boyutu kontrolü (A- / A+), disleksi dostu font ve özel engel profilleri.' 
                },
                { 
                  icon: Cpu,
                  title: 'WebMCP AI & REST API', 
                  desc: 'Model Context Protocol ve OAuth 2.0 ile harici yapay zeka ajanlarına ve mobil uygulamalara canlı veri akışı.' 
                },
                { 
                  icon: Award,
                  title: 'TEKNOFEST 2027 AR-GE', 
                  desc: 'Engelsiz Yaşam Teknolojileri kategorisinde genç geliştiricilerin projelerini toplulukla buluşturan açık platform.' 
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-md border border-[#30363d] bg-[#0d1117] space-y-2">
                  <div className="flex items-center gap-2 text-sky-400">
                    <item.icon size={16} />
                    <h3 className="font-bold text-xs text-white uppercase">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="border border-[#30363d] rounded-md p-6 bg-[#161b22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Topluluğumuza Katılın ve Deneyiminizi Paylaşın
              </h2>
              <p className="text-xs text-slate-400">
                Sorularınızı foruma yazabilir veya 2026 hesaplama robotlarıyla simülasyon yapabilirsiniz.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href="/hesaplama"
                className="px-3.5 py-2 rounded-md bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-white text-xs font-semibold transition-colors"
              >
                Hesaplama Robotları
              </Link>
              <Link 
                href="/discussions/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-100 text-black text-xs font-bold transition-colors shadow-xs"
              >
                <span>Yeni Konu Aç</span>
                <ArrowRight size={14} />
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
