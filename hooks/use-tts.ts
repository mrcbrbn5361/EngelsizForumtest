'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Ref for the Yeterly high quality audio player
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const isYeterlyPlayingRef = useRef<boolean>(false);

  // Load available voices (for local fallback)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      // Prioritize Turkish voices
      const trVoice = allVoices.find(v => v.lang.startsWith('tr')) || allVoices.find(v => v.lang.includes('TR'));
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
      if (window.speechSynthesis) {
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
  }, []);

  // Web Speech API fallback player
  const playWebSpeechFallback = useCallback((cleanText: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setBoundary(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis error:', e);
        setIsPlaying(false);
        setIsPaused(false);
        setBoundary(null);
      }
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 0,
        });
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, rate, pitch]);

  const play = useCallback(async (text: string) => {
    if (typeof window === 'undefined') return;

    // Stop anything currently speaking/playing
    stop();

    if (!text.trim()) return;

    const cleanText = text.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags

    try {
      // Attempt Yeterly TTS
      const res = await fetch('/api/yeterly/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!res.ok) {
        throw new Error('Yeterly API returned non-200 status');
      }

      const data = await res.json();
      if (data.audio_base64) {
        // High quality voice synthesized successfully
        const audioUrl = `data:audio/mpeg;base64,${data.audio_base64}`;
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;
        isYeterlyPlayingRef.current = true;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          isYeterlyPlayingRef.current = false;
          audioPlayerRef.current = null;
        };

        audio.onerror = (e) => {
          console.error('Yeterly Audio playback error:', e);
          setIsPlaying(false);
          setIsPaused(false);
          isYeterlyPlayingRef.current = false;
          audioPlayerRef.current = null;
          // Failover on runtime audio error
          playWebSpeechFallback(cleanText);
        };

        await audio.play();
        return;
      } else {
        throw new Error('No audio base64 returned');
      }
    } catch (err) {
      console.warn('Yeterly TTS failed or not configured, falling back to Web Speech API:', err);
      // Fallback
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
        console.error('Failed to resume Yeterly audio:', err);
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
    play,
    pause,
    resume,
    stop,
  };
}
