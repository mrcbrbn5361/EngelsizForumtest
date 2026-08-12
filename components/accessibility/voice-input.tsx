'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  lang?: string;
  label?: string;
}

/**
 * Speech-to-Text component for hands-free forum interaction.
 * Uses Web Speech API (WCAG 2.2 AAA support for Motor Impairments).
 */
export function VoiceInput({ onTranscript, lang = 'tr-TR', label = 'Sesle Yaz' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = lang;

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
      toast.success('Ses başarıyla metne dönüştürüldü.');
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Mikrofon erişimi reddedildi.');
      } else {
        toast.error('Ses algılanamadı, lütfen tekrar deneyin.');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, [lang, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition start error', e);
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleListening}
        className={`vibe-button-primary !p-3 rounded-full transition-all flex items-center gap-2 group relative ${
          isListening ? 'bg-error shadow-error/40 animate-pulse' : 'bg-muted hover:bg-primary/20 text-foreground'
        }`}
        title={isListening ? 'Dinlemeyi Durdur' : label}
        aria-label={isListening ? 'Dinlemeyi durdur' : `${label} özelliğini başlat`}
        aria-pressed={isListening}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-tighter sm:inline hidden">Dinleniyor...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-primary'}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Visual Indicator for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {isListening ? 'Sistem sesinizi dinliyor, lütfen konuşun.' : ''}
      </div>
    </div>
  );
}
