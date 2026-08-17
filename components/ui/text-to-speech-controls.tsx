'use client';

import React, { useState } from 'react';
import { useTTS } from '@/hooks/use-tts';
import { Play, Pause, Square, Volume2, Settings2, ChevronDown, Sparkles } from 'lucide-react';
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
    audioSource,
    play,
    pause,
    resume,
    stop,
  } = useTTS();

  const [showSettings, setShowSettings] = useState(false);

  // Clean HTML if any
  const plainText = React.useMemo(() => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#`~>]/g, '')
      .trim();
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
      return <p className="text-xs md:text-sm leading-relaxed text-slate-300 select-text">{plainText}</p>;
    }

    const { charIndex, charLength } = boundary;
    const start = plainText.slice(0, charIndex);
    const word = plainText.slice(charIndex, charIndex + (charLength || 6));
    const end = plainText.slice(charIndex + (charLength || 6));

    return (
      <p className="text-xs md:text-sm leading-relaxed text-slate-300 select-text">
        {start}
        <mark className="bg-sky-500/30 text-sky-200 px-1 py-0.5 rounded font-semibold border-b border-sky-400 transition-all duration-75">
          {word}
        </mark>
        {end}
      </p>
    );
  };

  const trVoices = voices.filter(v => v.lang.toLowerCase().startsWith('tr') || v.lang.toLowerCase().includes('tr'));
  const otherVoices = voices.filter(v => !v.lang.toLowerCase().startsWith('tr') && !v.lang.toLowerCase().includes('tr'));

  return (
    <div 
      id="text-to-speech-panel"
      className={cn("rounded-2xl border border-white/[0.08] bg-[#0d1322]/90 backdrop-blur-md p-4 md:p-5 shadow-xl", className)} 
      role="region" 
      aria-label="Ekran Okuyucu ve Seslendirme Paneli"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl shrink-0 border border-sky-500/20">
            <Volume2 size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-xs text-slate-100 truncate" title={title}>{title}</h4>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30 animate-pulse">
                  <Sparkles size={10} />
                  {audioSource === 'yeterly' ? 'Yeterly AI Doğal Ses' : 'Seslendiriliyor'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Biyonik odaklı seslendirme ve kelime takibi</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Main TTS Action Button */}
          <button
            id="tts-toggle-button"
            type="button"
            onClick={handlePlayToggle}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer",
              isPlaying && !isPaused
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20"
            )}
            aria-label={isPlaying && !isPaused ? "Seslendirmeyi duraklat" : "Seslendirmeyi başlat"}
          >
            {isPlaying && !isPaused ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying && !isPaused ? "DURAKLAT" : "DİNLE"}</span>
          </button>

          {isPlaying && (
            <button
              id="tts-stop-button"
              type="button"
              onClick={stop}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20 cursor-pointer"
              aria-label="Seslendirmeyi durdur"
            >
              <Square size={13} />
            </button>
          )}

          <button
            id="tts-settings-toggle"
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-xl transition-all border cursor-pointer",
              showSettings 
                ? "bg-slate-800 border-sky-500/40 text-sky-400" 
                : "bg-slate-900 border-white/[0.08] text-slate-400 hover:text-slate-200"
            )}
            aria-expanded={showSettings}
            aria-label="Ses ayarları panelini göster/gizle"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* Settings Expandable Panel */}
      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 rounded-xl p-3.5 border border-white/[0.08] mb-3.5">
          {/* Voice select */}
          <div className="space-y-1.5">
            <label htmlFor="voice-select" className="text-[10px] font-semibold tracking-wider text-slate-400 flex items-center justify-between">
              <span>SES MOTORU</span>
              <span className="font-mono text-sky-400">({voices.length || 1} ses)</span>
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  if (voice) setSelectedVoice(voice);
                }}
                className="w-full bg-[#111726] border border-white/[0.08] text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-sky-500 appearance-none cursor-pointer pr-7"
              >
                {trVoices.length > 0 ? (
                  <optgroup label="Türkçe Sesler">
                    {trVoices.map((v, index) => (
                      <option key={`${v.name}-${v.lang}-${index}`} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </optgroup>
                ) : (
                  <option value="">Varsayılan Türkçe Seslendirici</option>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="Diğer Diller">
                    {otherVoices.slice(0, 10).map((v, index) => (
                      <option key={`${v.name}-${v.lang}-${index}`} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>
          </div>

          {/* Speed slider */}
          <div className="space-y-1.5">
            <label htmlFor="speed-slider" className="text-[10px] font-semibold tracking-wider text-slate-400 flex justify-between">
              <span>OKUMA HIZI</span>
              <span className="font-mono text-sky-400">{rate}x</span>
            </label>
            <input
              id="speed-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-1.5">
            <label htmlFor="pitch-slider" className="text-[10px] font-semibold tracking-wider text-slate-400 flex justify-between">
              <span>SES TONU</span>
              <span className="font-mono text-sky-400">{pitch}</span>
            </label>
            <input
              id="pitch-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Spoken Text Display with Dynamic Highlight */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-white/[0.06] max-h-36 overflow-y-auto">
        {renderHighlightedText()}
      </div>
    </div>
  );
}

