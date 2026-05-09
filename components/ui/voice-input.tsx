'use client';

import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  label?: string;
}

/**
 * VoiceInput: Speech-to-Text component for forum interactions.
 * Helps motor-impaired users to write without typing.
 */
export function VoiceInput({ onTranscript, label = 'Sesle Yaz' }: VoiceInputProps) {
  const { voiceMode } = useAccessibility();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!voiceMode || !browserSupportsSpeechRecognition) {
    return null;
  }

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' });
    toast.info('Ses tanıma başlatıldı. Lütfen konuşun.');
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    onTranscript(transcript);
    toast.success('Ses tanıma durduruldu');
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-xl border border-border">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">{label}</span>
      
      <div className="flex-1 flex items-center gap-1 overflow-hidden">
        {listening && (
          <div className="flex gap-1 animate-pulse ml-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-3 bg-primary rounded-full" />
            ))}
          </div>
        )}
        <span className="text-xs italic truncate text-muted-foreground ml-2">
          {transcript || 'Konuşmaya başlamak için mikrofona basın...'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {transcript && (
          <button
            onClick={resetTranscript}
            className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
            aria-label="Metni Temizle"
          >
            <RotateCcw size={16} />
          </button>
        )}
        
        {!listening ? (
          <button
            onClick={startListening}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all shadow-md"
            aria-label="Ses Tanımayı Başlat"
          >
            <Mic size={18} />
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="p-2 rounded-full bg-red-600 text-white animate-pulse shadow-md"
            aria-label="Ses Tanımayı Durdur"
          >
            <MicOff size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
