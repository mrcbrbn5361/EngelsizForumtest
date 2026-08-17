'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Message, Profile } from '@/types/database';
import { Send, Loader2, User, Mic, MicOff, Square, Trash2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { AudioMessagePlayer } from './audio-message-player';

interface ChatBoxProps {
  conversationId: string;
  currentUserProfile: Profile;
  otherUser: Profile;
}

export function ChatBox({ conversationId, currentUserProfile, otherUser }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

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
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some(m => m.id === (payload.new as Message).id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationId]);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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
        // Stop audio tracks
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

      // Upload to Supabase Storage if bucket exists
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

      // If storage url was not obtained, convert to base64 Data URL
      if (!finalAudioUrl) {
        finalAudioUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(recordedAudioBlob);
        });
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          sender_id: currentUserProfile.id,
          content: '🎤 Sesli Mesaj',
          message_type: 'audio',
          audio_url: finalAudioUrl,
          duration: recordingTime || 1,
          is_voice_message: true,
        });

      if (error) throw error;

      // Reset recording state
      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);
      setRecordingTime(0);
      toast.success('Sesli mesaj gönderildi.');
    } catch (err: any) {
      console.error('Error sending voice message:', err);
      toast.error('Sesli mesaj gönderilemedi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: generateUUID(),
          conversation_id: conversationId,
          sender_id: currentUserProfile.id,
          content: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Mesaj gönderilemedi.');
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
    <div id="chat-box-container" className="flex flex-col h-full bg-slate-950/40">
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#111726]/90 flex items-center justify-between">
        <div className="flex items-center gap-3 pl-8 md:pl-0">
          <UserAvatar 
            src={otherUser?.avatar_url}
            username={otherUser?.username}
            name={otherUser?.full_name}
            size="sm"
            className="rounded-xl border border-white/[0.08]"
          />
          <div>
            <h2 className="font-semibold text-xs text-slate-100">{otherUser?.full_name || otherUser?.username || 'Kullanıcı'}</h2>
            <p className="text-[10px] text-sky-400 font-mono">@{otherUser?.username || 'isimsiz'}</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-sky-400" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <User size={40} className="opacity-30" />
            <p className="text-xs font-semibold text-slate-400 mt-2">Henüz mesaj yok</p>
            <p className="text-[11px] text-slate-500">Yazılı veya sesli mesaj göndererek sohbeti başlatın.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserProfile.id;
            const isAudio = msg.message_type === 'audio' || msg.is_voice_message || !!msg.audio_url;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                  {isAudio && msg.audio_url ? (
                    <AudioMessagePlayer 
                      audioUrl={msg.audio_url} 
                      duration={msg.duration || 0} 
                      isMe={isMe} 
                    />
                  ) : (
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-br-xs shadow-md'
                          : 'bg-[#111726] border border-white/[0.08] text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  <div className={`text-[10px] text-slate-500 px-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: tr })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-white/[0.08] bg-[#111726]/90">
        {/* Active Recording UI */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold text-rose-400">Ses Kaydediliyor...</span>
              <span className="font-mono text-slate-300">({formatSecs(recordingTime)})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="İptal Et"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer shadow-md"
              >
                <Square size={13} />
                <span>BİTİR</span>
              </button>
            </div>
          </div>
        ) : recordedAudioUrl ? (
          /* Recorded Audio Preview before Send */
          <div className="flex items-center justify-between gap-3 bg-slate-900 border border-sky-500/30 rounded-xl px-3.5 py-2">
            <div className="flex-1 min-w-0">
              <AudioMessagePlayer audioUrl={recordedAudioUrl} duration={recordingTime} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Sil"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={sendVoiceMessage}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer shadow-md disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                <span>GÖNDER</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Text & Voice Input Form */
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              disabled={sending}
              className="flex-1 h-10 px-4 text-xs rounded-xl bg-slate-900 border border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            {/* Voice Record Button */}
            <button
              id="voice-record-button"
              type="button"
              onClick={startRecording}
              className="size-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-sky-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Sesli Mesaj Kaydet"
              aria-label="Sesli Mesaj Kaydet"
            >
              <Mic size={16} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="size-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Mesaj Gönder"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

