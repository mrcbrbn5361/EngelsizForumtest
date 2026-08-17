'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellOff, Check, Trash2, Loader2, MessageSquare, Heart, Trophy, Info, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      let { data, error: fetchErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fallback if schema uses user_id instead of recipient_id
      if (fetchErr && (fetchErr.code === '42703' || fetchErr.message?.includes('recipient_id'))) {
        const retry = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        data = retry.data;
        fetchErr = retry.error;
      }

      if (fetchErr) {
        if (fetchErr.code === 'PGRST116' || fetchErr.code === '42P01') {
          setNotifications([]);
        } else {
          console.warn('Notifications fetch notice:', fetchErr.message);
          setError('Bildirimler yüklenirken bir sorun oluştu.');
        }
      } else {
        setNotifications(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Subscribe to real-time notifications safely
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
            toast.info(newNotif.title || 'Yeni bir bildiriminiz var!');
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read && !n.read_at).length);
  }, [notifications]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    const previous = [...notifications];
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));

    try {
      const { error: updateErr } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (updateErr && updateErr.code === '42703') {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
      setNotifications(previous);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    const previous = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));

    try {
      let { error: updateErr } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id);
      
      if (updateErr && (updateErr.code === '42703' || updateErr.message?.includes('recipient_id'))) {
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
      toast.success('Tüm bildirimler okundu olarak işaretlendi.');
    } catch (err) {
      console.error('Error marking all as read:', err);
      setNotifications(previous);
      toast.error('Bildirimler güncellenemedi.');
    }
  };

  const deleteNotification = async (id: string) => {
    const previous = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      const { error: delErr } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (delErr) throw delErr;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setNotifications(previous);
      toast.error('Bildirim silinemedi.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reply':
      case 'comment': return <MessageSquare className="text-sky-400" size={15} aria-hidden="true" />;
      case 'like': return <Heart className="text-rose-400" size={15} aria-hidden="true" />;
      case 'achievement': return <Trophy className="text-amber-400" size={15} aria-hidden="true" />;
      default: return <Info className="text-sky-400" size={15} aria-hidden="true" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-[#161f33] text-slate-300 hover:text-sky-400 transition-colors h-8.5 w-8.5 sm:h-9 sm:w-9 flex items-center justify-center shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-label={`Bildirimler${unreadCount > 0 ? `, ${unreadCount} okunmamış bildirim` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell size={18} className={cn(unreadCount > 0 && "text-sky-400", "w-4.5 h-4.5 sm:w-5 sm:h-5")} aria-hidden="true" />
        {unreadCount > 0 && (
          <span 
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-black text-slate-950 border-2 border-[#090a0f]"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
              onClick={() => setIsOpen(false)} 
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-label="Bildirimler Paneli"
              className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 mt-2 sm:mt-2 w-auto sm:w-88 bg-[#111726] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none text-slate-100 backdrop-blur-md"
            >
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                      {unreadCount} yeni
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-[#161f33] rounded-lg transition-colors text-slate-400 hover:text-sky-400 cursor-pointer"
                      title="Tümünü Okundu İşaretle"
                      aria-label="Tümünü Okundu İşaretle"
                    >
                      <Check size={16} aria-hidden="true" />
                    </button>
                  )}
                  <button 
                    onClick={fetchNotifications}
                    className="p-1.5 hover:bg-[#161f33] rounded-lg transition-colors text-slate-400 hover:text-sky-400 cursor-pointer"
                    title="Yenile"
                    aria-label="Bildirimleri Yenile"
                  >
                    <RefreshCw size={14} aria-hidden="true" className={cn(loading && "animate-spin")} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-[#161f33] rounded-lg transition-colors text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Kapat"
                    aria-label="Kapat"
                  >
                    <BellOff size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto" tabIndex={0} aria-label="Bildirim Listesi">
                {loading && notifications.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-sky-400" size={24} aria-hidden="true" />
                    <p className="text-xs text-slate-400 font-medium">Bildirimler yükleniyor...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <AlertCircle size={28} className="mx-auto text-destructive mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-300">{error}</p>
                    <button
                      onClick={fetchNotifications}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-[#161f33] hover:bg-[#1c2740] text-xs text-sky-400 font-bold border border-white/[0.08] cursor-pointer"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellOff size={32} className="mx-auto text-slate-600 mb-2" aria-hidden="true" />
                    <p className="text-xs font-semibold text-slate-400">Henüz yeni bildiriminiz yok.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {notifications.map((n) => {
                      const isUnread = !n.is_read && !n.read_at;
                      return (
                        <div 
                          key={n.id}
                          className={cn(
                            "p-3.5 hover:bg-[#161f33]/60 transition-colors flex gap-3 relative group",
                            isUnread && "bg-sky-500/[0.04]"
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            <div className="w-8 h-8 rounded-xl bg-[#0b0f19] flex items-center justify-center border border-white/[0.08]">
                              {getIcon(n.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-200 truncate">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {new Date(n.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
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
                                Görüntüle →
                              </Link>
                            ) : null}
                          </div>
                          <button 
                            onClick={() => deleteNotification(n.id)}
                            className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 text-rose-400 rounded-md cursor-pointer"
                            aria-label="Bildirimi Sil"
                            title="Bildirimi Sil"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                          {isUnread && (
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" aria-hidden="true" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2.5 bg-[#0b0f19]/80 border-t border-white/[0.08] text-center">
                  <p className="text-[10px] font-medium text-slate-500">EngelsizForum Güvenli Bildirim Sistemi</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

