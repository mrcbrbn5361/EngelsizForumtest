'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { base64ToBlobUrl } from '@/lib/utils';

export interface TTSBoundary {
  charIndex: number;
  charLength: number;
}

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(1.0); // 0.5 to 2.0
  const [pitch, setPitch] = useState<number>(1.0); // 0.5 to 2.0
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [boundary, setBoundary] = useState<TTSBoundary | null>(null);
  const [audioSource, setAudioSource] = useState<'yeterly' | 'browser' | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Ref for the Yeterly high quality audio player
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const isYeterlyPlayingRef = useRef<boolean>(false);

  // Load available voices (for local fallback)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;
      
      setVoices(allVoices);

      // Prioritize Turkish voices
      const trVoice = allVoices.find(v => 
        v.lang.toLowerCase().startsWith('tr') || 
        v.lang.toLowerCase().includes('tr') ||
        v.name.toLowerCase().includes('turkish') ||
        v.name.toLowerCase().includes('türkçe')
      );

      if (trVoice) {
        setSelectedVoice(trVoice);
      } else if (allVoices.length > 0) {
        setSelectedVoice(allVoices[0]);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    // 1. Stop Yeterly Audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    isYeterlyPlayingRef.current = false;

    // 2. Stop Browser Synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setIsPaused(false);
    setBoundary(null);
    setAudioSource(null);
  }, []);

  // Web Speech API fallback player
  const playWebSpeechFallback = useCallback((cleanText: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel previous utterance and resume if suspended
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Voice and Turkish language setting
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'tr-TR';
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setAudioSource('browser');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setBoundary(null);
      setAudioSource(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis event notice:', e.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
      setBoundary(null);
      setAudioSource(null);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === '') {
        setBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 6,
        });
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, rate, pitch]);

  const play = useCallback(async (text: string) => {
    if (typeof window === 'undefined') return;

    // Stop anything currently speaking/playing
    stop();

    if (!text || !text.trim()) return;

    const cleanText = text
      .replace(/<[^>]*>/g, '') // Strip HTML
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip MD links
      .replace(/[*_#`~>]/g, '') // Strip formatting
      .trim();

    if (!cleanText) return;

    try {
      // Attempt Yeterly TTS
      const res = await fetch('/api/yeterly/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      const data = await res.json().catch(() => null);

      if (data && (data.audio_base64 || data.audio_url)) {
        // High quality Yeterly voice synthesized successfully
        const audioUrl = data.audio_url || (data.audio_base64 ? base64ToBlobUrl(data.audio_base64, 'audio/mpeg') : '');
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;
        isYeterlyPlayingRef.current = true;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
          setAudioSource('yeterly');
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          isYeterlyPlayingRef.current = false;
          audioPlayerRef.current = null;
          setAudioSource(null);
        };

        audio.onerror = (e) => {
          console.warn('Yeterly Audio playback notice, falling back to Web Speech:', e);
          setIsPlaying(false);
          setIsPaused(false);
          isYeterlyPlayingRef.current = false;
          audioPlayerRef.current = null;
          // Failover to browser speech synthesis
          playWebSpeechFallback(cleanText);
        };

        await audio.play();
        return;
      } else {
        // Smoothly fall back to browser Web Speech
        playWebSpeechFallback(cleanText);
      }
    } catch (err) {
      console.warn('Yeterly TTS fallback triggered:', err);
      isYeterlyPlayingRef.current = false;
      playWebSpeechFallback(cleanText);
    }
  }, [stop, playWebSpeechFallback]);

  const pause = useCallback(() => {
    if (isYeterlyPlayingRef.current && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPaused(true);
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (isYeterlyPlayingRef.current && audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(err => {
        console.error('Failed to resume audio:', err);
      });
      setIsPaused(false);
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  return {
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
  };
}

