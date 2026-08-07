'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Check, Trash2, Loader2, MessageSquare, Heart, Trophy, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { Notification } from '@/types/database';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // Table doesn't exist yet, ignore
          setNotifications([]);
        } else {
          throw error;
        }
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    if (user) {
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast.info('Yeni bir bildiriminiz var!');
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read_at).length);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      toast.success('Tüm bildirimler okundu olarak işaretlendi.');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reply':
      case 'comment': return <MessageSquare className="text-primary" size={16} />;
      case 'like': return <Heart className="text-red-500" size={16} />;
      case 'achievement': return <Trophy className="text-amber-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 sm:p-2 rounded-xl hover:bg-muted transition-colors group min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Bildirimler"
      >
        <Bell size={26} className={cn(unreadCount > 0 && "animate-tada", "w-6 h-6 sm:w-6 sm:h-6")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground border-2 border-background shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 mt-3 sm:mt-4 w-auto sm:w-96 bg-card border-4 border-border rounded-[2.5rem] shadow-2xl z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-black uppercase tracking-tighter text-lg">Bildirimler</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                    title="Tümünü Okundu İşaretle"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground"
                  >
                    <BellOff size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yükleniyor...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <BellOff size={48} className="mx-auto text-muted-foreground/10 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Henüz bildiriminiz yok.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        className={cn(
                          "p-5 hover:bg-muted/50 transition-colors flex gap-4 relative group",
                          !n.read_at && "bg-primary/[0.03]"
                        )}
                      >
                        <div className="shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                            {getIcon(n.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[150px]">
                              {n.title}
                            </span>
                            <span className="text-[8px] font-bold text-muted-foreground shrink-0 ml-2">
                              {new Date(n.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground/80 leading-relaxed line-clamp-2">
                            {n.body || (n as any).content}
                          </p>
                          {(n.data as any)?.link || (n as any).link ? (
                            <Link 
                              href={(n.data as any)?.link || (n as any).link}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsOpen(false);
                              }}
                              className="inline-block mt-2 text-[10px] font-black text-primary hover:underline uppercase tracking-wider"
                            >
                              Detayları Gör
                            </Link>
                          ) : null}
                        </div>
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                        {!n.read_at && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-muted/30 border-t border-border text-center">
                   <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">EngelsizForum Akıllı Bildirim Sistemi</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
