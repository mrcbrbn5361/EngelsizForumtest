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
      let { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fallback if schema uses user_id instead of recipient_id
      if (error && (error.code === '42703' || error.message?.includes('recipient_id'))) {
        const retry = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // Table doesn't exist yet, ignore
          setNotifications([]);
        } else {
          console.warn('Notifications fetch notice:', error.message);
          setNotifications([]);
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
    
    // Subscribe to real-time notifications safely
    if (user) {
      const channel = supabase
        .channel(`public:notifications:${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications'
        }, (payload) => {
          const newNotif = payload.new as any;
          if (newNotif && (newNotif.recipient_id === user.id || newNotif.user_id === user.id)) {
            setNotifications(prev => [newNotif as Notification, ...prev]);
            toast.info('Yeni bir bildiriminiz var!');
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read && !n.read_at).length);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error && error.code === '42703') {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      }
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      let { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id);
      
      if (error && (error.code === '42703' || error.message?.includes('recipient_id'))) {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
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
        className="relative p-2 sm:p-2 rounded-lg hover:bg-[#161f33] text-slate-300 hover:text-sky-400 transition-colors group h-8.5 w-8.5 sm:h-9 sm:w-9 flex items-center justify-center shrink-0"
        aria-label="Bildirimler"
      >
        <Bell size={18} className={cn(unreadCount > 0 && "animate-tada text-sky-400", "w-4.5 h-4.5 sm:w-5 sm:h-5")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-slate-950 border border-[#090a0f]">
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
              className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 mt-3 sm:mt-2 w-auto sm:w-80 bg-[#111726] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none text-slate-100"
            >
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]/60">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Bildirimler</h3>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-[#161f33] rounded-lg transition-colors text-slate-400 hover:text-sky-400"
                    title="Tümünü Okundu İşaretle"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-[#161f33] rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                  >
                    <BellOff size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-sky-400" size={24} />
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Yükleniyor...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellOff size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-400">Henüz bildiriminiz yok.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        className={cn(
                          "p-3.5 hover:bg-[#161f33]/60 transition-colors flex gap-3 relative group",
                          !n.read_at && "bg-sky-500/[0.04]"
                        )}
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-[#0b0f19] flex items-center justify-center border border-white/[0.08]">
                            {getIcon(n.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-sky-400 truncate max-w-[150px]">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {new Date(n.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {n.body || (n as any).content}
                          </p>
                          {(n.data as any)?.link || (n as any).link ? (
                            <Link 
                              href={(n.data as any)?.link || (n as any).link}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsOpen(false);
                              }}
                              className="inline-block mt-1.5 text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                            >
                              Detayları Gör →
                            </Link>
                          ) : null}
                        </div>
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 text-rose-400 rounded-md"
                        >
                          <Trash2 size={12} />
                        </button>
                        {!n.read_at && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2.5 bg-[#0b0f19]/80 border-t border-white/[0.08] text-center">
                   <p className="text-[10px] font-medium text-slate-400">EngelsizForum Bildirim Sistemi</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
