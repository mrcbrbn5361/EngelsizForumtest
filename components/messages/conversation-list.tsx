'use client';

import React, { useState } from 'react';
import { Profile } from '@/types/database';
import { UserAvatar } from '@/components/ui/user-avatar';
import { isUserOnline } from '@/lib/presence';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConversationItem {
  id: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id?: string;
  };
  other_user: Profile;
  unread_count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
  onStartNewChat?: () => void;
}

export function ConversationList({ conversations, selectedId, onSelect, loading, onStartNewChat }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = (conv.other_user?.full_name || '').toLowerCase();
    const username = (conv.other_user?.username || '').toLowerCase();
    const lastMsg = (conv.last_message?.content || '').toLowerCase();
    return name.includes(q) || username.includes(q) || lastMsg.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-2 p-3" role="status" aria-label="Sohbetler yükleniyor">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse p-3 rounded-md bg-[#18243A] border border-[#1E293B]">
            <div className="w-10 h-10 rounded-md bg-[#111B2E] shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3 w-1/3 bg-[#111B2E] rounded" />
              <div className="h-2.5 w-2/3 bg-[#111B2E] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111B2E]">
      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-[#1E293B] bg-[#18243A] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sohbetlerde ara..."
            className="w-full bg-[#111B2E] border border-[#1E293B] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-colors font-medium"
            aria-label="Sohbetlerde arama yap"
          />
        </div>
        {onStartNewChat && (
          <button
            onClick={onStartNewChat}
            className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shrink-0 shadow-sm"
            title="Yeni Mesaj Başlat"
            aria-label="Yeni Mesaj Başlat"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 flex-1">
          <div className="w-12 h-12 rounded-md bg-[#18243A] border border-[#1E293B] flex items-center justify-center mb-3 text-indigo-400">
            <MessageSquare size={22} aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold text-slate-200">Henüz sohbetiniz yok</p>
          <p className="text-[11px] mt-1 text-slate-400 max-w-[200px] leading-relaxed mb-4">
            Üye profillerinden veya aşağıdaki butondan doğrudan mesajlaşma başlatabilirsiniz.
          </p>
          {onStartNewChat && (
            <button
              onClick={onStartNewChat}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={13} /> Yeni Sohbet Başlat
            </button>
          )}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs flex-1">
          Aramanıza uygun sohbet bulunamadı.
        </div>
      ) : (
        <div className="divide-y divide-[#1E293B] overflow-y-auto flex-1" role="listbox" aria-label="Sohbet Listesi">
          {filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const displayName = conv.other_user?.full_name || conv.other_user?.username || 'Kullanıcı';
            
            return (
              <button
                key={conv.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 transition-colors text-left relative cursor-pointer outline-none",
                  isSelected 
                    ? "bg-[#18243A] border-l-2 border-l-indigo-400 text-white" 
                    : "hover:bg-[#18243A]/60 border-l-2 border-l-transparent text-slate-300"
                )}
              >
                <div className="relative shrink-0">
                  <UserAvatar 
                    src={conv.other_user?.avatar_url}
                    username={conv.other_user?.username}
                    name={displayName}
                    size="md"
                    isOnline={isUserOnline(conv.other_user?.last_seen_at)}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-xs text-slate-100 truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                      {conv.updated_at ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: tr }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate leading-tight font-normal">
                    {conv.last_message?.content || 'Sohbet başlatıldı'}
                  </p>
                </div>

                {conv.unread_count > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-indigo-600 rounded flex items-center justify-center text-[9px] font-mono font-bold text-white shrink-0">
                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
