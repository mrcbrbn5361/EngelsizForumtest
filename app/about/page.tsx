'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Target, Sparkles, ShieldCheck,
  ChevronRight, CheckCircle2, Users, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function AboutPage() {
  const { user } = useAuth();
  return (
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={14} className="text-muted-foreground/40" />
          <span className="text-foreground font-medium">Hakkımızda</span>
        </nav>

        {/* Hero Header */}
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <Sparkles size={14} className="text-sky-400" />
            <span>Engelsiz Topluluk Ekosistemi</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
            Bariyersiz Bilgi, <br className="hidden sm:inline" />
            <span className="text-sky-400">Eşit ve Güvenilir Topluluk.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
            EngelsizForum, engelli bireylerin haklarını öğrenmesi, mevzuat ve sağlık kurulu raporu süreçlerini çözmesi, medikal ve teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş tam erişilebilir bilgi ve dayanışma platformudur.
          </p>
        </header>

        {/* Core Pillars Section */}
        <section aria-labelledby="mission-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Mission Statement */}
          <div className="lg:col-span-7 bg-card/85 border border-border/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Target size={20} />
              </div>
              <h2 id="mission-heading" className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Misyonumuz ve Temel Amacımız</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Engellilerin sosyal hayatta, çalışma yaşamında ve yasal hak arama süreçlerinde karşılaştığı bilgi karmaşasını ortadan kaldırmak. Güncel mevzuatları, Balthazard hesaplamalarını, ÖTV muafiyet kurallarını ve erişilebilirlik teknolojilerini açık ve herkes için anlaşılır kılmaktır.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted rounded-xl text-xs font-semibold text-foreground border border-border">
                WCAG 2.2 AAA Uyumu
              </span>
              <span className="px-3 py-1 bg-muted rounded-xl text-xs font-semibold text-foreground border border-border">
                Resmi Mevzuat Taraması
              </span>
              <span className="px-3 py-1 bg-muted rounded-xl text-xs font-semibold text-foreground border border-border">
                Akran Dayanışması
              </span>
            </div>
          </div>

          {/* Values & Principles */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-card/85 border border-border/80 rounded-2xl p-6 backdrop-blur-md space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-base font-bold text-foreground">Doğrulanmış ve Güncel Bilgi</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Resmi Gazete kararları, SGK duyuruları ve güncel yönetmelik değişiklikleri uzman moderatörler ve yapay zeka arama motorları ile sürekli doğrulanır.
              </p>
            </div>

            <div className="bg-card/85 border border-border/80 rounded-2xl p-6 backdrop-blur-md space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Users size={18} />
              </div>
              <h3 className="text-base font-bold text-foreground">Kapsayıcı ve Güvenli Alan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Her engel grubunun özel ihtiyaçlarına saygı duyan, ayrımcılığa sıfır tolerans gösteren ve katılımcıların deneyimlerini güvenle paylaşabileceği bir ortam.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Standards */}
        <section aria-labelledby="standards-heading" className="space-y-4">
          <div className="space-y-1">
            <h2 id="standards-heading" className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Platform Mimarisi &amp; Teknik Standartlar</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
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
                desc: 'Düşük gören bireyler için ayarlanabilir yazı boyutları, disleksi dostu fontlar ve WCAG AAA kontrastı.' 
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
              <div key={idx} className="p-5 rounded-2xl border border-border/80 bg-card/85 backdrop-blur-md space-y-2 hover:border-sky-500/40 transition-all shadow-xs">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                  <CheckCircle2 size={15} />
                  <span>Standart {idx + 1}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-card/90 border border-border/80 rounded-2xl p-6 sm:p-10 text-center space-y-5 backdrop-blur-md shadow-xs">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dayanışmamıza Katılın
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              Sorularınızı sorun, edindiğiniz hak ve rapor deneyimlerinizi paylaşarak binlerce engelli bireye rehberlik edin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!user ? (
              <Link 
                href="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
              >
                Ücretsiz Kayıt Ol
              </Link>
            ) : (
              <Link 
                href="/" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
              >
                Forumlar Ana Sayfasına Git
              </Link>
            )}
            <Link 
              href="/" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 border border-border px-5 py-2.5 text-xs font-bold text-foreground transition-colors whitespace-nowrap"
            >
              Tartışmaları İncele
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
