'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatBox } from '@/components/messages/chat-box';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Loader2, Menu } from 'lucide-react';

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
            unread_count: 0
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="animate-spin text-sky-400 mb-2 size-7" />
          <p className="text-xs text-slate-400">Mesajlar yükleniyor...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 h-[calc(100vh-140px)] min-h-[500px] max-w-7xl flex flex-col">
        <div className="flex items-center gap-2.5 mb-4 shrink-0">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">Özel Mesajlar</h1>
            <p className="text-xs text-slate-400">Üyeler arası bireysel dayanışma ve yazışmalar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 bg-[#111726]/80 border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md">
          {/* List Sidebar */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-4 lg:col-span-3 border-r border-white/[0.08] h-full overflow-hidden`}>
            <div className="p-3 border-b border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Sohbetler</span>
              <div className="size-2 bg-sky-400 rounded-full" />
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
          <div className={`${!showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-8 lg:col-span-9 h-full relative bg-slate-950/40`}>
            {selectedConversation ? (
              <>
                <button 
                  onClick={() => setShowListOnMobile(true)}
                  className="md:hidden absolute top-3 left-3 z-50 p-1.5 bg-slate-900 border border-white/[0.08] rounded-lg text-slate-300 cursor-pointer"
                >
                  <Menu size={16} />
                </button>
                <ChatBox 
                  conversationId={selectedConversation.id} 
                  currentUserProfile={profile} 
                  otherUser={selectedConversation.other_user} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
                <MessageSquare size={48} className="mb-3 opacity-30 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-300">Bir sohbet seçin</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Yazışmaya başlamak için sol listeden bir görüşme seçin veya üye profilinden mesaj gönderin.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
