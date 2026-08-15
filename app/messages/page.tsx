'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatBox } from '@/components/messages/chat-box';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { MessageSquare, Loader2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: membersData, error: membersError } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (membersError) throw membersError;

        const convIds = membersData?.map(m => m.conversation_id) || [];
        if (convIds.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            members:conversation_members(
              user:profiles(*)
            ),
            last_message:messages(*)
          `)
          .in('id', convIds)
          .order('updated_at', { ascending: false });

        if (convError) throw convError;

        const processed = convData?.map(conv => {
          const otherMember = conv.members.find((m: any) => m.user.id !== user.id);
          const lastMsg = conv.last_message && conv.last_message.length > 0 
            ? conv.last_message.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null;
          
          return {
            ...conv,
            other_user: otherMember?.user,
            last_message: lastMsg,
            unread_count: 0 // In a real app, you'd calculate this
          };
        }) || [];

        setConversations(processed);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Realtime update for conversations (last message)
    const channel = supabase
      .channel('conversations_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  if (!user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] p-4 text-center">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <h1 className="text-2xl font-black uppercase tracking-widest">Yükleniyor...</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="container mx-auto px-4 py-6 md:py-8 h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] min-h-[500px] max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">Mesajlar</h1>
            <p className="text-xs text-muted-foreground font-normal">Bireysel ve Özel Yazışmalarınız</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 h-[calc(100%-80px)] gap-0 bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          {/* List Sidebar */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-4 lg:col-span-3 border-r border-border/80 h-full overflow-hidden`}>
            <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sohbetler</span>
              <div className="size-2 bg-sky-400 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList 
                conversations={conversations} 
                selectedId={selectedConvId || undefined} 
                onSelect={(id) => {
                  setSelectedConvId(id);
                  setShowListOnMobile(false);
                }} 
                loading={loading}
              />
            </div>
          </div>

          {/* Chat Content */}
          <div className={`${!showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-8 lg:col-span-9 h-full relative bg-background/50`}>
            {selectedConversation ? (
              <>
                <button 
                  onClick={() => setShowListOnMobile(true)}
                  className="md:hidden absolute top-3 left-3 z-50 p-2 bg-card border border-border/80 rounded-xl shadow-sm cursor-pointer"
                >
                  <Menu size={18} />
                </button>
                <ChatBox 
                  conversationId={selectedConversation.id} 
                  currentUserProfile={profile} 
                  otherUser={selectedConversation.other_user} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                <MessageSquare size={64} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold tracking-tight text-foreground">Bir sohbet seçin</h3>
                <p className="text-xs text-muted-foreground mt-1">Yazışmaya başlamak için sol listeden bir görüşme seçin</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
