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
      <div className="flex-1 w-full bg-[#f4f6f9] text-slate-700">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-12 md:py-16 border-b border-slate-200 bg-gradient-to-b from-[#eef2f7] to-[#f4f6f9]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Breadcrumb */}
            <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-[#185886] hover:underline transition-colors">Ana Sayfa</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-800 font-bold">Erişilebilirlik Beyannamesi</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#eef2f7] border border-[#cbd5e1] text-[#185886] text-xs font-semibold">
                <ShieldCheck size={14} /> WCAG 2.2 Seviye AA / AAA Uyumluluk
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#185886] leading-[1.2]">
                Erişilebilirlik Beyannamesi &amp; <br className="hidden sm:inline" />
                <span className="text-slate-800">Dijital Eşitlik Standartlarımız.</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
                EngelsizForum, her bireyin bilgiye, mevzuata ve topluluk dayanışmasına bağımsız ve engelsiz biçimde ulaşmasını en temel hak kabul eder. Tüm arayüz W3C WAI standartlarına göre optimize edilmiştir.
              </p>
            </div>
          </div>
        </section>

        {/* --- CORE STANDARDS GRID --- */}
        <section className="py-12 md:py-16 border-b border-slate-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { 
                  icon: <ShieldCheck className="w-6 h-6 text-[#185886]" />, 
                  title: 'Düzey AA & AAA Kriterleri', 
                  desc: 'Metin kontrastları, odak halkaları ve dokunmatik hedef boyutları en güncel WCAG 2.2 kılavuzuna göre test edilmiştir.',
                  tag: 'Standart'
                },
                { 
                  icon: <Accessibility className="w-6 h-6 text-[#185886]" />, 
                  title: 'Ekran Okuyucu Uyumu', 
                  desc: 'NVDA, JAWS ve VoiceOver için tam semantik başlık ağacı (H1-H4), ARIA etiketleri ve canlı bildirim bölgeleri.',
                  tag: 'Teknoloji'
                },
                { 
                  icon: <Keyboard className="w-6 h-6 text-[#185886]" />, 
                  title: 'Klavye ile Tam Gezinim', 
                  desc: 'Mouse olmadan, yalnızca Tab, Shift+Tab ve yön tuşlarıyla menüler, formlar ve tartışmalar arasında akıcı gezinme.',
                  tag: 'Navigasyon'
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#185886] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-11 h-11 rounded-xl bg-[#eef2f7] border border-[#cbd5e1] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-[#185886] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 mt-2">{item.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DETAILED TECHNICAL SPECIFICATIONS --- */}
        <section className="py-12 md:py-16 border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Teknik Erişilebilirlik Önlemleri</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Platform kod mimarisinde tavizsiz uyguladığımız temel teknik özellikler:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Semantik HTML5 Yapısı', desc: 'main, nav, article ve header etiketleriyle net içerik hiyerarşisi.', icon: <Monitor className="w-5 h-5 text-[#185886]" /> },
                { title: 'WAI-ARIA Nitelikleri', desc: 'aria-expanded, aria-controls ve role bildirimleri ile dinamik durum aktarımı.', icon: <Sparkles className="w-5 h-5 text-[#185886]" /> },
                { title: 'Belirgin Odak Halkaları', desc: 'Klavye kullanırken görünür ve yüksek kontrastlı focus-visible göstergeleri.', icon: <MousePointer className="w-5 h-5 text-[#185886]" /> },
                { title: 'Açıklayıcı Alternatif Metinler', desc: 'Tüm simgeler ve görseller için ekran okuyucu uyumlu alt etiketleri.', icon: <Eye className="w-5 h-5 text-[#185886]" /> },
                { title: 'Okunabilir ve Ayarlanabilir Font', desc: 'Disleksi dostu font seçenekleri ve dinamik metin boyutu ölçeklemesi.', icon: <Type className="w-5 h-5 text-[#185886]" /> },
                { title: 'Sıfır Yatay Kaydırma (Responsive)', desc: 'Ekran büyüteçleri ve mobil cihazlarda yatay taşma yapmayan esnek ızgara düzeni.', icon: <Smartphone className="w-5 h-5 text-[#185886]" /> }
              ].map((feat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {feat.icon}
                    </div>
                    <h3 className="font-bold text-xs text-slate-800">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- ASSISTIVE TECH TABLE --- */}
        <section className="py-12 md:py-16 border-b border-slate-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Test Edilen Yardımcı Teknolojiler</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">EngelsizForum aşağıdaki işletim sistemleri ve ekran okuyucu araçlarıyla periyodik olarak doğrulanır.</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-[#eef2f7] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600">İşletim Sistemi / Platform</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600">Yardımcı Araç</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600 text-right">Uyumluluk Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { plat: 'Windows 10 / 11', tool: 'NVDA & JAWS Son Sürümler', status: 'Tam Uyumlu (Seviye AAA)' },
                    { plat: 'macOS & iOS', tool: 'Apple VoiceOver & Safari', status: 'Tam Uyumlu' },
                    { plat: 'Android', tool: 'Google TalkBack & Chrome', status: 'Tam Uyumlu' },
                    { plat: 'Tüm Modern Tarayıcılar', tool: 'Tarayıcı Büyüteçleri (%200-%400 Yakınlaştırma)', status: 'Optimize Edildi' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-700">{row.plat}</td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{row.tool}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 size={12} /> {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FEEDBACK SECTION --- */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="space-y-3 max-w-xl">
                <div className="w-10 h-10 rounded-xl bg-[#eef2f7] border border-[#cbd5e1] flex items-center justify-center text-[#185886]">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Erişilebilirlik Geri Bildirimi</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Platformumuzda herhangi bir erişilebilirlik engeliyle karşılaşırsanız veya bir öneriniz olursa lütfen bize iletin. Tüm bildirimler öncelikle değerlendirilir.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-[#185886] font-bold">
                  <Mail size={14} />
                  <a href="mailto:miracbirben@engelsizforum.com" className="hover:underline">miracbirben@engelsizforum.com</a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link 
                  href="/accessibility-settings" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#185886] hover:bg-[#104f75] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition whitespace-nowrap"
                >
                  Erişilebilirlik Ayarlarını Aç
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition whitespace-nowrap"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
