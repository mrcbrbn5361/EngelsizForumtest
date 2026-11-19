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
  ArrowRight,
  Info
} from 'lucide-react';
import ClassicSidebar from '@/components/forum/classic-sidebar';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-4 text-fg">
      {/* Breadcrumb Navigation */}
      <div className="bg-surface-raised border border-line px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs text-fg-4 font-mono">
        <Link href="/" className="hover:text-indigo-400 light:hover:text-indigo-700 font-semibold transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight size={13} className="text-fg-6" />
        <span className="font-semibold text-fg-2 font-sans">Hakkımızda &amp; Proje Vizyonu</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Section */}
          <div className="border-b border-line pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/60 light:bg-indigo-50/60 text-indigo-300 light:text-indigo-700 border border-indigo-800/60 text-[11px] font-mono uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Engelsiz Topluluk Ekosistemi • TEKNOFEST 2027</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg tracking-tight leading-tight font-heading">
              Bariyersiz Bilgi, Eşit ve Güvenilir Topluluk.
            </h1>
            
            <p className="text-xs sm:text-sm text-fg-3 leading-relaxed font-normal max-w-2xl">
              EngelsizForum; engelli bireylerin haklarını öğrenmesi, sağlık kurulu raporu ve mevzuat süreçlerini çözmesi, medikal ve teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş bağımsız bir dayanışma platformudur.
            </p>
          </div>

          {/* Misyon & Vizyon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-raised border border-line p-5 rounded-lg space-y-3">
              <div className="w-8 h-8 rounded-md bg-surface-hover text-indigo-400 light:text-indigo-700 flex items-center justify-center font-bold">
                <Target size={18} />
              </div>
              <h2 className="text-sm font-bold text-fg uppercase tracking-wider font-heading">
                Misyonumuz
              </h2>
              <p className="text-xs text-fg-4 leading-relaxed font-normal">
                Sosyal yaşamda, istihdamda ve yasal hak arama süreçlerinde karşılaşılan bürokratik bilgi kirliliğini ortadan kaldırmak. Güncel Balthazard cetveli, 2.873.972 TL 2026 ÖTV araç istisnası ve erken emeklilik mevzuatını herkes için şeffaf kılmak.
              </p>
            </div>

            <div className="bg-surface-raised border border-line p-5 rounded-lg space-y-3">
              <div className="w-8 h-8 rounded-md bg-surface-hover text-emerald-400 light:text-emerald-700 flex items-center justify-center font-bold">
                <HeartHandshake size={18} />
              </div>
              <h2 className="text-sm font-bold text-fg uppercase tracking-wider font-heading">
                Vizyonumuz
              </h2>
              <p className="text-xs text-fg-4 leading-relaxed font-normal">
                Hiçbir engelli bireyin dijital bariyerler yüzünden hak kaybına uğramadığı; genç mühendislerin, uzman hekimlerin ve engelli bireylerin ortak çözümler ürettiği küresel standartta bir açık kaynak ekosistemi inşa etmek.
              </p>
            </div>
          </div>

          {/* Teknik Standartlar */}
          <div className="border border-line rounded-lg overflow-hidden bg-surface-raised">
            <div className="bg-surface-hover py-3 px-4 flex items-center justify-between border-b border-line">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-fg-2 font-heading">
                <Accessibility size={15} className="text-indigo-400 light:text-indigo-700" />
                <span>Platform Mimarisi ve Teknik Standartlar</span>
              </div>
              <span className="text-[10px] bg-indigo-950/80 light:bg-indigo-50/80 border border-indigo-800/60 text-indigo-300 light:text-indigo-700 px-2 py-0.5 rounded font-mono font-medium uppercase">
                WCAG 2.2 AA
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
                <div key={idx} className="p-4 rounded-md border border-line bg-surface space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 light:text-indigo-700">
                    <item.icon size={16} />
                    <h3 className="font-bold text-xs text-fg uppercase font-heading">{item.title}</h3>
                  </div>
                  <p className="text-xs text-fg-4 leading-relaxed font-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="border border-line rounded-lg p-6 bg-surface-raised flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-fg font-heading">
                Topluluklarımıza Katılın ve Deneyiminizi Paylaşın
              </h2>
              <p className="text-xs text-fg-4 font-normal">
                Sorularınızı foruma yazabilir veya 2026 hesaplama robotlarıyla simülasyon yapabilirsiniz.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link 
                href="/hesaplama"
                className="px-3.5 py-2 rounded-md bg-surface-hover border border-line hover:bg-line hover:text-fg text-fg-3 text-xs font-medium transition-colors"
              >
                Hesaplama Robotları
              </Link>
              <Link 
                href="/discussions/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs"
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
