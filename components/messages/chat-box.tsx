'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseUrl } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Message, Profile } from '@/types/database';
import { Send, Loader2, User, Mic, Square, Trash2, Check, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { sendMessageAction, getConversationMessagesAction, sendVoiceMessageAction } from '@/app/actions';
import { AudioMessagePlayer } from './audio-message-player';

interface ChatBoxProps {
  conversationId: string;
  currentUserProfile: Profile;
  otherUser: Profile;
  onBack?: () => void;
}

/**
 * Resolves a storage path or URL into a fully-qualified browser playable audio URL.
 */
export function resolveAudioUrl(storagePathOrUrl?: string | null): string {
  if (!storagePathOrUrl || typeof storagePathOrUrl !== 'string') return '';
  const trimmed = storagePathOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  
  if (isSupabaseConfigured && supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/voice-messages/${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Normalizes message object to guarantee voice metadata presence and correct structure.
 */
export function normalizeChatMessage(rawMsg: any): Message {
  const vm = rawMsg.voice || null;
  let audioUrl = '';
  if (vm) {
    audioUrl = resolveAudioUrl(vm.audio_url);
  } else if (rawMsg.audio_url || rawMsg.media_url) {
    audioUrl = resolveAudioUrl(rawMsg.audio_url || rawMsg.media_url);
  }

  const isVoice = Boolean(
    vm ||
    rawMsg.is_voice_message ||
    rawMsg.message_type === 'audio' ||
    rawMsg.message_type === 'voice' ||
    audioUrl ||
    rawMsg.content === '🎤 Sesli Mesaj' ||
    rawMsg.content === 'Sesli Mesaj'
  );

  const duration = vm?.duration || rawMsg.duration || (isVoice ? 1 : 0);

  return {
    ...rawMsg,
    message_type: isVoice ? 'audio' : (rawMsg.message_type || 'text'),
    audio_url: audioUrl || rawMsg.audio_url || null,
    media_url: audioUrl || rawMsg.media_url || null,
    duration,
    is_voice_message: isVoice,
    voice: vm ? {
      ...vm,
      audio_url: audioUrl || vm.audio_url,
    } : (isVoice && audioUrl ? {
      id: rawMsg.id,
      user_id: rawMsg.sender_id,
      conversation_id: rawMsg.conversation_id,
      audio_url: audioUrl,
      duration,
      mime_type: 'audio/webm',
    } : null),
  };
}

/**
 * Canonical merge helper to ensure voice metadata and audio player state are never lost across realtime updates, refetches, or optimistic syncs.
 */
export function mergeMessagePreservingVoice(existingMsg: Message | null, incomingMsg: Message): Message {
  const normalizedIncoming = normalizeChatMessage(incomingMsg);
  if (!existingMsg) return normalizedIncoming;

  const bestVoice = normalizedIncoming.voice || existingMsg.voice || null;
  const bestAudioUrl = normalizedIncoming.audio_url || existingMsg.audio_url || bestVoice?.audio_url || null;
  const bestMediaUrl = normalizedIncoming.media_url || existingMsg.media_url || bestAudioUrl;
  const bestDuration = normalizedIncoming.duration || existingMsg.duration || bestVoice?.duration || 0;
  const isVoice = Boolean(
    bestVoice ||
    normalizedIncoming.is_voice_message ||
    existingMsg.is_voice_message ||
    normalizedIncoming.message_type === 'audio' ||
    existingMsg.message_type === 'audio' ||
    bestAudioUrl ||
    normalizedIncoming.content === '🎤 Sesli Mesaj' ||
    existingMsg.content === '🎤 Sesli Mesaj' ||
    normalizedIncoming.content === 'Sesli Mesaj' ||
    existingMsg.content === 'Sesli Mesaj'
  );

  return {
    ...existingMsg,
    ...normalizedIncoming,
    content: normalizedIncoming.content || existingMsg.content,
    message_type: isVoice ? 'audio' : (normalizedIncoming.message_type || existingMsg.message_type || 'text'),
    audio_url: bestAudioUrl,
    media_url: bestMediaUrl,
    duration: bestDuration,
    is_voice_message: isVoice,
    voice: bestVoice ? {
      ...bestVoice,
      audio_url: bestAudioUrl || bestVoice.audio_url,
    } : null,
  };
}

export function ChatBox({ conversationId, currentUserProfile, otherUser, onBack }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceLoadErrors, setVoiceLoadErrors] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setError(null);
    setLoading(true);

    try {
      // Server action with signed URL resolution
      const res = await getConversationMessagesAction(conversationId);
      if (res.success && Array.isArray(res.messages)) {
        const normalized = res.messages.map(normalizeChatMessage);
        setMessages(prev => {
          const prevMap = new Map<string, Message>();
          prev.forEach(m => prevMap.set(m.id, m));

          const mergedServer = normalized.map(sm => {
            const old = prevMap.get(sm.id) || prev.find(p => p.sender_id === sm.sender_id && p.content === sm.content && Math.abs(new Date(p.created_at).getTime() - new Date(sm.created_at).getTime()) < 15000);
            return mergeMessagePreservingVoice(old || null, sm);
          });

          const serverIds = new Set(normalized.map(m => m.id));
          const pending = prev.filter(m => (m.id.startsWith('temp-') || !serverIds.has(m.id)) && !mergedServer.some(sm => sm.id === m.id));
          const combined = [...mergedServer, ...pending].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          return combined;
        });
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [conversationId, scrollToBottom]);

  // When conversationId changes, load messages from Supabase
  useEffect(() => {
    setMessages([]);
    fetchMessages();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationId, fetchMessages, scrollToBottom]);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        toast.error('Tarayıcınız ses kaydını desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      toast.error('Mikrofona erişilemedi. Lütfen mikrofon izinlerinizi kontrol edin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const sendVoiceMessage = async () => {
    if (!recordedAudioBlob || sending) return;

    const messageId = generateUUID();
    setSending(true);
    try {
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(recordedAudioBlob);
      });

      const optimisticMsg: Message = {
        id: messageId,
        conversation_id: conversationId,
        sender_id: currentUserProfile.id,
        content: '🎤 Sesli Mesaj',
        message_type: 'audio',
        audio_url: recordedAudioUrl || '',
        media_url: recordedAudioUrl || '',
        duration: recordingTime || 1,
        is_voice_message: true,
        voice: {
          id: messageId,
          user_id: currentUserProfile.id,
          conversation_id: conversationId,
          audio_url: recordedAudioUrl || '',
          duration: recordingTime || 1,
          mime_type: 'audio/webm',
          created_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => {
        const exists = prev.some(m => m.id === messageId);
        const updated = exists ? prev : [...prev, optimisticMsg];
        return updated;
      });

      const res = await sendVoiceMessageAction({
        conversationId,
        audioBase64,
        duration: recordingTime || 1,
        messageId,
      });

      if (!res.success) {
        throw new Error(res.error || 'Sesli mesaj gönderilemedi.');
      }

      if (res.message) {
        const normalizedServer = normalizeChatMessage(res.message);
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === messageId || m.id === res.message.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...optimisticMsg,
              ...normalizedServer,
              audio_url: normalizedServer.audio_url || recordedAudioUrl || '',
              media_url: normalizedServer.media_url || recordedAudioUrl || '',
              voice: normalizedServer.voice ? {
                ...normalizedServer.voice,
                audio_url: normalizedServer.audio_url || recordedAudioUrl || '',
              } : optimisticMsg.voice,
              duration: normalizedServer.duration || optimisticMsg.duration,
            };
            return updated;
          }
          const updated = [...prev, normalizedServer];
          return updated;
        });
      }

      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);
      setRecordingTime(0);
      toast.success('Sesli mesaj başarıyla gönderildi.');
    } catch (err: any) {
      console.error('Error sending voice message:', err);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.error('Sesli mesaj gönderilemedi: ' + (err.message || 'Hata oluştu'));
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend || sending) return;

    const messageId = generateUUID();
    const tempId = `temp-${messageId}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserProfile.id,
      content: textToSend,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages(prev => {
      const updated = [...prev, optimisticMessage];
      return updated;
    });
    setNewMessage('');
    setSending(true);
    setTimeout(() => scrollToBottom(true), 30);

    try {
      const res = await sendMessageAction({
        conversationId,
        content: textToSend,
        messageType: 'text',
        messageId,
      });

      if (!res.success) {
        throw new Error(res.error || 'Mesaj gönderilemedi.');
      }

      // Replace temp message with server confirmed message
      if (res.message) {
        setMessages(prev => {
          const replaced = prev.map(m => (m.id === tempId ? res.message : m));
          return replaced;
        });
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.message || 'Mesaj gönderilemedi.');
      // Rollback optimistic message
      setMessages(prev => {
        const rolledBack = prev.filter(m => m.id !== tempId);
        return rolledBack;
      });
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const formatSecs = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div id="chat-box-container" className="flex flex-col h-full bg-[#0B1220] text-slate-100">
      {/* Accessible Chat Header */}
      <div className="p-3 md:p-3.5 border-b border-[#1E293B] bg-[#18243A] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-md bg-[#111B2E] border border-[#1E293B] text-slate-200 hover:bg-[#18243A] cursor-pointer shrink-0"
              aria-label="Sohbet listesine geri dön"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <UserAvatar 
            src={otherUser?.avatar_url}
            username={otherUser?.username}
            name={otherUser?.full_name}
            size="sm"
            className="rounded-md border border-[#1E293B] shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-xs text-white leading-none mb-0.5 truncate">
              {otherUser?.full_name || otherUser?.username || 'Kullanıcı'}
            </h2>
            <p className="text-[10px] text-indigo-400 font-mono font-medium truncate">@{otherUser?.username || 'isimsiz'}</p>
          </div>
        </div>

        {otherUser?.id && (
          <a
            href={`/profile/${otherUser.id}`}
            className="px-2.5 py-1 rounded-md bg-[#111B2E] hover:bg-[#1E293B] text-[11px] font-medium text-slate-200 hover:text-white border border-[#1E293B] transition-colors shrink-0"
          >
            Profili Gör
          </a>
        )}
      </div>

      {/* Messages Live Region */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3.5"
        role="log"
        aria-live="polite"
        aria-label="Mesajlaşma geçmişi"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin text-indigo-400" size={24} aria-hidden="true" />
            <p className="text-xs text-slate-400 font-normal">Mesajlar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <AlertCircle size={32} className="text-rose-400 mb-2" aria-hidden="true" />
            <p className="text-xs font-medium text-slate-300">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-3 px-3.5 py-1.5 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-xs text-indigo-400 font-medium border border-[#1E293B] cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Tekrar Dene
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6">
            <div className="w-12 h-12 rounded-md bg-[#18243A] flex items-center justify-center border border-[#1E293B] mb-3 text-indigo-400">
              <User size={24} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-white">Henüz mesaj yok</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              Yazılı veya sesli mesaj göndererek sohbeti başlatabilirsiniz.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserProfile.id;
            const isVoice = Boolean(
              msg.voice ||
              msg.is_voice_message ||
              msg.message_type === 'audio' ||
              msg.message_type === 'voice' ||
              msg.audio_url ||
              msg.media_url ||
              msg.content === '🎤 Sesli Mesaj' ||
              msg.content === 'Sesli Mesaj'
            );

            const audioSourceUrl = msg.voice?.audio_url ||
              (msg.audio_url ? resolveAudioUrl(msg.audio_url) : '') ||
              (msg.media_url ? resolveAudioUrl(msg.media_url) : '');

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                  {isVoice ? (
                    audioSourceUrl ? (
                      <AudioMessagePlayer 
                        audioUrl={audioSourceUrl} 
                        duration={msg.voice?.duration || msg.duration || 0} 
                        isMe={isMe} 
                      />
                    ) : voiceLoadErrors[msg.id] ? (
                      <div className={`flex flex-col gap-2 p-3 rounded-md text-xs ${
                        isMe ? 'bg-indigo-600 text-white font-medium' : 'bg-[#18243A] border border-[#1E293B] text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                          <AlertCircle size={14} aria-hidden="true" />
                          <span>Sesli mesaj yüklenemedi.</span>
                        </div>
                        <button
                          onClick={() => {
                            setVoiceLoadErrors(prev => ({ ...prev, [msg.id]: false }));
                            fetchMessages();
                          }}
                          className="px-2.5 py-1 rounded-md bg-black/20 hover:bg-black/30 text-[10px] font-medium inline-flex items-center gap-1 w-fit cursor-pointer text-slate-200"
                        >
                          <RefreshCw size={11} aria-hidden="true" />
                          Tekrar Dene
                        </button>
                      </div>
                    ) : (
                      <div className={`flex flex-col gap-2 p-3 rounded-md text-xs ${
                        isMe ? 'bg-indigo-600 text-white font-medium' : 'bg-[#18243A] border border-[#1E293B] text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                          <AlertCircle size={14} aria-hidden="true" />
                          <span>Sesli mesaj dosyası bulunamadı.</span>
                        </div>
                        <button
                          onClick={() => {
                            setVoiceLoadErrors(prev => ({ ...prev, [msg.id]: false }));
                            fetchMessages();
                          }}
                          className="px-2.5 py-1 rounded-md bg-black/20 hover:bg-black/30 text-[10px] font-medium inline-flex items-center gap-1 w-fit cursor-pointer text-slate-200"
                        >
                          <RefreshCw size={11} aria-hidden="true" />
                          Tekrar Dene
                        </button>
                      </div>
                    )
                  ) : (
                    <div
                      className={`p-3 rounded-md text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white font-normal shadow-sm'
                          : 'bg-[#18243A] border border-[#1E293B] text-slate-100 shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  <div className={`text-[10px] text-slate-400 px-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                    {msg.created_at ? format(new Date(msg.created_at), 'HH:mm', { locale: tr }) : 'şimdi'}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#1E293B] bg-[#111B2E]">
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-rose-950/30 border border-rose-800/60 rounded-md px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" aria-hidden="true" />
              <span className="font-semibold text-rose-300">Ses Kaydediliyor...</span>
              <span className="font-mono text-slate-400">({formatSecs(recordingTime)})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 transition-colors cursor-pointer"
                title="İptal Et"
                aria-label="Ses Kaydını İptal Et"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
                aria-label="Kaydı Tamamla"
              >
                <Square size={13} aria-hidden="true" />
                <span>BİTİR</span>
              </button>
            </div>
          </div>
        ) : recordedAudioUrl ? (
          <div className="flex items-center justify-between gap-3 bg-[#18243A] border border-indigo-500/50 rounded-md px-3.5 py-2">
            <div className="flex-1 min-w-0">
              <AudioMessagePlayer audioUrl={recordedAudioUrl} duration={recordingTime} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Sil"
                aria-label="Kaydı Sil"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={sendVoiceMessage}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-sm disabled:opacity-50"
                aria-label="Sesli Mesajı Gönder"
              >
                {sending ? <Loader2 className="animate-spin" size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                <span>GÖNDER</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              disabled={sending}
              aria-label="Mesaj metni"
              className="flex-1 h-10 px-3.5 text-xs font-medium rounded-md bg-[#18243A] border border-[#1E293B] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />

            {/* Voice Record Button */}
            <button
              id="voice-record-button"
              type="button"
              onClick={startRecording}
              className="w-10 h-10 rounded-md bg-[#18243A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
              title="Sesli Mesaj Kaydet"
              aria-label="Sesli Mesaj Kaydet"
            >
              <Mic size={16} aria-hidden="true" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 shadow-sm"
              aria-label="Mesaj Gönder"
            >
              {sending ? <Loader2 className="animate-spin text-white" size={16} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
