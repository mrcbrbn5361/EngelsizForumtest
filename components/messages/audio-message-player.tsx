'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio play error:', err);
      });
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

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-2xl min-w-[200px] max-w-[280px]",
        isMe ? "bg-sky-700/80 text-white" : "bg-[#161f36] border border-white/[0.08] text-slate-200"
      )}
      role="region"
      aria-label="Sesli Mesaj Çalıcı"
    >
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer",
          isMe 
            ? "bg-white text-sky-700 hover:bg-slate-100 shadow-md" 
            : "bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20"
        )}
        aria-label={isPlaying ? "Sesli mesajı duraklat" : "Sesli mesajı oynat"}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Waveform bars / slider */}
        <div className="relative flex items-center h-4">
          <input
            type="range"
            min="0"
            max={totalDuration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 accent-sky-300 bg-black/20 rounded-lg appearance-none cursor-pointer"
            aria-label="Sesli mesaj ilerleme çubuğu"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-1">
            <Volume2 size={11} className={isPlaying ? "text-sky-300 animate-pulse" : "opacity-60"} />
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
