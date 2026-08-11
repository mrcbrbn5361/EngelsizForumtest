'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Message, Profile } from '@/types/database';
import { Send, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

    // Subscribe to new messages
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
    <div className="flex flex-col h-full bg-background border rounded-lg md:rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar 
            src={otherUser.avatar_url}
            username={otherUser.username}
            name={otherUser.full_name}
            size="md"
          />
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider">{otherUser.full_name}</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/5 scrollbar-thin scrollbar-thumb-primary/20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <User size={64} />
            <p className="text-sm font-black uppercase mt-4">Henüz sohbet başlamadı</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserProfile.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] space-y-1`}>
                  <div
                    className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card border border-border rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 ${isMe ? 'text-right' : 'text-left'}`}>
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
      <form onSubmit={handleSend} className="p-4 border-t bg-card">
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı buraya yazın..."
            disabled={sending}
            className="flex-1 vibe-input h-14 md:h-16 px-6 text-sm rounded-full bg-muted/30 border-transparent focus:border-primary/30"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="size-12 md:size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}
