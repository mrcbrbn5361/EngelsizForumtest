'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onAudioRecorded?: (audioUrl: string, durationSec: number) => void;
  label?: string;
  className?: string;
}

// Web Speech API interface definitions
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function VoiceInput({
  onTranscript,
  onAudioRecorded,
  label = 'Sesle Yaz ve Yanıtla',
  className = '',
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState('Sesli komut ve ses kaydı hazır.');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Speech-to-Text handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Tarayıcınız ses tanıma teknolojisini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.');
      setStatusAnnouncement('Hata: Tarayıcı sesle yazma özelliğini desteklemiyor.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setStatusAnnouncement('Ses dinleme durduruldu.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusAnnouncement('Dinleniyor... Lütfen konuşun.');
        toast.info('Mikrofon aktif. Konuşmanız metne dönüştürülüyor...');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onTranscript(transcript);
          setStatusAnnouncement(`Algılanan metin: ${transcript}`);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setStatusAnnouncement(`Ses tanıma hatası: ${event.error}`);
        toast.error('Mikrofon erişiminde bir sorun oluştu.');
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusAnnouncement('Ses tanıma sonlandı.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      toast.error('Ses tanıma başlatılamadı.');
    }
  };

  // Audio Recording handler
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioRecorded) {
          onAudioRecorded(url, recordingTime);
        }
        setStatusAnnouncement('Ses kaydı tamamlandı. Dinlemek için oynat butonuna basabilirsiniz.');
        toast.success('Ses kaydınız hazırlandı!');
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingTime(0);
      setStatusAnnouncement('Ses kaydı başladı. Durdurmak için tekrar basın.');

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      toast.error('Mikrofon izni verilmedi veya cihaz bulunamadı.');
      setStatusAnnouncement('Hata: Mikrofon erişim izni reddedildi.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecordingAudio(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      setStatusAnnouncement('Ses kaydı duraklatıldı.');
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
      setStatusAnnouncement('Ses kaydı oynatılıyor.');
    }
  };

  const clearAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlayingAudio(false);
    setRecordingTime(0);
    setStatusAnnouncement('Ses kaydı silindi.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-foreground space-y-3 ${className}`}>
      {/* Dynamic Screen Reader Announcement for A11y */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusAnnouncement}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <span id="voice-label" className="text-sm font-semibold flex items-center gap-2 text-amber-200">
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          {label}
        </span>
        {isRecordingAudio && (
          <span className="text-xs font-mono bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/40 animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Kayıt: {formatTime(recordingTime)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Speech-to-Text Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          aria-labelledby="voice-label"
          aria-pressed={isListening}
          aria-describedby="stt-desc"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-md'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" aria-hidden="true" />
              <span>Dinlemeyi Durdur</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>Sesle Metin Yaz</span>
            </>
          )}
        </button>

        {/* Audio Note Recorder Button */}
        <button
          type="button"
          onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
          aria-label={isRecordingAudio ? 'Sesli yanıt kaydını bitir' : 'Sesli yanıt kaydı başlat'}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isRecordingAudio
              ? 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
        >
          {isRecordingAudio ? (
            <>
              <Square className="w-4 h-4 fill-current text-white" aria-hidden="true" />
              <span>Kaydı Bitir</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Ses Kaydı Al</span>
            </>
          )}
        </button>

        {/* Audio Preview Controls */}
        {audioUrl && (
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-amber-500/40">
            <button
              type="button"
              onClick={togglePlayAudio}
              aria-label={isPlayingAudio ? 'Ses kaydını duraklat' : 'Ses kaydını dinle'}
              className="p-1.5 bg-amber-500 text-slate-950 rounded-md hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              )}
            </button>
            <span className="text-xs text-amber-200 font-mono">
              {formatTime(recordingTime)}
            </span>
            <button
              type="button"
              onClick={clearAudio}
              aria-label="Ses kaydını sil ve yeniden başla"
              className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <p id="stt-desc" className="text-xs text-amber-200/70">
        Ekran okuyucu destekli sesli mesajlaşma ve Türkçe konuşmayı metne dökme özelliği.
      </p>
    </div>
  );
}
