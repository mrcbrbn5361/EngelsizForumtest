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

  // Load available voices
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
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setBoundary(null);
  }, []);

  const play = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Stop current speaking
    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const cleanText = text.replace(/<[^>]*>/g, ''); // Strip any HTML tags
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

    // Highlight text segments
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

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
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
