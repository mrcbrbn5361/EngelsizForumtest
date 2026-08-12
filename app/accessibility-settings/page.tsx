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
      <div className="vibe-container py-12 max-w-4xl mx-auto space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex p-4 bg-primary/10 text-primary rounded-3xl mb-4">
            <AccessibilityIcon size={48} strokeWidth={3} />
          </div>
          <h1 className="vibe-section-title !text-4xl">Görünüm ve Erişilebilirlik</h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            EngelsizForum'u kendinize göre özelleştirin. Bu ayarlar tarayıcınızda saklanır ve anında uygulanır.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Visual section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
              <Eye size={16} /> Görsel Tercihler
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsCard 
                icon={<Contrast size={24} />}
                title="Yüksek Kontrast"
                description="Metinleri ve düğmeleri daha belirgin hale getirir."
                active={a11y.highContrast}
                onClick={() => updateSettings({ highContrast: !a11y.highContrast })}
              />
              <SettingsCard 
                icon={<Type size={24} />}
                title="Disleksi Dostu Font"
                description="Okumayı kolaylaştıran özel OpenDyslexic yazı tipi."
                active={a11y.dyslexicFont}
                onClick={() => updateSettings({ dyslexicFont: !a11y.dyslexicFont })}
              />
              <SettingsCard 
                icon={<Zap size={24} />}
                title="Biyonik Okuma"
                description="Hızlı odaklanma için kelimelerin baş harflerini vurgular."
                active={a11y.bionicReading}
                onClick={() => updateSettings({ bionicReading: !a11y.bionicReading })}
              />
              <SettingsCard 
                icon={<MousePointer2 size={24} />}
                title="Hareketi Azalt"
                description="Göz yorgunluğunu önlemek için animasyonları kapatır."
                active={a11y.reducedMotion}
                onClick={() => updateSettings({ reducedMotion: !a11y.reducedMotion })}
              />
            </div>
          </section>

          {/* Text Size Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
              <Type size={16} /> Yazı Boyutu
            </div>
            <div className="vibe-card p-8 bg-muted/30">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Okunabilirlik Ölçeği</p>
                  <p className="text-xs text-muted-foreground italic">Seçtiğiniz boyut tüm sayfalarda geçerli olur.</p>
                </div>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                        a11y.fontSize === size 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                          : 'bg-white border-transparent hover:border-primary/30'
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
          <div className="vibe-card p-6 bg-primary/5 border-primary/20 flex gap-4 items-start">
            <Info className="text-primary shrink-0" size={20} />
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Bu ayarlar <strong>WCAG 2.2 Seviye AAA</strong> uyumluluğu hedeflenerek tasarlanmıştır. Herhangi bir sayfada erişilebilirlik sorunu yaşarsanız, lütfen sayfanın en altındaki raporla butonunu kullanın.
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
      className={`vibe-card p-8 text-left space-y-4 transition-all border-2 group ${
        active ? 'border-primary bg-primary/5 shadow-xl' : 'hover:border-primary/20 bg-white'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl transition-colors ${active ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
          {icon}
        </div>
        <div className={`w-12 h-6 rounded-full transition-colors relative border-2 ${active ? 'bg-primary border-primary' : 'bg-muted border-muted'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${active ? 'right-0.5' : 'left-0.5'}`} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
