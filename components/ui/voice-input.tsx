'use client';

import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  label?: string;
}

export function VoiceInput({ onTranscript, label = 'Sesle Yaz' }: VoiceInputProps) {
  const { voiceMode } = useAccessibility();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Hydration hatasını önlemek için client-side kontrol
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !voiceMode || !browserSupportsSpeechRecognition) {
    return null;
  }

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' });
    toast.info('Ses tanıma başlatıldı.');
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    onTranscript(transcript);
    toast.success('Ses tanıma tamamlandı.');
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-xl border border-border">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">{label}</span>
      <div className="flex-1 flex items-center gap-2 overflow-hidden px-2">
        {listening && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
        <span className="text-xs truncate text-muted-foreground italic">
          {transcript || 'Konuşmaya başlayın...'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {transcript && (
          <button onClick={resetTranscript} className="p-2 hover:text-red-500" aria-label="Temizle">
            <RotateCcw size={16} />
          </button>
        )}
        <button
          onClick={listening ? stopListening : startListening}
          className={`p-2 rounded-full ${listening ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}`}
          aria-label={listening ? "Durdur" : "Mikrofonu Aç"}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      </div>
    </div>
  );
}
