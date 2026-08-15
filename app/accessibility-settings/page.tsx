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
  Info
} from 'lucide-react';

/**
 * Dedicated Accessibility Settings Page
 * Pure focus on user personalization and WCAG 2.2 AAA controls.
 */
export default function AccessibilitySettingsPage() {
  const { updateSettings, ...a11y } = useAccessibility();

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl space-y-10">
        <header className="space-y-3 text-center">
          <div className="inline-flex p-3.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl mb-2">
            <AccessibilityIcon size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Görünüm ve Erişilebilirlik</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed">
            EngelsizForum&apos;u ihtiyaçlarınıza göre özelleştirin. Bu ayarlar tarayıcınızda saklanır ve anında uygulanır.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Visual section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Eye size={14} /> Görsel Tercihler
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingsCard 
                icon={<Contrast size={20} />}
                title="Yüksek Kontrast"
                description="Metinleri ve butonları daha yüksek kontrastla belirginleştirir."
                active={a11y.highContrast}
                onClick={() => updateSettings({ highContrast: !a11y.highContrast })}
              />
              <SettingsCard 
                icon={<Type size={20} />}
                title="Disleksi Dostu Font"
                description="Okumayı kolaylaştıran özel OpenDyslexic yazı tipini etkinleştirir."
                active={a11y.dyslexicFont}
                onClick={() => updateSettings({ dyslexicFont: !a11y.dyslexicFont })}
              />
              <SettingsCard 
                icon={<Zap size={20} />}
                title="Biyonik Okuma"
                description="Hızlı odaklanma için kelimelerin başlangıç harflerini kalınlaştırır."
                active={a11y.bionicReading}
                onClick={() => updateSettings({ bionicReading: !a11y.bionicReading })}
              />
              <SettingsCard 
                icon={<MousePointer2 size={20} />}
                title="Hareketi Azalt"
                description="Göz yorgunluğunu ve dikkat dağınıklığını önlemek için animasyonları durdurur."
                active={a11y.reducedMotion}
                onClick={() => updateSettings({ reducedMotion: !a11y.reducedMotion })}
              />
            </div>
          </section>

          {/* Text Size Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Type size={14} /> Yazı Boyutu
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Okunabilirlik Ölçeği</p>
                  <p className="text-xs text-muted-foreground">Seçtiğiniz boyut tüm sayfalarda ve tartışma yazılarında geçerli olur.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                        a11y.fontSize === size 
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm' 
                          : 'bg-muted/30 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Info Card */}
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5 flex gap-3.5 items-start">
            <Info className="text-sky-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-normal text-muted-foreground leading-relaxed">
              Bu ayarlar <strong className="text-foreground font-semibold">WCAG 2.2 Seviye AAA</strong> uyumluluğu hedeflenerek tasarlanmıştır. Ekran okuyucu, klavye gezintisi veya kontrast konusunda herhangi bir engelle karşılaşırsanız destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function SettingsCard({ icon, title, description, active, onClick }: { icon: React.ReactNode, title: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-2xl text-left space-y-3 transition-all border cursor-pointer ${
        active 
          ? 'border-sky-500 bg-sky-500/5 shadow-sm' 
          : 'border-border/80 bg-card hover:border-sky-500/30'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-sky-500 text-white' : 'bg-muted/40 text-muted-foreground'}`}>
          {icon}
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative border ${active ? 'bg-sky-500 border-sky-500' : 'bg-muted/40 border-border'}`}>
          <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${active ? 'right-0.5' : 'left-0.5'}`} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-normal">{description}</p>
      </div>
    </button>
  );
}
