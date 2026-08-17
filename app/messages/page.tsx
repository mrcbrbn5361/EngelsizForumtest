'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatBox } from '@/components/messages/chat-box';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Loader2, Menu, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="animate-spin text-sky-400 mb-2 size-7" />
          <p className="text-xs text-slate-400">Mesajlar yükleniyor...</p>
        </div>
        <Footer />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [searchedProfiles, setSearchedProfiles] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const initiateDirectConversation = async (targetId: string, currentConvs: any[]) => {
    if (!user || targetId === user.id) {
      if (targetId === user?.id) toast.info('Kendinize mesaj gönderemezsiniz.');
      return;
    }

    try {
      // 1. Fetch target user profile
      const { data: otherProfile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (profErr || !otherProfile) {
        toast.error('Kullanıcı profili bulunamadı.');
        return;
      }

      // 2. Try to find existing conversation in DB
      const { data: myConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (myConvs && myConvs.length > 0) {
        const cIds = myConvs.map(m => m.conversation_id);
        const { data: commonMember } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', targetId)
          .in('conversation_id', cIds)
          .maybeSingle();

        if (commonMember) {
          setSelectedConvId(commonMember.conversation_id);
          setShowListOnMobile(false);
          return;
        }
      }

      // 3. Create new conversation in Supabase
      const { data: newConv, error: createErr } = await supabase
        .from('conversations')
        .insert({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (newConv) {
        await supabase.from('conversation_members').insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: targetId }
        ]);

        const newConvItem = {
          ...newConv,
          other_user: otherProfile,
          last_message: null,
          unread_count: 0
        };

        setConversations(prev => {
          const exists = prev.some(c => c.id === newConv.id);
          return exists ? prev : [newConvItem, ...prev];
        });
        setSelectedConvId(newConv.id);
        setShowListOnMobile(false);
        toast.success(`${otherProfile.full_name || otherProfile.username} ile sohbet açıldı.`);
      }
    } catch (err) {
      console.error('Error initiating direct conversation:', err);
      toast.error('Sohbet başlatılırken bir hata oluştu.');
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const { data: membersData, error: membersError } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (membersError) throw membersError;

        const convIds = membersData?.map(m => m.conversation_id) || [];
        
        let processed: any[] = [];
        if (convIds.length > 0) {
          const { data: convData } = await supabase
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

          processed = convData?.map(conv => {
            const otherMember = conv.members?.find((m: any) => m?.user?.id !== user.id);
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
        }

        setConversations(processed);

        // If targetUserId is present, open or create conversation
        if (targetUserId) {
          const existing = processed.find(c => c.other_user?.id === targetUserId);
          if (existing) {
            setSelectedConvId(existing.id);
            setShowListOnMobile(false);
          } else {
            await initiateDirectConversation(targetUserId, processed);
          }
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, targetUserId]);

  const handleSearchMembers = async (q: string) => {
    setSearchMemberQuery(q);
    if (!q.trim()) {
      setSearchedProfiles([]);
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(8);

      setSearchedProfiles(data || []);
    } catch (err) {
      console.error('Error searching members:', err);
    } finally {
      setSearchLoading(false);
    }
  };

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

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsNewChatModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />
          <div className="w-full max-w-md bg-[#111726] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden relative z-10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-sm font-bold text-slate-100">Yeni Sohbet Başlat</h2>
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Kapat
              </button>
            </div>

            <input
              type="text"
              value={searchMemberQuery}
              onChange={(e) => handleSearchMembers(e.target.value)}
              placeholder="Üye adı veya kullanıcı adı ara..."
              className="w-full bg-[#090a0f] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500"
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04] space-y-1">
              {searchLoading ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Loader2 className="size-4 animate-spin mx-auto mb-1 text-sky-400" />
                  Aranıyor...
                </div>
              ) : searchedProfiles.length > 0 ? (
                searchedProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setIsNewChatModalOpen(false);
                      initiateDirectConversation(p.id, conversations);
                    }}
                    className="w-full p-2 rounded-xl hover:bg-slate-800/80 flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      {(p.full_name || p.username || 'U')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 truncate">{p.full_name || p.username}</div>
                      <div className="text-[10px] text-sky-400 font-mono truncate">@{p.username || 'isimsiz'}</div>
                    </div>
                  </button>
                ))
              ) : searchMemberQuery ? (
                <div className="py-4 text-center text-xs text-slate-500">Üye bulunamadı.</div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">Mesajlaşmak istediğiniz üyeyi arayın.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 h-[calc(100vh-140px)] min-h-[500px] max-w-7xl flex flex-col">
        <div className="flex items-center justify-between gap-2.5 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">Özel Mesajlar</h1>
              <p className="text-xs text-slate-400">Üyeler arası bireysel dayanışma ve yazışmalar</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
          >
            Yeni Mesaj
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 bg-[#111726]/80 border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-md">
          {/* List Sidebar */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-4 lg:col-span-3 border-r border-white/[0.08] h-full overflow-hidden`}>
            <div className="p-3 border-b border-white/[0.08] bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Sohbetler</span>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                + Yeni
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList 
                conversations={conversations} 
                selectedId={selectedConvId || undefined} 
                onSelect={(id) => {
                  setSelectedConvId(id);
                  setShowListOnMobile(false);
                }} 
                onStartNewChat={() => setIsNewChatModalOpen(true)}
                loading={loading}
              />
            </div>
          </div>

          {/* Chat Content */}
          <div className={`${!showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-8 lg:col-span-9 h-full relative bg-slate-950/40`}>
            {selectedConversation ? (
              <ChatBox 
                conversationId={selectedConversation.id} 
                currentUserProfile={profile} 
                otherUser={selectedConversation.other_user} 
                onBack={() => setShowListOnMobile(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
                <MessageSquare size={48} className="mb-3 opacity-30 text-sky-400" />
                <h2 className="text-sm font-semibold text-slate-300">Bir sohbet seçin</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed mb-4">
                  Yazışmaya başlamak için sol listeden bir görüşme seçin veya yeni mesaj başlatın.
                </p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Yeni Sohbet Başlat
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
