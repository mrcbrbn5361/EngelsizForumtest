'use client';

import React from 'react';
import { 
  Eye, 
  Ear, 
  Brain, 
  Activity, 
  Sparkles,
  Check,
  RotateCcw,
  Type
} from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';

export type DisabilityProfileId = 'standard' | 'vision' | 'hearing' | 'neuro' | 'motor';

interface DisabilityProfileOption {
  id: DisabilityProfileId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
}

const PROFILES: DisabilityProfileOption[] = [
  {
    id: 'standard',
    title: 'Standart',
    subtitle: 'Varsayılan',
    icon: Sparkles,
    description: 'Yalın ve yüksek kontrastlı modern forum arayüzü.',
  },
  {
    id: 'vision',
    title: 'Görme Desteği',
    subtitle: 'Büyük Yazı & Kontrast',
    icon: Eye,
    description: 'Yüksek kontrast, büyük yazı, belirgin imleç ve sesli ekran rehberi.',
  },
  {
    id: 'hearing',
    title: 'İşitme Desteği',
    subtitle: 'Görsel Flaş',
    icon: Ear,
    description: 'Ses gereksinimi olmayan, görsel flaş bildirimleri.',
  },
  {
    id: 'neuro',
    title: 'Disleksi & DEHB',
    subtitle: 'Okuma Cetveli',
    icon: Brain,
    description: 'OpenDyslexic fontu, satır takip cetveli ve dikkati dağıtmayan sade akış.',
  },
  {
    id: 'motor',
    title: 'Motor Destek',
    subtitle: 'Geniş Dokunma',
    icon: Activity,
    description: 'Geniş tıklama hedefleri, animasyonsuzluk ve klavye kısayolları.',
  }
];

export function DisabilityQuickBar() {
  const { 
    highContrast, 
    fontSize, 
    dyslexicFont, 
    readingRuler, 
    largeCursor, 
    audioGuide, 
    reducedMotion,
    visualAlerts,
    updateSettings, 
    resetSettings,
    triggerVisualAlert
  } = useAccessibility();

  // Determine current active preset
  const activeProfile: DisabilityProfileId = React.useMemo(() => {
    if (highContrast && fontSize === 'xl') return 'vision';
    if (dyslexicFont || readingRuler) return 'neuro';
    if (reducedMotion) return 'motor';
    return 'standard';
  }, [highContrast, fontSize, dyslexicFont, readingRuler, reducedMotion]);

  const applyProfile = (id: DisabilityProfileId) => {
    switch (id) {
      case 'standard':
        resetSettings();
        break;
      case 'vision':
        updateSettings({
          highContrast: true,
          fontSize: 'xl',
          largeCursor: true,
          audioGuide: true,
          dyslexicFont: false,
          readingRuler: false,
          reducedMotion: false,
        });
        triggerVisualAlert('info');
        break;
      case 'hearing':
        updateSettings({
          visualAlerts: true,
          audioGuide: false,
        });
        triggerVisualAlert('success');
        break;
      case 'neuro':
        updateSettings({
          dyslexicFont: true,
          readingRuler: true,
          fontSize: 'lg',
          highContrast: false,
          reducedMotion: true,
        });
        triggerVisualAlert('info');
        break;
      case 'motor':
        updateSettings({
          reducedMotion: true,
          fontSize: 'lg',
          largeCursor: true,
        });
        triggerVisualAlert('info');
        break;
    }
  };

  const increaseFont = () => {
    const map = { sm: 'md', md: 'lg', lg: 'xl', xl: 'xl' } as const;
    updateSettings({ fontSize: map[fontSize] || 'lg' });
  };

  const decreaseFont = () => {
    const map = { xl: 'lg', lg: 'md', md: 'sm', sm: 'sm' } as const;
    updateSettings({ fontSize: map[fontSize] || 'md' });
  };

  return (
    <div 
      className="w-full bg-[#161b22] border-b border-[#30363d] px-3 sm:px-6 py-2 overflow-x-hidden"
      role="region" 
      aria-label="Erişilebilirlik ve Engel Türü Hızlı Seçici"
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2">
        
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-white tracking-wide">
            Erişilebilirlik Profili:
          </span>
          <span className="text-xs text-slate-300 hidden 2xl:inline">
            (Bireysel ihtiyacınıza göre görünümü tek tıkla uyarlayın)
          </span>
        </div>

        {/* Profiles Pill Buttons - High Contrast, Clear Text with horizontal scroll safety on smaller viewports */}
        <div className="flex items-center overflow-x-auto w-full xl:w-auto gap-2 py-1 xl:py-0 scrollbar-none shrink-0">
          {PROFILES.map((p) => {
            const Icon = p.icon;
            const isSelected = activeProfile === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyProfile(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shrink-0 cursor-pointer border ${
                  isSelected 
                    ? 'bg-white text-black border-white font-bold shadow-xs' 
                    : 'bg-[#21262d] text-slate-100 border-[#30363d] hover:bg-[#30363d] hover:text-white'
                }`}
                title={`${p.title} - ${p.description}`}
                aria-pressed={isSelected}
              >
                <Icon size={14} className={isSelected ? 'text-black' : 'text-sky-400'} />
                <span>{p.title}</span>
                {isSelected && <Check size={12} className="stroke-[3]" />}
              </button>
            );
          })}

          {/* Quick Font Size Controls (A- / A+) */}
          <div className="flex items-center gap-1 border-l border-[#30363d] pl-2 ml-1 shrink-0">
            <button
              type="button"
              onClick={decreaseFont}
              className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded text-xs font-bold transition-colors cursor-pointer"
              title="Yazı Boyutunu Küçült"
              aria-label="Yazı boyutunu küçült"
            >
              A-
            </button>
            <button
              type="button"
              onClick={increaseFont}
              className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded text-xs font-bold transition-colors cursor-pointer"
              title="Yazı Boyutunu Büyüt"
              aria-label="Yazı boyutunu büyüt"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors ml-auto xl:ml-1 font-medium shrink-0 cursor-pointer"
            title="Ayarları Sıfırla"
            aria-label="Tüm erişilebilirlik ayarlarını varsayılana sıfırla"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>

      </div>
    </div>
  );
}
