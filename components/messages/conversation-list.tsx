'use client';

import React from 'react';
import { Profile } from '@/types/database';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface ConversationItem {
  id: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  other_user: Profile;
  unread_count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse p-2">
            <div className="size-10 rounded-xl bg-slate-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 bg-slate-800 rounded" />
              <div className="h-2.5 w-1/2 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 h-full">
        <MessageSquare size={36} className="mb-2 opacity-30 text-sky-400" />
        <p className="text-xs font-semibold text-slate-300">Henüz mesaj yok</p>
        <p className="text-[11px] mt-1 text-slate-500">Kullanıcı profillerini ziyaret ederek iletişime geçebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04]">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full flex items-center gap-3 p-3 transition-all hover:bg-slate-900/60 text-left relative cursor-pointer ${
            selectedId === conv.id ? 'bg-sky-500/10 border-l-2 border-l-sky-500' : 'border-l-2 border-l-transparent'
          }`}
        >
          <UserAvatar 
            src={conv.other_user?.avatar_url}
            username={conv.other_user?.username}
            name={conv.other_user?.full_name}
            size="md"
            className="rounded-xl border border-white/[0.08]"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="font-semibold text-xs text-slate-200 truncate">
                {conv.other_user?.full_name || conv.other_user?.username || 'Kullanıcı'}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: tr })}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate font-normal">
              {conv.last_message?.content || 'Mesaj yok'}
            </p>
          </div>

          {conv.unread_count > 0 && (
            <div className="size-4 bg-sky-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              {conv.unread_count}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
