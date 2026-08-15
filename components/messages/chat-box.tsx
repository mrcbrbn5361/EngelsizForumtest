'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Message, Profile } from '@/types/database';
import { Send, Loader2, User } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';

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
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

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

  return (
    <div className="flex flex-col h-full bg-slate-950/40">
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
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserProfile.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-sky-600 text-white rounded-br-xs'
                        : 'bg-[#111726] border border-white/[0.08] text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
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
      <form onSubmit={handleSend} className="p-3 border-t border-white/[0.08] bg-[#111726]/90">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı buraya yazın..."
            disabled={sending}
            className="flex-1 h-10 px-4 text-xs rounded-xl bg-slate-900 border border-white/[0.08] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="size-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
}
