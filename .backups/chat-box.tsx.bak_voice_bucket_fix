'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Message, Profile } from '@/types/database';
import { Send, Loader2, User, Mic, Square, Trash2, Check, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { sendMessageAction, getConversationMessagesAction } from '@/app/actions';
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
  try {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    const { data } = supabase.storage.from('forum-assets').getPublicUrl(cleanPath);
    return data?.publicUrl || trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Normalizes message object to guarantee voice metadata presence and correct structure.
 */
export function normalizeChatMessage(rawMsg: any): Message {
  const vm = rawMsg.voice || null;
  let audioUrl = '';
  if (vm) {
    audioUrl = resolveAudioUrl(vm.audio_url || vm.storage_path);
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
      audio_url: audioUrl || vm.storage_path,
    } : (isVoice && audioUrl ? {
      id: rawMsg.id,
      message_id: rawMsg.id,
      storage_path: audioUrl,
      duration,
      mime_type: 'audio/webm',
      audio_url: audioUrl,
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
  const bestAudioUrl = normalizedIncoming.audio_url || existingMsg.audio_url || bestVoice?.audio_url || (bestVoice?.storage_path ? resolveAudioUrl(bestVoice.storage_path) : null);
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
      audio_url: bestAudioUrl || bestVoice.audio_url || bestVoice.storage_path,
    } : null,
  };
}

export function ChatBox({ conversationId, currentUserProfile, otherUser, onBack }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined' && conversationId) {
      try {
        const cached = localStorage.getItem(`engelsiz_chat_${conversationId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeChatMessage);
          }
        }
      } catch {}
    }
    return [];
  });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to persist messages locally
  const saveToLocalCache = useCallback((newMsgs: Message[]) => {
    if (typeof window !== 'undefined' && conversationId && Array.isArray(newMsgs)) {
      try {
        localStorage.setItem(`engelsiz_chat_${conversationId}`, JSON.stringify(newMsgs));
      } catch (e) {
        console.warn('Cache write failed:', e);
      }
    }
  }, [conversationId]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setError(null);

    // If we don't have cached messages, show loading spinner
    if (messages.length === 0) {
      setLoading(true);
    }

    try {
      // 1. Try server action with service role fallback
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
          saveToLocalCache(combined);
          return combined;
        });
      } else {
        // Fallback to client query
        const { data: rawMessages, error: fetchErr } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!fetchErr && rawMessages) {
          const messageIds = rawMessages.map(m => m.id);
          let voiceMap = new Map<string, any>();
          if (messageIds.length > 0) {
            const { data: voiceRows } = await supabase
              .from('voice_messages')
              .select('*')
              .in('message_id', messageIds);

            if (voiceRows) {
              voiceRows.forEach(vm => voiceMap.set(vm.message_id, vm));
            }
          }

          const combined = rawMessages.map(m => {
            const vm = voiceMap.get(m.id);
            const resolved = vm ? resolveAudioUrl(vm.storage_path) : null;
            return normalizeChatMessage({
              ...m,
              audio_url: resolved || m.audio_url,
              media_url: resolved || m.media_url,
              duration: vm?.duration || m.duration,
              is_voice_message: Boolean(vm || m.is_voice_message),
              voice: vm ? {
                ...vm,
                audio_url: resolved,
              } : null,
            });
          });

          setMessages(combined);
          saveToLocalCache(combined);
        }
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [conversationId, messages.length, saveToLocalCache, scrollToBottom]);

  // When conversationId changes, load cache immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && conversationId) {
      try {
        const cached = localStorage.getItem(`engelsiz_chat_${conversationId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setMessages(parsed.map(normalizeChatMessage));
          }
        }
      } catch {}
    }
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
        async (payload) => {
          const rawNew = payload.new as Message;
          const newMsg = normalizeChatMessage(rawNew);

          // If message is a voice message but doesn't have voice/audio_url yet, fetch its voice_messages row
          if (newMsg.is_voice_message && (!newMsg.voice || !newMsg.audio_url)) {
            try {
              const { data: vmRow } = await supabase
                .from('voice_messages')
                .select('*')
                .eq('message_id', newMsg.id)
                .maybeSingle();

              if (vmRow) {
                const resolved = resolveAudioUrl(vmRow.storage_path);
                newMsg.audio_url = resolved;
                newMsg.media_url = resolved;
                newMsg.duration = vmRow.duration;
                newMsg.voice = {
                  ...vmRow,
                  audio_url: resolved,
                };
              }
            } catch (err) {
              console.warn('Realtime voice metadata fetch notice:', err);
            }
          }

          setMessages((prev) => {
            const existingIndex = prev.findIndex(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.sender_id === newMsg.sender_id && m.content === newMsg.content));
            if (existingIndex !== -1) {
              const old = prev[existingIndex];
              const merged = mergeMessagePreservingVoice(old, newMsg);
              const updated = [...prev];
              updated[existingIndex] = merged;
              const cleaned = updated.filter((m, idx) => idx === existingIndex || m.id !== old.id);
              saveToLocalCache(cleaned);
              return cleaned;
            }

            const withoutTemp = prev.filter(m => !(
              (m.id.startsWith('temp-') && m.sender_id === newMsg.sender_id && m.content === newMsg.content) ||
              (m.id === `temp-${newMsg.id}`)
            ));

            const matchingOpt = prev.find(m => 
              (m.id.startsWith('temp-') && m.sender_id === newMsg.sender_id && m.content === newMsg.content) ||
              m.id === newMsg.id
            );

            const finalMsg = mergeMessagePreservingVoice(matchingOpt || null, newMsg);

            const updated = [...withoutTemp, finalMsg];
            saveToLocalCache(updated);
            return updated;
          });
          setTimeout(() => scrollToBottom(true), 50);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_messages',
        },
        (payload) => {
          const vmRow = payload.new as any;
          if (!vmRow || !vmRow.message_id) return;
          const resolved = resolveAudioUrl(vmRow.storage_path);
          setMessages(prev => {
            const index = prev.findIndex(m => m.id === vmRow.message_id);
            if (index === -1) return prev;
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              audio_url: resolved,
              media_url: resolved,
              duration: vmRow.duration || updated[index].duration,
              is_voice_message: true,
              voice: {
                ...vmRow,
                audio_url: resolved,
              },
            };
            saveToLocalCache(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationId, fetchMessages, saveToLocalCache, scrollToBottom]);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        toast.error('Tarayıcınız ses kaydını desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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

    setSending(true);
    try {
      const messageId = generateUUID();
      const fileName = `voice_${conversationId}_${Date.now()}.webm`;
      const filePath = `voice-messages/${fileName}`;

      let finalAudioUrl = '';
      try {
        const { error: uploadError } = await supabase.storage
          .from('forum-assets')
          .upload(filePath, recordedAudioBlob, {
            contentType: 'audio/webm',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('forum-assets')
            .getPublicUrl(filePath);
          finalAudioUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload fallback:', err);
      }

      if (!finalAudioUrl) {
        finalAudioUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(recordedAudioBlob);
        });
      }

      const optimisticMsg: Message = {
        id: messageId,
        conversation_id: conversationId,
        sender_id: currentUserProfile.id,
        content: '🎤 Sesli Mesaj',
        message_type: 'audio',
        audio_url: finalAudioUrl,
        media_url: finalAudioUrl,
        duration: recordingTime || 1,
        is_voice_message: true,
        voice: {
          id: messageId,
          message_id: messageId,
          storage_path: finalAudioUrl,
          duration: recordingTime || 1,
          mime_type: 'audio/webm',
          created_at: new Date().toISOString(),
          audio_url: finalAudioUrl,
        },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => {
        const exists = prev.some(m => m.id === messageId);
        const updated = exists ? prev : [...prev, optimisticMsg];
        saveToLocalCache(updated);
        return updated;
      });

      const res = await sendMessageAction({
        conversationId,
        content: '🎤 Sesli Mesaj',
        messageType: 'audio',
        audioUrl: finalAudioUrl,
        duration: recordingTime || 1,
        messageId,
      });

      if (!res.success) {
        throw new Error(res.error || 'Sesli mesaj kaydedilemedi.');
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
              audio_url: normalizedServer.audio_url || optimisticMsg.audio_url || finalAudioUrl,
              media_url: normalizedServer.media_url || optimisticMsg.media_url || finalAudioUrl,
              voice: normalizedServer.voice || optimisticMsg.voice,
              duration: normalizedServer.duration || optimisticMsg.duration,
            };
            saveToLocalCache(updated);
            return updated;
          }
          const updated = [...prev, normalizedServer];
          saveToLocalCache(updated);
          return updated;
        });
      }

      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);
      setRecordingTime(0);
      toast.success('Sesli mesaj iletildi.');
    } catch (err: any) {
      console.error('Error sending voice message:', err);
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

    // Optimistic UI update & immediate cache persist
    setMessages(prev => {
      const updated = [...prev, optimisticMessage];
      saveToLocalCache(updated);
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
          saveToLocalCache(replaced);
          return replaced;
        });
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.message || 'Mesaj gönderilemedi.');
      // Rollback optimistic message
      setMessages(prev => {
        const rolledBack = prev.filter(m => m.id !== tempId);
        saveToLocalCache(rolledBack);
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
    <div id="chat-box-container" className="flex flex-col h-full bg-[#090a0f] text-slate-100">
      {/* Accessible Chat Header */}
      <div className="p-3 md:p-3.5 border-b border-white/[0.08] bg-[#111726] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer shrink-0"
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
            className="rounded-xl border border-white/[0.08] shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-xs text-slate-100 leading-none mb-0.5 truncate">
              {otherUser?.full_name || otherUser?.username || 'Kullanıcı'}
            </h2>
            <p className="text-[10px] text-sky-400 font-mono truncate">@{otherUser?.username || 'isimsiz'}</p>
          </div>
        </div>

        {otherUser?.id && (
          <a
            href={`/profile/${otherUser.id}`}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-sky-400 border border-white/[0.08] transition-colors shrink-0"
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
            <Loader2 className="animate-spin text-sky-400" size={24} aria-hidden="true" />
            <p className="text-xs text-slate-400 font-medium">Mesajlar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <AlertCircle size={32} className="text-destructive mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-slate-300">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#161f33] hover:bg-[#1c2740] text-xs text-sky-400 font-bold border border-white/[0.08] cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Tekrar Dene
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 mb-3">
              <User size={24} className="text-sky-400" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold text-slate-200">Henüz mesaj yok</p>
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
              (msg.voice?.storage_path ? resolveAudioUrl(msg.voice.storage_path) : '') ||
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
                    ) : (
                      <div className={`flex items-center gap-2 p-3 rounded-2xl text-xs ${
                        isMe ? 'bg-sky-500/80 text-slate-950 font-medium' : 'bg-[#161f33] border border-white/[0.08] text-slate-300'
                      }`}>
                        <Loader2 className="animate-spin text-sky-400 size-3.5 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] font-medium">Sesli mesaj yükleniyor...</span>
                      </div>
                    )
                  ) : (
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-br-xs shadow-md'
                          : 'bg-[#111726] border border-white/[0.08] text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  <div className={`text-[10px] text-slate-500 px-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
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
      <div className="p-3 border-t border-white/[0.08] bg-[#111726]">
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" aria-hidden="true" />
              <span className="font-bold text-rose-400">Ses Kaydediliyor...</span>
              <span className="font-mono text-slate-300">({formatSecs(recordingTime)})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="İptal Et"
                aria-label="Ses Kaydını İptal Et"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md"
                aria-label="Kaydı Tamamla"
              >
                <Square size={13} aria-hidden="true" />
                <span>BİTİR</span>
              </button>
            </div>
          </div>
        ) : recordedAudioUrl ? (
          <div className="flex items-center justify-between gap-3 bg-[#0b0f19] border border-sky-500/30 rounded-xl px-3.5 py-2">
            <div className="flex-1 min-w-0">
              <AudioMessagePlayer audioUrl={recordedAudioUrl} duration={recordingTime} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Sil"
                aria-label="Kaydı Sil"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={sendVoiceMessage}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
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
              className="flex-1 h-10 px-4 text-xs rounded-xl bg-[#0b0f19] border border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />

            {/* Voice Record Button */}
            <button
              id="voice-record-button"
              type="button"
              onClick={startRecording}
              className="w-10 h-10 rounded-xl bg-[#0b0f19] hover:bg-[#161f33] border border-white/[0.08] text-slate-300 hover:text-sky-400 flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
              title="Sesli Mesaj Kaydet"
              aria-label="Sesli Mesaj Kaydet"
            >
              <Mic size={16} aria-hidden="true" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 font-bold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
              aria-label="Mesaj Gönder"
            >
              {sending ? <Loader2 className="animate-spin text-slate-950" size={16} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
