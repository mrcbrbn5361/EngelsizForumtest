'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Profile } from '@/types/database';
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
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">Henüz mesaj yok</p>
        <p className="text-xs mt-2">Başkalarıyla iletişime geçmek için profillerini ziyaret edebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="divide-y border-t sm:border-t-0">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-muted/50 text-left relative ${
            selectedId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
          }`}
        >
          <div className="relative">
            <img
              src={conv.other_user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${conv.other_user.username}`}
              alt={conv.other_user.full_name || 'Kullanıcı'}
              className="size-12 rounded-full border bg-muted"
              referrerPolicy="no-referrer"
            />
            {conv.other_user.is_verified && (
              <div className="absolute -bottom-1 -right-1 size-5 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[10px] text-white">
                ✓
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm truncate uppercase tracking-tight">
                {conv.other_user.full_name}
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: tr })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate font-medium">
              {conv.last_message?.content || 'Mesaj gönderilmedi'}
            </p>
          </div>

          {conv.unread_count > 0 && (
            <div className="size-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              {conv.unread_count}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
