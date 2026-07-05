'use client';

import React, { useState } from 'react';
import { useTTS } from '@/hooks/use-tts';
import { Play, Pause, Square, Volume2, Settings2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextToSpeechControlsProps {
  text: string;
  title?: string;
  className?: string;
}

export function TextToSpeechControls({ text, title = "Metni Seslendir", className }: TextToSpeechControlsProps) {
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    isPlaying,
    isPaused,
    boundary,
    play,
    pause,
    resume,
    stop,
  } = useTTS();

  const [showSettings, setShowSettings] = useState(false);

  // Clean HTML if any
  const plainText = React.useMemo(() => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  }, [text]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      play(plainText);
    }
  };

  const renderHighlightedText = () => {
    if (!plainText) return null;
    if (!isPlaying || !boundary) {
      return <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{plainText}</p>;
    }

    const { charIndex, charLength } = boundary;
    const start = plainText.slice(0, charIndex);
    const word = plainText.slice(charIndex, charIndex + charLength);
    const end = plainText.slice(charIndex + charLength);

    return (
      <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
        {start}
        <mark className="bg-primary/30 text-foreground px-1 py-0.5 rounded font-black border-b-2 border-primary transition-all duration-75">
          {word}
        </mark>
        {end}
      </p>
    );
  };

  const trVoices = voices.filter(v => v.lang.startsWith('tr') || v.lang.includes('TR'));
  const otherVoices = voices.filter(v => !v.lang.startsWith('tr') && !v.lang.includes('TR'));

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6 shadow-lg", className)} role="region" aria-label="Ekran Okuyucu ve Seslendirme Paneli">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <Volume2 size={20} aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-black text-sm tracking-widest uppercase text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground font-medium">Biyonik okuma ve kelime odaklı seslendirme kontrolü</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Main TTS Action Button */}
          <button
            onClick={handlePlayToggle}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isPlaying && !isPaused
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
            )}
            aria-label={isPlaying && !isPaused ? "Seslendirmeyi duraklat" : "Seslendirmeyi başlat"}
          >
            {isPlaying && !isPaused ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying && !isPaused ? "DURAKLAT" : "DİNLE"}
          </button>

          {isPlaying && (
            <button
              onClick={stop}
              className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
              aria-label="Seslendirmeyi durdur"
            >
              <Square size={14} />
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-xl transition-all border border-transparent",
              showSettings ? "bg-muted border-border" : "hover:bg-muted"
            )}
            aria-expanded={showSettings}
            aria-label="Ses ayarları panelini göster/gizle"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {/* Settings Expandable Panel */}
      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 rounded-2xl p-4 border border-border mb-4 animate-in fade-in slide-in-from-top-1">
          {/* Voice select */}
          <div className="space-y-2">
            <label htmlFor="voice-select" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              SES SEÇİMİ <span>({voices.length} ses)</span>
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  if (voice) setSelectedVoice(voice);
                }}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer pr-8"
              >
                {trVoices.length > 0 && (
                  <optgroup label="Türkçe Sesler">
                    {trVoices.map((v, index) => (
                      <option key={`${v.name}-${v.lang}-${index}`} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </optgroup>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="Diğer Sesler">
                    {otherVoices.slice(0, 15).map((v, index) => (
                      <option key={`${v.name}-${v.lang}-${index}`} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>
          </div>

          {/* Speed slider */}
          <div className="space-y-2">
            <label htmlFor="speed-slider" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex justify-between">
              OKUMA HIZI <span>{rate}x</span>
            </label>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-2">
            <label htmlFor="pitch-slider" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex justify-between">
              SES TONU <span>{pitch}</span>
            </label>
            <input
              id="pitch-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Spoken Text Display with Dynamic Highlight */}
      <div className="bg-muted/10 rounded-2xl p-4 border border-border/50 max-h-48 overflow-y-auto">
        {renderHighlightedText()}
      </div>
    </div>
  );
}
