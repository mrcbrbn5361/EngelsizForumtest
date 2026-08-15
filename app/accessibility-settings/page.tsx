'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { 
  Accessibility as AccessibilityIcon, 
  Type, 
  Contrast, 
  Zap, 
  Eye, 
  MousePointer2,
  Info,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function AccessibilitySettingsPage() {
  const { updateSettings, ...a11y } = useAccessibility();

  return (
    <SiteLayout>
      <div className="flex-1 w-full bg-[#090A0F] text-slate-100" role="main">
        
        {/* --- HEADER --- */}
        <section className="relative py-10 md:py-14 border-b border-white/[0.08] bg-gradient-to-b from-sky-500/[0.04] via-transparent to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Breadcrumb */}
            <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="text-slate-200 font-medium">Erişilebilirlik ve Görünüm Ayarları</span>
            </nav>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles size={14} /> Kişiselleştirilmiş Deneyim
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                Görünüm ve Erişilebilirlik Tercihleri
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal max-w-2xl leading-relaxed">
                EngelsizForum&apos;u görsel, bilişsel veya motor gereksinimlerinize göre yapılandırın. Seçtiğiniz tercihler tarayıcınızda kalıcı olarak saklanır ve anında uygulanır.
              </p>
            </div>
          </div>
        </section>

        {/* --- SETTINGS BODY --- */}
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-8">
          
          {/* Visual Preferences Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Eye size={15} />
              <span>Görsel ve Bilişsel Tercihler</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingsCard 
                icon={<Contrast size={18} />}
                title="Yüksek Kontrast"
                description="Metinleri, kenar çizgilerini ve interaktif butonları belirginleştirerek kontrastı artırır."
                active={a11y.highContrast}
                onClick={() => updateSettings({ highContrast: !a11y.highContrast })}
              />
              <SettingsCard 
                icon={<Type size={18} />}
                title="Disleksi Dostu Font (OpenDyslexic)"
                description="Okumayı ve harfleri ayırt etmeyi kolaylaştıran özel ağırlıklı yazı tipini etkinleştirir."
                active={a11y.dyslexicFont}
                onClick={() => updateSettings({ dyslexicFont: !a11y.dyslexicFont })}
              />
              <SettingsCard 
                icon={<Zap size={18} />}
                title="Biyonik Okuma (Bionic Reading)"
                description="Gözün odaklanmasını ve okuma hızını artırmak için kelimelerin ilk harflerini vurgular."
                active={a11y.bionicReading}
                onClick={() => updateSettings({ bionicReading: !a11y.bionicReading })}
              />
              <SettingsCard 
                icon={<MousePointer2 size={18} />}
                title="Hareketi ve Animasyonları Azalt"
                description="Göz yorgunluğu ve vestibular hassasiyetleri önlemek için tüm geçiş hareketlerini durdurur."
                active={a11y.reducedMotion}
                onClick={() => updateSettings({ reducedMotion: !a11y.reducedMotion })}
              />
            </div>
          </section>

          {/* Text Size Scaling */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Type size={15} />
              <span>Metin ve Okuma Ölçeği</span>
            </div>

            <div className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Yazı Boyutu Ölçeklemesi</p>
                  <p className="text-xs text-slate-400">Seçilen font boyutu tüm sayfalarda, başlıklarda ve tartışma yanıtlarında uygulanır.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {[
                    { id: 'sm', label: 'Küçük' },
                    { id: 'md', label: 'Standart' },
                    { id: 'lg', label: 'Büyük' },
                    { id: 'xl', label: 'Çok Büyük' }
                  ].map((item) => {
                    const isSelected = a11y.fontSize === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => updateSettings({ fontSize: item.id as any })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                          isSelected 
                            ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                            : 'bg-slate-900/60 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* WCAG Info Box */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex gap-3.5 items-start">
            <Info className="text-sky-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">Uluslararası Uyumluluk Kılavuzu</p>
              <p className="text-xs font-normal text-slate-400 leading-relaxed">
                Bu tercihler <strong className="text-sky-300 font-semibold">W3C WCAG 2.2 Seviye AAA</strong> ilkeleri göz önünde bulundurularak hazırlanmıştır. Ekran okuyucu kısayolları ve klavye gezintisi konusunda soru veya önerileriniz için <Link href="/accessibility" className="text-sky-400 hover:underline">Erişilebilirlik Beyannamesi</Link> sayfamızı inceleyebilirsiniz.
              </p>
            </div>
          </div>

        </div>

      </div>
    </SiteLayout>
  );
}

function SettingsCard({ 
  icon, 
  title, 
  description, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-2xl text-left space-y-3 transition-all border cursor-pointer backdrop-blur-md ${
        active 
          ? 'border-sky-500/50 bg-[#111726] shadow-sm ring-1 ring-sky-500/30' 
          : 'border-white/[0.08] bg-[#111726]/80 hover:border-sky-500/30 hover:bg-[#111726]'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-900/60 text-slate-400 border border-white/[0.06]'}`}>
          {icon}
        </div>
        <div className={`w-9 h-5 rounded-full transition-colors relative border ${active ? 'bg-sky-600 border-sky-500' : 'bg-slate-800 border-slate-700'}`}>
          <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-xs ${active ? 'right-0.5' : 'left-0.5'}`} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">{description}</p>
      </div>
    </button>
  );
}
