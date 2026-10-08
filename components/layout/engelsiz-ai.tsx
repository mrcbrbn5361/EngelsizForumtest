'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, MessageSquare, X, Send, Loader2, Volume2, VolumeX, Mic, MicOff,
  CornerDownLeft, Shield, Accessibility, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { base64ToBlobUrl } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isReading?: boolean;
}

export function EngelsizAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Merhaba! Ben EngelsizAI, EngelsizForum\'un yapay zeka asistanıyım. Size engelli hakları, erişilebilirlik standartları, Balthazard hesaplama veya forum kullanımı hakkında nasıl yardımcı olabilirim?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition for Voice Input
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'tr-TR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev + ' ' + transcript).trim());
        setIsListening(false);
        toast.success('Sesiniz başarıyla yazıldı.');
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Sesinizi alamadım, lütfen tekrar deneyin.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast.error('Ses tanıma tarayıcınızda desteklenmiyor.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
        toast.info('Dinleniyor, konuşun...');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Stop any playing TTS audio
  const stopAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setCurrentlyPlayingId(null);
  }, [audioElement]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  // Text-To-Speech using Yeterly AI TTS API
  const handleTTS = async (messageId: string, text: string) => {
    if (currentlyPlayingId === messageId) {
      stopAudio();
      return;
    }

    stopAudio();
    setCurrentlyPlayingId(messageId);

    try {
      const response = await fetch('/api/yeterly/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success && data.audio_base64) {
        const audioSrc = base64ToBlobUrl(data.audio_base64);
        const audio = new Audio(audioSrc);
        setAudioElement(audio);
        audio.play();
        audio.onended = () => {
          setCurrentlyPlayingId(null);
        };
      } else if (data.fallback === 'web_speech' || !data.success) {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.onend = () => {
          setCurrentlyPlayingId(null);
        };
        utterance.onerror = () => {
          setCurrentlyPlayingId(null);
          toast.error('Seslendirme başarısız oldu.');
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Native Web Speech Fallback on Network Error
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.onend = () => {
        setCurrentlyPlayingId(null);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    stopAudio();

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = { id: userMsgId, role: 'user', text };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'model' ? 'ai' : 'user',
        content: m.text
      }));

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const replyText = data.text || 'Üzgünüm, şu an yanıt veremiyorum.';
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: replyText }]);
    } catch (error: any) {
      console.error('Chat AI Error:', error);
      toast.error('Asistan bağlantı hatası.');
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Balthazard formülü nedir?',
    'ÖTV muafiyet sınırı 2026',
    'Ekran okuyucu uyumluluğu',
    'Engelli hakları nelerdir?'
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[60] pointer-events-none">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            stopAudio();
          }}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl shadow-xl pointer-events-auto flex items-center justify-center bg-sky-700 hover:bg-sky-600 text-white transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none relative group border-2 border-white/20"
          aria-label="EngelsizAI Yapay Zeka Asistanı"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Sparkles size={22} className="animate-pulse" />}
          
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap font-bold uppercase tracking-wider">
            EngelsizAI
          </span>
        </button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[calc(100dvh-7rem)] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
            role="dialog"
            aria-label="EngelsizAI Yapay Zeka Asistanı Sohbet Penceresi"
          >
            {/* Header */}
            <div className="bg-sky-800 dark:bg-slate-950 text-white py-3.5 px-4 flex items-center justify-between border-b border-sky-700 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    EngelsizAI
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">AKTİF</span>
                  </h3>
                  <p className="text-[10px] text-slate-200 dark:text-slate-400">Erişilebilirlik ve Forum Asistanı</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  stopAudio();
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Asistanı Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat History Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-xl p-3 text-xs sm:text-sm shadow-xs border relative group ${
                      msg.role === 'user' 
                        ? 'bg-sky-700 dark:bg-sky-600 text-white border-sky-800 dark:border-sky-500' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    
                    {/* TTS Read Aloud Icon Button */}
                    <div className="mt-2 flex justify-end gap-1.5 items-center opacity-85">
                      <button
                        onClick={() => handleTTS(msg.id, msg.text)}
                        className={`p-1 rounded transition-colors ${
                          msg.role === 'user'
                            ? 'text-white/80 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={currentlyPlayingId === msg.id ? 'Seslendirmeyi durdur' : 'Sesli oku (Yeterly AI)'}
                        aria-label={currentlyPlayingId === msg.id ? 'Seslendirmeyi durdur' : 'Mesajı seslendir'}
                      >
                        {currentlyPlayingId === msg.id ? (
                          <VolumeX size={13} className="animate-bounce" />
                        ) : (
                          <Volume2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 shadow-xs">
                    <Loader2 size={14} className="animate-spin text-sky-600 dark:text-sky-400" />
                    <span>EngelsizAI düşünüyor...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Quick Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <HelpCircle size={11} /> Önerilen Sorular
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSendMessage(s)}
                      className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-300 rounded-lg px-2 py-1 text-left transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Action Form */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                    isListening 
                      ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:border-sky-500'
                  }`}
                  title={isListening ? 'Dinlemeyi Durdur' : 'Sesle Soru Sor'}
                  aria-label={isListening ? 'Mikrofonu durdur' : 'Sesle yazmayı etkinleştir'}
                >
                  <Mic size={15} />
                </button>

                <input
                  ref={chatInputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? 'Konuşmanız dinleniyor...' : 'Asistana sorun...'}
                  disabled={loading}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  aria-label="Asistana gönderilecek mesaj"
                />

                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white disabled:opacity-40 transition-all shadow-sm shrink-0 cursor-pointer"
                  aria-label="Gönder"
                >
                  <Send size={15} />
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-medium px-1">
                <span className="flex items-center gap-1">
                  <Shield size={10} className="text-emerald-500" />
                  Erişilebilir Yapay Zeka Rehberi
                </span>
                <span>Powered by Gemini</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
