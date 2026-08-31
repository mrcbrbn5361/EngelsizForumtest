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
  const [sttTimeLeft, setSttTimeLeft] = useState(30);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

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
      stopListening();
      toast.success('Ses başarıyla metne dönüştürüldü.');
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      stopListening();
      if (event.error === 'not-allowed') {
        toast.error('Mikrofon erişimi reddedildi.');
      } else {
        toast.error('Ses algılanamadı, lütfen tekrar deneyin.');
      }
    };

    recognitionInstance.onend = () => {
      stopListening();
    };

    setRecognition(recognitionInstance);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionInstance) {
        try { recognitionInstance.abort(); } catch {}
      }
    };
  }, [lang, onTranscript]);

  const stopListening = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognition) {
      try {
        recognition.stop();
        recognition.abort();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      stopListening();
    } else {
      try {
        recognition.start();
        setIsListening(true);
        setSttTimeLeft(30);
        toast.info('Sesle yazma başladı (30 saniye süre kotası).');

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSttTimeLeft((prev) => {
            if (prev <= 1) {
              stopListening();
              toast.warning('30 saniyelik sesli yazma süre kotanız doldu.');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (e) {
        console.error('Recognition start error', e);
        stopListening();
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
              <span className="text-[10px] font-black uppercase tracking-tighter sm:inline hidden">Dinleniyor ({sttTimeLeft}s)</span>
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
