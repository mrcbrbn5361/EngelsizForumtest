'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatBox } from '@/components/messages/chat-box';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Loader2, Menu, Sparkles, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import { createOrGetConversationAction, getUserConversationsAction } from '@/app/actions';
import { UserAvatar } from '@/components/ui/user-avatar';

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="animate-spin text-sky-400 mb-2 size-7" />
        <p className="text-xs text-slate-400">Mesajlar yükleniyor...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams?.get('userId');

  const { user, profile, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [initializedTarget, setInitializedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [searchedProfiles, setSearchedProfiles] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const initiateDirectConversation = async (targetId: string, currentConvs: any[]) => {
    if (!user || !targetId) return;

    try {
      const res = await createOrGetConversationAction(targetId);
      if (!res.success) {
        toast.error(res.error || 'Sohbet başlatılamadı.');
        return;
      }

      const conversationId = res.conversationId!;
      const otherProfile = res.otherUser;

      const newConvItem = {
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: otherProfile,
        last_message: null,
        unread_count: 0
      };

      setConversations(prev => {
        const exists = prev.some(c => c.id === conversationId);
        const updated = exists ? prev : [newConvItem, ...prev];
        return updated;
      });
      setSelectedConvId(conversationId);
      setShowListOnMobile(false);
      if (res.isNew) {
        toast.success(`${otherProfile?.full_name || otherProfile?.username} ile sohbet açıldı.`);
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
        if (conversations.length === 0) {
          setLoading(true);
        }

        let processed: any[] = [];

        // 1. Try server action first
        const res = await getUserConversationsAction();
        if (res.success && Array.isArray(res.conversations)) {
          processed = res.conversations;
        } else {
          // 2. Fallback to client query
          const { data: membersData } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('user_id', user.id);

          const convIds = membersData?.map(m => m.conversation_id) || [];
          
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
        }

        if (processed.length > 0 || conversations.length === 0) {
          setConversations(processed);
        }

        // If targetUserId is present in URL params and not yet initialized for this target
        if (targetUserId && initializedTarget !== targetUserId) {
          const existing = (processed.length > 0 ? processed : conversations).find(c => 
            c.other_user?.id === targetUserId || 
            c.other_user?.username?.toLowerCase() === targetUserId.toLowerCase()
          );
          if (existing) {
            setSelectedConvId(existing.id);
            setShowListOnMobile(false);
            setInitializedTarget(targetUserId);
          } else {
            await initiateDirectConversation(targetUserId, processed);
            setInitializedTarget(targetUserId);
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

  const activeProfile = profile || (user ? {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'kullanici',
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: 'user' as const,
    level: 1,
    xp: 0,
    bio: null,
    is_verified: false,
    accessibility_prefs: null,
    updated_at: new Date().toISOString()
  } : null);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="animate-spin text-sky-400 mb-2 size-7" />
        <p className="text-xs text-slate-400">Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  if (!user || !activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4 mx-auto shadow-xs">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-xl font-black text-slate-950 dark:text-white mb-2">Özel Mesajlar (DM)</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
          Üyelerle doğrudan mesajlaşabilmek ve gelen mesajlarınızı görebilmek için lütfen giriş yapın.
        </p>
        <Link
          href="/login?redirect=/messages"
          className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-md"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-160px)] min-h-[460px] max-w-7xl mx-auto">
      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsNewChatModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden relative z-10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">Yeni Sohbet Başlat</h2>
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer font-bold"
              >
                Kapat
              </button>
            </div>

            <input
              type="text"
              value={searchMemberQuery}
              onChange={(e) => handleSearchMembers(e.target.value)}
              placeholder="Üye adı veya kullanıcı adı ara..."
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-600"
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
              {searchLoading ? (
                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                  <Loader2 className="size-4 animate-spin mx-auto mb-1 text-sky-600" />
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
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                      {(p.full_name || p.username || 'U')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.full_name || p.username}</div>
                      <div className="text-[10px] text-sky-700 dark:text-sky-400 font-mono font-bold truncate">@{p.username || 'isimsiz'}</div>
                    </div>
                  </button>
                ))
              ) : searchMemberQuery ? (
                <div className="py-4 text-center text-xs text-slate-500 font-medium">Üye bulunamadı.</div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500 font-medium">Mesajlaşmak istediğiniz üyeyi arayın.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 py-2">
        <div className="flex items-center justify-between gap-2.5 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-xs">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-950 dark:text-white tracking-tight">Özel Mesajlar (DM)</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Üyeler arası doğrudan ve güvenli mesajlaşma</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            <span>Yeni Mesaj</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {/* List Sidebar */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-4 lg:col-span-3 border-r-2 border-slate-200 dark:border-slate-800 h-full overflow-hidden`}>
            <div className="p-3 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Sohbetler</span>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline font-black cursor-pointer"
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
          <div className={`${!showListOnMobile ? 'flex' : 'hidden'} md:flex flex-col md:col-span-8 lg:col-span-9 h-full relative bg-slate-50 dark:bg-slate-950`}>
            {selectedConversation ? (
              <ChatBox 
                conversationId={selectedConversation.id} 
                currentUserProfile={activeProfile} 
                otherUser={selectedConversation.other_user} 
                onBack={() => setShowListOnMobile(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
                <MessageSquare size={48} className="mb-3 opacity-30 text-sky-600" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Bir sohbet seçin</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed mb-4 font-medium">
                  Yazışmaya başlamak için sol listeden bir görüşme seçin veya yeni mesaj başlatın.
                </p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Yeni Sohbet Başlat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
