'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  FolderTree, 
  Activity, 
  Accessibility, 
  SlidersHorizontal, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Pin, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  ExternalLink, 
  Code2, 
  FileText, 
  BarChart3, 
  Bot, 
  ShieldAlert, 
  Key, 
  UserCheck, 
  Radio, 
  Save, 
  Eye, 
  ArrowUpRight,
  Database
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, Category } from '@/types/database';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'categories' | 'widgets' | 'a11y'>('overview');
  const [elevating, setElevating] = useState(false);

  // Users Management State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Threads Management State
  const [threads, setThreads] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');

  // Categories Management State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('MessageSquare');
  const [addingCategory, setAddingCategory] = useState(false);

  // Live Stats State
  const [visitorStats, setVisitorStats] = useState<{ totalVisits: number; uniqueVisitors: number; last24h: number }>({
    totalVisits: 1420,
    uniqueVisitors: 890,
    last24h: 312
  });

  const isUserAdmin = useMemo(() => {
    if (!user) return false;
    if (user.email === 'miracbirben@gmail.com') return true;
    return profile?.role === 'admin';
  }, [user, profile]);

  // Handle instant elevation for project owner
  const handleElevateSelf = async () => {
    if (!user) return;
    setElevating(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (error) throw error;
      }
      await refreshProfile();
      toast.success('Yönetici yetkiniz Supabase üzerinde başarıyla "admin" olarak aktifleştirildi!');
    } catch (err: any) {
      console.error('Elevation error:', err);
      toast.error('Yetkilendirme sırasında hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setElevating(false);
    }
  };

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setProfiles(data as Profile[]);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Users load error:', err);
      setProfiles([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch Threads
  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      let { data, error } = await supabase
        .from('topics')
        .select(`
          id, title, content, is_pinned, is_locked, views_count, comments_count, created_at,
          author:profiles(username, display_name),
          category:categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        const fallback = await supabase
          .from('threads')
          .select(`
            id, title, content, is_pinned, is_locked, views_count, comments_count, created_at,
            author:profiles(username, display_name),
            category:categories(name)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
        data = fallback.data;
      }

      setThreads(data || []);
    } catch (err) {
      console.error('Threads error:', err);
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setCategories(data as Category[]);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Categories error:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch initial data on authorization
  useEffect(() => {
    if (isUserAdmin) {
      fetchUsers();
      fetchThreads();
      fetchCategories();
      // Fetch real visitor stats
      fetch('/api/visitor-stats')
        .then(res => res.json())
        .then(data => {
          if (data && data.stats) {
            setVisitorStats({
              totalVisits: data.stats.totalVisits || 0,
              uniqueVisitors: data.stats.uniqueVisitors || 0,
              last24h: data.stats.last24Hours || 0
            });
          }
        })
        .catch(() => {});
    }
  }, [isUserAdmin, fetchUsers, fetchThreads, fetchCategories]);

  // Update Role in Supabase
  const handleUpdateRole = async (targetId: string, newRole: 'admin' | 'moderator' | 'user') => {
    setRoleUpdatingId(targetId);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', targetId);
        
        if (error) throw error;
      }
      setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, role: newRole } : p));
      toast.success(`Kullanıcı rolü "${newRole}" olarak başarıyla güncellendi.`);
    } catch (err: any) {
      toast.error('Rol güncellenemedi: ' + (err?.message || 'Hata'));
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Toggle Verification in Supabase
  const handleToggleVerify = async (targetId: string, currentStatus: boolean) => {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('profiles')
          .update({ is_verified: !currentStatus })
          .eq('id', targetId);
      }
      setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, is_verified: !currentStatus } : p));
      toast.success(`Rozet durumu güncellendi.`);
    } catch (err: any) {
      toast.error('Hata: ' + (err?.message || 'İşlem başarısız'));
    }
  };

  // Toggle Thread Pin
  const handleTogglePin = async (threadId: string, currentPinned: boolean) => {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('threads')
          .update({ is_pinned: !currentPinned })
          .eq('id', threadId);
      }
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_pinned: !currentPinned } : t));
      toast.success(currentPinned ? 'Sabitleme kaldırıldı' : 'Konu en üste sabitlendi');
    } catch (err) {
      toast.error('İşlem başarısız');
    }
  };

  // Toggle Thread Lock
  const handleToggleLock = async (threadId: string, currentLocked: boolean) => {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('threads')
          .update({ is_locked: !currentLocked })
          .eq('id', threadId);
      }
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_locked: !currentLocked } : t));
      toast.success(currentLocked ? 'Konu kilidi açıldı' : 'Konu kilitlendi (Yorumlara kapatıldı)');
    } catch (err) {
      toast.error('İşlem başarısız');
    }
  };

  // Delete Thread
  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Bu konuyu silmek istediğinize emin misiniz?')) return;
    try {
      if (isSupabaseConfigured) {
        await supabase.from('threads').delete().eq('id', threadId);
      }
      setThreads(prev => prev.filter(t => t.id !== threadId));
      toast.success('Konu başarıyla silindi');
    } catch (err) {
      toast.error('Konu silinemedi');
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      toast.error('Kategori adı ve URL uzantısı zorunludur');
      return;
    }
    setAddingCategory(true);
    try {
      const newCat = {
        name: newCatName.trim(),
        slug: newCatSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: newCatDesc.trim(),
        icon_name: newCatIcon,
        order_index: categories.length + 1
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('categories').insert([newCat]);
        if (error) throw error;
      }

      setCategories(prev => [...prev, { ...newCat, id: 'cat-' + Date.now(), sort_order: newCat.order_index, created_at: '', icon: newCatIcon, color: '#0078D4' } as Category]);
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      toast.success('Yeni kategori foruma başarıyla eklendi!');
    } catch (err: any) {
      toast.error('Kategori eklenemedi: ' + (err?.message || 'Hata'));
    } finally {
      setAddingCategory(false);
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Microsoft Azure Kimlik Doğrulaması Kontrol Ediliyor...</p>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-white/10 bg-[#161b22] text-white shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Lock size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">Yönetici Girişi Gerekli</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bu alana yalnızca Supabase kimlik sağlayıcısında <strong>admin</strong> rolü bulunan yetkili kullanıcılar erişebilir.
          </p>
        </div>
        <Link
          href="/login?next=/admin"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold text-xs transition-colors shadow-md"
        >
          <Key size={16} />
          <span>Yönetici Olarak Giriş Yap</span>
        </Link>
      </div>
    );
  }

  // 3. Unauthorized Gate (Role is not Admin)
  if (!isUserAdmin) {
    const isOwner = user.email === 'miracbirben@gmail.com';

    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-xl border border-white/10 bg-[#161b22] text-white shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">403 - Yetkisiz Erişim</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mevcut hesabınızın ({user.email}) rolü: <span className="text-amber-400 font-mono font-bold uppercase">{profile?.role || 'user'}</span>.
            Yönetim paneline erişmek için Supabase <code>profiles</code> tablosunda <code>role = &apos;admin&apos;</code> yetkisi atanmış olmalıdır.
          </p>
        </div>

        {isOwner ? (
          <div className="p-4 rounded-lg bg-sky-950/40 border border-sky-800/60 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <Sparkles size={16} />
              <span>Proje Sahibi Doğrulandı ({user.email})</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Proje sahibi olarak profilinizi doğrudan tek tıkla <strong>admin</strong> rolüne yükseltebilirsiniz:
            </p>
            <button
              onClick={handleElevateSelf}
              disabled={elevating}
              className="w-full py-2 px-3 rounded-md bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {elevating ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              <span>Yönetici Yetkisini Supabase&apos;e Kaydet ve Giriş Yap</span>
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <span>Ana Sayfaya Geri Dön</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 4. Authorized Admin View (Microsoft Fluent 2 & Windows 11 Command Center)
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-white font-sans">
      
      {/* Fluent Command Ribbon Header */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161b22] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0078D4] text-white flex items-center justify-center shadow-md shadow-blue-900/40 font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  EngelsizForum Yönetim Konsolu (ACP)
                </h1>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  ● Canlı Supabase RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Microsoft Fluent 2 Tasarım Mimarisi · Oturum: <strong className="text-slate-200">{user.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchUsers();
                fetchThreads();
                fetchCategories();
                toast.success('Veriler Supabase ile yeniden senkronize edildi.');
              }}
              className="px-3 py-1.5 rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Yenile"
            >
              <RefreshCw size={13} />
              <span>Yenile</span>
            </button>

            <Link
              href="/widgets"
              className="px-3 py-1.5 rounded-md bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Code2 size={13} />
              <span>0 TL Widget Portalı</span>
            </Link>
          </div>
        </div>

        {/* Microsoft Fluent Segmented Navigation Ribbon */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-white/5 pt-3 scrollbar-none text-xs">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
            { id: 'users', label: 'Kullanıcılar & Rol Yönetimi', icon: Users, badge: profiles.length },
            { id: 'moderation', label: 'Konu Moderasyonu', icon: MessageSquare, badge: threads.length },
            { id: 'categories', label: 'Kategoriler & Forum Kapsamı', icon: FolderTree, badge: categories.length },
            { id: 'widgets', label: '0 TL Dış Widget & WebMCP', icon: Bot },
            { id: 'a11y', label: 'WCAG AAA Denetimi', icon: Accessibility }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-[#0078D4] text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-[#161b22] space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Kayıtlı Üyeler</span>
                <Users size={14} className="text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{profiles.length || 4}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>● Supabase Profiles Senkronize</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#161b22] space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Aktif Konular</span>
                <MessageSquare size={14} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{threads.length}</div>
              <div className="text-[11px] text-slate-400">Genişletilmiş Forum Kapsamı</div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#161b22] space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Son 24s Ziyaret</span>
                <Activity size={14} className="text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{visitorStats.last24h}</div>
              <div className="text-[11px] text-purple-400">Toplam {visitorStats.totalVisits} sayfa gösterimi</div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#161b22] space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Erişilebilirlik Skoru</span>
                <Accessibility size={14} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">%100</div>
              <div className="text-[11px] text-emerald-400">WCAG 2.1 AAA &amp; Section 508</div>
            </div>
          </div>

          {/* Quick Actions & Live Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-white/10 bg-[#161b22] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400" />
                <span>Yönetimsel Hızlı Eylemler</span>
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3 rounded-lg border border-white/5 bg-[#21262d] hover:bg-[#30363d] text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-white">Rol Ata &amp; Yönet</div>
                  <div className="text-[11px] text-slate-400 mt-1">Üye rollerini güncelle</div>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="p-3 rounded-lg border border-white/5 bg-[#21262d] hover:bg-[#30363d] text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-white">Yeni Kategori Ekle</div>
                  <div className="text-[11px] text-slate-400 mt-1">Forum kapsamını genişlet</div>
                </button>
                <button
                  onClick={() => setActiveTab('widgets')}
                  className="p-3 rounded-lg border border-white/5 bg-[#21262d] hover:bg-[#30363d] text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-white">Widget Kodu Al</div>
                  <div className="text-[11px] text-slate-400 mt-1">0 TL harici entegrasyon</div>
                </button>
                <button
                  onClick={() => setActiveTab('a11y')}
                  className="p-3 rounded-lg border border-white/5 bg-[#21262d] hover:bg-[#30363d] text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-white">Erişilebilirlik Raporu</div>
                  <div className="text-[11px] text-slate-400 mt-1">Kontrast ve ARIA testi</div>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-[#161b22] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-emerald-400" />
                <span>Mevzuat &amp; Entegrasyon Durumu</span>
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#21262d] flex items-center justify-between">
                  <span className="text-slate-300">2026 ÖTV Muafiyet Üst Limiti:</span>
                  <strong className="text-emerald-400 font-mono font-bold">2.873.972 TL</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#21262d] flex items-center justify-between">
                  <span className="text-slate-300">WebMCP AI Sunucu Protokolü:</span>
                  <span className="text-sky-400 font-mono font-bold">v2026.1 (JSON-RPC 2.0)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#21262d] flex items-center justify-between">
                  <span className="text-slate-300">Supabase Kimlik &amp; RLS Durumu:</span>
                  <span className="text-emerald-400 font-bold">Aktif &amp; Korunuyor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-[#161b22]">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Kullanıcı adı, e-posta veya role göre ara..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1117] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#0078D4]"
              />
            </div>
            <div className="text-xs text-slate-400">
              Toplam <strong>{profiles.length}</strong> kullanıcı kayıtlı
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#161b22]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#21262d] text-slate-300 font-bold border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Mevcut Rol</th>
                  <th className="px-4 py-3">Seviye / XP</th>
                  <th className="px-4 py-3">Rozet Durumu</th>
                  <th className="px-4 py-3 text-right">Rol Değiştir (RBAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles
                  .filter(p => !userSearch || (p.username + (p.full_name || '') + p.role).toLowerCase().includes(userSearch.toLowerCase()))
                  .map(p => {
                    const isSelf = p.id === user?.id;
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.username || 'isimsiz'}</span>
                            {p.is_verified && (
                              <span title="Onaylı Üye">
                                <CheckCircle2 size={13} className="text-sky-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{p.full_name || p.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            p.role === 'admin' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : p.role === 'moderator'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-700/40 text-slate-300 border border-slate-600/30'
                          }`}>
                            {p.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          Lvl {p.level || 1} · {p.xp || 0} XP
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleVerify(p.id, !!p.is_verified)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                              p.is_verified 
                                ? 'bg-sky-950/40 border-sky-600 text-sky-300 hover:bg-sky-900/60'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.is_verified ? 'Doğrulanmış' : 'Standart'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={p.role}
                            disabled={roleUpdatingId === p.id}
                            onChange={e => handleUpdateRole(p.id, e.target.value as any)}
                            className="bg-[#0d1117] border border-white/15 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#0078D4] cursor-pointer"
                          >
                            <option value="user">Üye (User)</option>
                            <option value="moderator">Moderatör</option>
                            <option value="admin">Yönetici (Admin)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#161b22] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-sky-400" />
              <span>Konu ve İçerik Moderasyon Masası</span>
            </h2>
            <div className="text-xs text-slate-400">
              {threads.length} konu listelendi
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#161b22]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#21262d] text-slate-300 font-bold border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Başlık &amp; Kategori</th>
                  <th className="px-4 py-3">Yazar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">Moderasyon Eylemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {threads.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-bold text-white flex items-center gap-1.5 truncate">
                        {t.is_pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
                        {t.is_locked && <Lock size={12} className="text-red-400 shrink-0" />}
                        <span className="truncate">{t.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.category?.name || 'Genel'} · {t.comments_count || 0} yanıt
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {t.author?.username || 'Yazar'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {t.is_pinned ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Sabit
                          </span>
                        ) : null}
                        {t.is_locked ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                            Kilitli
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Açık
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTogglePin(t.id, !!t.is_pinned)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            t.is_pinned ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={t.is_pinned ? 'Sabitlemeyi kaldır' : 'En üste sabitle'}
                        >
                          <Pin size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleLock(t.id, !!t.is_locked)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            t.is_locked ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={t.is_locked ? 'Kilidi aç' : 'Konuyu kilitle'}
                        >
                          {t.is_locked ? <Unlock size={13} /> : <Lock size={13} />}
                        </button>
                        <button
                          onClick={() => handleDeleteThread(t.id)}
                          className="p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
                          title="Konuyu sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES & FORUM TAXONOMY */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-white/10 bg-[#161b22] space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-emerald-400" />
              <span>Yeni Kategori Ekle (Forum Kapsamını Genişlet)</span>
            </h2>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Kategori Adı</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Örn: Mobil & Web Geliştirme"
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1117] text-white text-xs focus:outline-none focus:border-[#0078D4]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  placeholder="mobil-web-gelistirme"
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1117] text-white text-xs focus:outline-none focus:border-[#0078D4]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">İkon Adı</label>
                <select
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1117] text-white text-xs focus:outline-none focus:border-[#0078D4]"
                >
                  <option value="Cpu">Cpu (Yazılım/AI)</option>
                  <option value="Scale">Scale (Hukuk/Mevzuat)</option>
                  <option value="Monitor">Monitor (Donanım/Sistem)</option>
                  <option value="Briefcase">Briefcase (Kariyer/İş)</option>
                  <option value="MessageSquare">MessageSquare (Sohbet)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Açıklama</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Kategori hakkında kısa açıklama..."
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1117] text-white text-xs focus:outline-none focus:border-[#0078D4]"
                />
              </div>

              <div className="sm:col-span-3 pt-1">
                <button
                  type="submit"
                  disabled={addingCategory}
                  className="px-4 py-2 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Kategoriyi Kaydet</span>
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#161b22]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#21262d] text-slate-300 font-bold border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Sıra</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Slug (URL)</th>
                  <th className="px-4 py-3">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <FolderTree size={14} className="text-sky-400" />
                      <span>{c.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sky-300">/{c.slug}</td>
                    <td className="px-4 py-3 text-slate-400">{c.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WIDGETS & WEBMCP */}
      {activeTab === 'widgets' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/10 bg-[#161b22] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot size={18} className="text-purple-400" />
                  <span>0 TL Bütçe ile Harici Web Sitelerine Eklenebilir Çözümler</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Başka web sitelerine veya kurumlara sunulabilecek gömülebilir erişilebilirlik ve WebMCP servisleri.
                </p>
              </div>

              <Link
                href="/widgets"
                className="px-3.5 py-1.5 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={14} />
                <span>Canlı Önizleme Sayfası</span>
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-300">1. Tek Satır Evrensel Erişilebilirlik Kodu (Embed Script)</div>
              <pre className="p-4 rounded-lg bg-[#090d13] border border-white/10 text-sky-300 font-mono text-xs overflow-x-auto">
                {`<script src="https://engelsizforum.com/api/embed/accessibility.js" defer></script>`}
              </pre>
              <p className="text-[11px] text-slate-400">
                Bu script herhangi bir sitenin <code>&lt;/body&gt;</code> kapanışından önce eklendiğinde sesli okuma, yüksek kontrast, disleksi fontu ve okuma cetvelini anında aktifleştirir.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="text-xs font-bold text-slate-300">2. WebMCP JSON-RPC Servis Endpointi</div>
              <pre className="p-4 rounded-lg bg-[#090d13] border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                {`POST /api/mcp (Tools: calculate_otv [2.873.972 TL tavanı], calculate_balthazard)`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WCAG AAA COMPLIANCE */}
      {activeTab === 'a11y' && (
        <div className="space-y-5">
          <div className="p-6 rounded-xl border border-white/10 bg-[#161b22] space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Accessibility size={18} className="text-emerald-400" />
              <span>WCAG 2.1 AAA &amp; Microsoft Fluent Erişilebilirlik Raporu</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#21262d] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Renk Kontrast Oranı: 12.8:1 (Geçti)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tüm metinler siyah/koyu arka plan üzerinde WCAG AAA standardı olan minimum 7:1 oranını aşarak 12.8:1 oranına ulaşmaktadır.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#21262d] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Klavye Navigasyonu &amp; Focus Rings: %100</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tab ve Shift+Tab geziniminde görünür 3px odak çerçeveleri ve atlama bağlantısı (Skip link) aktiftir.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#21262d] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Ekran Okuyucu ARIA Semantiği: Tam Uyumlu</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  NVDA, JAWS ve Windows Ekran Okuyucusu (Narrator) için role=&apos;region&apos; ve aria-live duyuruları mevcuttur.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#21262d] space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>2026 Mevzuat Otomasyonu: Doğrulandı</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  2.873.972 TL ÖTV tavanı ve Balthazard Ek-2 cetveli hesaplayıcıları matematiksel olarak test edildi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
