'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Target, Sparkles, ShieldCheck,
  ChevronRight, CheckCircle2, Users, ArrowLeft, Home
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function AboutPage() {
  const { user } = useAuth();
  
  return (
    <SiteLayout>
      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation - XenForo Style */}
        <div className="bg-[#eef2f7] -mx-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border-b border-slate-200 mb-2">
          <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 transition-colors">
            <Home size={12} />
            Ana Sayfa
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-bold text-slate-800">Hakkımızda</span>
        </div>

        {/* Hero Welcome Message */}
        <div className="p-5 bg-white border border-slate-200 rounded-sm shadow-xs space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#eef2f7] text-[#185886] border border-slate-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-[#185886]" />
            <span>Engelsiz Topluluk Ekosistemi</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Bariyersiz Bilgi, Eşit ve Güvenilir Topluluk.
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            EngelsizForum, engelli bireylerin haklarını öğrenmesi, mevzuat ve sağlık kurulu raporu süreçlerini çözmesi, medikal ve teknolojik donanımlarda akran deneyimlerine ulaşması amacıyla geliştirilmiş tam erişilebilir bilgi ve dayanışma platformudur.
          </p>
        </div>

        {/* Core Pillars Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Mission Block */}
          <div className="lg:col-span-7 xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center gap-2">
                <Target size={14} className="text-white/80" />
                Misyonumuz ve Temel Amacımız
              </div>
              <div className="p-4 sm:p-5 space-y-3 text-slate-700">
                <p className="text-xs sm:text-sm leading-relaxed font-normal">
                  Engellilerin sosyal hayatta, çalışma yaşamında ve yasal hak arama süreçlerinde karşılaştığı bilgi karmaşasını ortadan kaldırmak. Güncel mevzuatları, Balthazard hesaplamalarını, ÖTV muafiyet kurallarını ve erişilebilirlik teknolojilerini açık ve herkes için anlaşılır kılmaktır.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-white rounded-sm text-[11px] font-bold text-slate-600 border border-slate-200">
                WCAG 2.2 AAA Uyumu
              </span>
              <span className="px-2.5 py-1 bg-white rounded-sm text-[11px] font-bold text-slate-600 border border-slate-200">
                Resmi Mevzuat Taraması
              </span>
              <span className="px-2.5 py-1 bg-white rounded-sm text-[11px] font-bold text-slate-600 border border-slate-200">
                Akran Dayanışması
              </span>
            </div>
          </div>

          {/* Principles Block */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Standard 1 */}
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm flex-1">
              <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Doğrulanmış ve Güncel Bilgi
              </div>
              <div className="p-4 text-xs text-slate-600 leading-relaxed font-normal">
                Resmi Gazete kararları, SGK duyuruları ve güncel yönetmelik değişiklikleri uzman moderatörler ve yapay zeka arama motorları ile sürekli doğrulanır.
              </div>
            </div>

            {/* Standard 2 */}
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm flex-1">
              <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[11px] tracking-wider py-2 px-3 flex items-center gap-1.5">
                <Users size={13} />
                Kapsayıcı ve Güvenli Alan
              </div>
              <div className="p-4 text-xs text-slate-600 leading-relaxed font-normal">
                Her engel grubunun özel ihtiyaçlarına saygı duyan, ayrımcılığa sıfır tolerans gösteren ve katılımcıların deneyimlerini güvenle paylaşabileceği bir ortam.
              </div>
            </div>

          </div>
        </div>

        {/* Technical Standards Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3">
            PLATFORM MİMARİSİ &amp; TEKNİK STANDARTLAR
          </div>
          
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            EngelsizForum en modern web teknolojileri ve uluslararası erişilebilirlik yönergeleriyle inşa edilmiştir.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
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
              <div key={idx} className="p-4.5 bg-white space-y-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <CheckCircle2 size={12} className="text-[#185886]" />
                  <span>Standart {idx + 1}</span>
                </div>
                <h3 className="font-extrabold text-xs text-[#185886] uppercase tracking-wide">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center gap-2">
            <Sparkles size={14} className="text-[#f2930d]" />
            Dayanışmamıza Katılın
          </div>
          
          <div className="p-6 text-center space-y-4 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Sorularınızı sorun, edindiğiniz hak ve rapor deneyimlerinizi paylaşarak binlerce engelli bireye rehberlik edin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1.5">
              {!user ? (
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-[#f2930d] hover:bg-[#d5800a] text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-xs transition-colors whitespace-nowrap"
                >
                  Ücretsiz Kayıt Ol
                </Link>
              ) : (
                <Link 
                  href="/" 
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-[#185886] hover:bg-[#12466b] text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-xs transition-colors whitespace-nowrap"
                >
                  Forumlar Ana Sayfasına Git
                </Link>
              )}
              <Link 
                href="/" 
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-[#eef2f7] hover:bg-slate-200 text-slate-700 border border-slate-300 px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                Tartışmaları İncele
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

      </div>
    </SiteLayout>
  );
}
