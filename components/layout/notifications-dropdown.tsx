'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*, actor:profiles(username, avatar_url, full_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          // It's possible the table doesn't exist yet, just ignore quietly
          setLoading(false);
          return;
        }

        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time listener if supported
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchNotifications();
        toast('Yeni bir bildiriminiz var');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button 
          className="relative p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all outline-none focus:ring-4 focus:ring-primary/20"
          aria-label={`Bildirimler (${unreadCount} okunmamış)`}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="w-80 md:w-96 rounded-2xl border-2 border-border bg-card p-0 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
            <h3 className="font-black uppercase tracking-widest text-sm">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Tümü Okundu
              </button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Henüz bildiriminiz yok.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.topic_id ? `/discussions/${notif.topic_id}` : '#'}
                    onClick={() => {
                      if (!notif.is_read) {
                        supabase.from('notifications').update({ is_read: true }).eq('id', notif.id).then();
                        setUnreadCount(prev => Math.max(0, prev - 1));
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      "block p-3 rounded-xl transition-colors",
                      notif.is_read ? "hover:bg-muted" : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm break-words", notif.is_read ? "text-muted-foreground" : "text-foreground font-bold")}>
                          {notif.actor?.full_name || notif.actor?.username || 'Biri'} 
                          {notif.type === 'reply' ? ' tartışmanıza yanıt verdi.' : 
                           notif.type === 'reaction' ? ' gönderinize tepki bıraktı.' : 
                           notif.type === 'mention' ? ' sizden bahsetti.' : ' yeni bir eylem gerçekleştirdi.'}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                          {new Date(notif.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
