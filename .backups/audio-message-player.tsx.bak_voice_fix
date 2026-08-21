'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioMessagePlayerProps {
  audioUrl: string;
  duration?: number;
  isMe?: boolean;
}

export function AudioMessagePlayer({ audioUrl, duration = 0, isMe = false }: AudioMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setHasError(false);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio play error:', err);
        setHasError(true);
      });
    }
  }, [isPlaying, hasError, playbackRate]);

  const cyclePlaybackRate = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2.5 rounded-2xl text-xs",
        isMe ? "bg-rose-950/40 border border-rose-500/30 text-rose-300" : "bg-[#161f33] border border-white/[0.08] text-rose-400"
      )}>
        <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
        <span className="text-[11px] font-medium">Ses dosyası oynatılamadı</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-2xl min-w-[220px] max-w-[300px]",
        isMe ? "bg-sky-500 text-slate-950 shadow-md font-medium" : "bg-[#161f33] border border-white/[0.08] text-slate-100"
      )}
      role="region"
      aria-label="Sesli Mesaj Çalıcı"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'k') {
          e.preventDefault();
          togglePlay();
        } else if (e.key === 'ArrowRight' && audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, totalDuration);
        } else if (e.key === 'ArrowLeft' && audioRef.current) {
          audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
        }
      }}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
          isMe 
            ? "bg-slate-950 text-sky-400 hover:bg-slate-900 shadow-md" 
            : "bg-sky-500 text-slate-950 hover:bg-sky-400 font-black shadow-md shadow-sky-500/20"
        )}
        aria-label={isPlaying ? "Sesli mesajı duraklat" : "Sesli mesajı oynat"}
      >
        {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} className="ml-0.5" aria-hidden="true" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Waveform track slider */}
        <div className="relative flex items-center h-4">
          <input
            type="range"
            min="0"
            max={totalDuration || 1}
            value={currentTime}
            onChange={handleSeek}
            className={cn(
              "w-full h-1.5 rounded-lg appearance-none cursor-pointer",
              isMe ? "accent-slate-950 bg-sky-600/60" : "accent-sky-400 bg-black/40"
            )}
            aria-label="Sesli mesaj ilerleme çubuğu"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono opacity-90">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className={cn(
                "px-1.5 py-0.2 rounded text-[9px] font-bold font-mono transition-colors cursor-pointer",
                isMe ? "bg-slate-950/20 hover:bg-slate-950/40 text-slate-950" : "bg-white/[0.08] hover:bg-white/[0.15] text-slate-300"
              )}
              title="Oynatma Hızını Değiştir"
              aria-label={`Oynatma hızı: ${playbackRate} katı`}
            >
              {playbackRate}x
            </button>
            <div className="flex items-center gap-1">
              <Volume2 size={11} className={isPlaying ? "text-sky-300 animate-pulse" : "opacity-60"} aria-hidden="true" />
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

