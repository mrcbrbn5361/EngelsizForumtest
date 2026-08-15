'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Heart, Target, Sparkles, Handshake, 
  ChevronRight, ArrowRight, ShieldCheck,
  CheckCircle2, Compass, Layers, Users
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="flex-1 w-full bg-[#090A0F] text-slate-100" role="main">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-12 md:py-18 border-b border-white/[0.08] bg-gradient-to-b from-sky-500/[0.04] via-transparent to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Breadcrumb */}
            <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="text-slate-200 font-medium">Hakkımızda</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles size={14} /> Engelsiz Topluluk Ekosistemi
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-slate-100 leading-[1.2]">
                Bariyersiz Bilgi, <br className="hidden sm:inline" />
                <span className="text-sky-400">Eşit ve Güvenilir Topluluk.</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-2xl">
                EngelsizForum, engelli bireylerin haklarını öğrenmesi, mevzuat ve rapor süreçlerini çözmesi, medikal/teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş tam erişilebilir bilgi ve dayanışma platformudur.
              </p>
            </div>
          </div>
        </section>

        {/* --- CORE PILLARS SECTION --- */}
        <section className="py-12 md:py-16 border-b border-white/[0.08]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Mission Statement */}
              <div className="lg:col-span-7 bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Target size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Misyonumuz ve Temel Amacımız</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    Engellilerin sosyal hayatta, çalışma yaşamında ve yasal hak arama süreçlerinde karşılaştığı bilgi karmaşasını ortadan kaldırmak. Güncel mevzuatları, Balthazard hesaplamalarını, ÖTV muafiyet kurallarını ve erişilebilirlik teknolojilerini açık ve herkes için anlaşılır kılmaktır.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg text-xs font-medium text-slate-300 border border-white/[0.06]">
                    WCAG 2.2 AAA Uyumu
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg text-xs font-medium text-slate-300 border border-white/[0.06]">
                    Resmi Mevzuat Taraması
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg text-xs font-medium text-slate-300 border border-white/[0.06]">
                    Akran Dayanışması
                  </span>
                </div>
              </div>

              {/* Values & Principles */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Doğrulanmış ve Güncel Bilgi</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Resmi Gazete kararları, SGK duyuruları ve güncel yönetmelik değişiklikleri uzman moderatörler ve yapay zeka arama motorları ile sürekli doğrulanır.
                  </p>
                </div>

                <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Users size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Kapsayıcı ve Güvenli Alan</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Her engel grubunun özel ihtiyaçlarına saygı duyan, ayrımcılığa sıfır tolerans gösteren ve katılımcıların deneyimlerini güvenle paylaşabileceği bir ortam.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- ARCHITECTURE & STANDARDS --- */}
        <section className="py-12 md:py-16 border-b border-white/[0.08]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="max-w-2xl mb-8 space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Platform Mimarisi &amp; Teknik Standartlar</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal">
                EngelsizForum en modern web teknolojileri ve uluslararası erişilebilirlik yönergeleriyle inşa edilmiştir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  title: 'Ekran Okuyucu Desteği', 
                  desc: 'NVDA, JAWS ve VoiceOver ile kusursuz semantik ARIA ağacı ve odaklama yönetimi.' 
                },
                { 
                  title: 'Yüksek Kontrast & Tipografi', 
                  desc: 'Düşük gören bireyler için ayarlanabilir yazı boyutları, disleksi dostu fontlar ve WCAG AA kontrastı.' 
                },
                { 
                  title: 'WebMCP AI Ajanları', 
                  desc: 'Model Context Protocol ile harici yapay zeka asistanlarına canlı mevzuat sağlayan ilk forum.' 
                },
                { 
                  title: 'Donanım Bağımsızlık', 
                  desc: 'Klavye kısayolları, tek elle kontrol ve sıfır yatay kaydırma garantili mobil altyapı.' 
                }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-white/[0.08] bg-[#111726]/80 backdrop-blur-md space-y-2 hover:border-sky-500/30 transition-all">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                    <CheckCircle2 size={15} />
                    <span>Standart {idx + 1}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center space-y-5 backdrop-blur-md">
              <div className="space-y-2 max-w-xl mx-auto">
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-100">
                  Dayanışmamıza Katılın
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                  Sorularınızı sorun, edindiğiniz hak ve rapor deneyimlerinizi paylaşarak binlerce engelli bireye rehberlik edin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition whitespace-nowrap"
                >
                  Ücretsiz Kayıt Ol
                </Link>
                <Link 
                  href="/discussions" 
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] px-5 py-2.5 text-xs font-semibold text-slate-200 transition whitespace-nowrap"
                >
                  Tartışmaları İncele
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
