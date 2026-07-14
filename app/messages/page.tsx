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
      <main className="vibe-container py-8 md:py-12 h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] min-h-[500px]">
        <div className="flex items-center gap-4 mb-8">
          <MessageSquare size={32} className="text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Mesajlar</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Özel Yazışmaların</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 h-full gap-0 md:gap-8 bg-card border rounded-2xl overflow-hidden shadow-xl">
          {/* List Sidebar */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-4 lg:col-span-3 border-r h-full overflow-hidden`}>
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sohbetler</span>
              <div className="size-2 bg-primary rounded-full animate-pulse" />
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
          <div className={`${!showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-8 lg:col-span-9 h-full relative`}>
            {selectedConversation ? (
              <>
                <button 
                  onClick={() => setShowListOnMobile(true)}
                  className="md:hidden absolute top-4 left-4 z-50 p-2 bg-card border rounded-full shadow-md"
                >
                  <Menu size={20} />
                </button>
                <ChatBox 
                  conversationId={selectedConversation.id} 
                  currentUserProfile={profile} 
                  otherUser={selectedConversation.other_user} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-20 grayscale">
                <MessageSquare size={128} />
                <h3 className="text-2xl font-black uppercase mt-8 tracking-tighter">Bir sohbet seçin</h3>
                <p className="text-sm font-bold uppercase tracking-widest mt-2">Yazışmaya başlamak için listeden birini seçin</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
