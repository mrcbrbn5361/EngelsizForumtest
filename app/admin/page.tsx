'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  FolderTree, 
  MessageSquare, 
  Search, 
  Plus, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Bot,
  Terminal,
  Globe,
  Cpu,
  Copy,
  Check,
  Code,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { Skeleton } from '@/components/ui/skeleton';
import { generateUUID } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getVisitorStatsAction } from '@/app/actions';
import { ClientDate } from '@/components/ui/client-date';

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const { isStaff, isAdmin } = useRole();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // State for data
  const [stats, setStats] = useState({ users: 0, topics: 0, comments: 0, categories: 0, total_visitors: 0, active_visitors: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (!loading && !isStaff) {
      router.push('/');
    }
  }, [isStaff, loading, router]);

  const fetchStats = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [u, thr, top, pst, cmt, cat] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('threads').select('id', { count: 'exact', head: true }),
        supabase.from('topics').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
      ]);
      
      let visitors = { total_visitors: 0, active_visitors: 0 };
      try {
        const vRes = await getVisitorStatsAction();
        if (vRes.success) {
          visitors = { total_visitors: vRes.total_visitors, active_visitors: vRes.active_visitors };
        }
      } catch (e) {
        console.error('Visitor stats error (non-blocking):', e);
      }

      setStats({
        users: u.count || 0,
        topics: (thr.count !== null && thr.count !== undefined ? thr.count : top.count) || 0,
        comments: (pst.count !== null && pst.count !== undefined ? pst.count : cmt.count) || 0,
        categories: cat.count || 0,
        total_visitors: visitors.total_visitors || 0,
        active_visitors: visitors.active_visitors || 0,
      });
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    if (error) toast.error('Kategoriler yüklenemedi');
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('username', { ascending: true }).limit(50);
    if (data) setUsersList(data);
    if (error) {
      console.error('Users error:', error);
      toast.error('Kullanıcılar yüklenemedi: ' + error.message);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsDataLoading(true);
    await Promise.all([fetchStats(), fetchCategories(), fetchUsers()]);
    setIsDataLoading(false);
  }, [fetchStats, fetchCategories, fetchUsers]);

  useEffect(() => {
    if (isStaff) {
      fetchAllData();
    }
  }, [isStaff, fetchAllData]);

  if (loading || !isStaff) {
    return (
      <div className="flex min-h-screen bg-background p-6 sm:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header - XenForo ACP Block style */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-[#eef2f7] p-5 rounded-sm shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#185886] text-white shrink-0 shadow-xs">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#185886] uppercase tracking-wide">Yönetim ve Moderasyon Paneli</h1>
                <span className="px-2 py-0.5 rounded-sm bg-[#185886] text-white text-[10px] font-black uppercase tracking-wider">
                  {profile?.role === 'admin' ? 'YETKİLİ' : 'MODERATÖR'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Hoş geldiniz, <span className="text-slate-950 font-bold">{profile?.username}</span> • Sistem ve topluluk yönetimi
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#f2930d] hover:bg-[#d68007] border border-[#b26904] px-4 py-2 text-xs font-black text-slate-950 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Foruma Dön
          </button>
        </header>

        {/* Tabs Navigation - XenForo Sub-nav Bar Style */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs.List className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-sm w-max sm:w-fit">
              <TabButton value="overview" icon={<TrendingUp size={14} />} label="Genel Bakış" />
              {isAdmin && <TabButton value="mcp" icon={<Bot size={14} />} label="WebMCP & Yapay Zeka" />}
              {isAdmin && <TabButton value="analiz" icon={<Radio size={14} />} label="Trafik ve IoT" />}
              <TabButton value="categories" icon={<FolderTree size={14} />} label="Kategoriler" />
              {isAdmin && <TabButton value="users" icon={<Users size={14} />} label="Üyeler" />}
              <TabButton value="moderation" icon={<MessageSquare size={14} />} label="Moderasyon" />
            </Tabs.List>
          </div>

          {/* Tab 1: Overview */}
          <Tabs.Content value="overview" className="outline-none space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Toplam Üye" value={stats.users} icon={<Users size={18} />} />
              <StatCard label="Toplam Konu" value={stats.topics} icon={<MessageSquare size={18} />} />
              <StatCard label="Yanıt ve Yorum" value={stats.comments} icon={<Sparkles size={18} />} />
              <StatCard label="Aktif Ziyaretçi" value={stats.active_visitors} icon={<Radio size={18} />} live />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Son Kayıt Olan Üyeler Block */}
              <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#185886] uppercase tracking-wider">Son Kayıt Olan Üyeler</h3>
                    <p className="text-[10px] text-slate-500 font-normal">Platforma katılan en yeni 5 üye</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => setActiveTab('users')} className="text-xs font-extrabold text-[#185886] hover:underline cursor-pointer">Tümünü İncele</button>
                  )}
                </div>
                <div className="p-4 space-y-2.5">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-sm bg-[#185886]/10 border border-[#185886]/20 flex items-center justify-center font-bold text-[#185886] text-xs">
                          {(u.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#185886]">@{u.username || 'isimsiz'}</p>
                          <p className="text-[10px] text-slate-500">{u.full_name || 'Üye'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                        u.role === 'moderator' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sol/Sağ split block for staff */}
              {!isAdmin ? (
                <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="bg-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center gap-2">
                      <Shield size={14} className="text-[#185886]" />
                      <h3 className="text-xs font-black text-[#185886] uppercase tracking-wider">Moderatör Denetim Masası</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        EngelsizForum topluluk kalitesini korumak için, kurallara uymayan paylaşımları moderasyon sekmesinden kilitleyebilir veya silebilirsiniz. Hak ihlali bildirimlerini gözden geçirin.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-sm bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yetki Seviyesi</span>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">Forum Moderatörü</p>
                        </div>
                        <div className="p-3 rounded-sm bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Görev</span>
                          <p className="text-xs font-semibold text-emerald-600 mt-0.5">Topluluk Düzeni</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                      onClick={() => setActiveTab('moderation')}
                      className="w-full py-2.5 px-4 rounded-sm bg-[#f2930d] hover:bg-[#d68007] text-slate-950 text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#b26904] shadow-xs"
                    >
                      <MessageSquare size={15} /> Moderasyon Konsolunu Aç
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="bg-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-[#185886]" />
                      <h3 className="text-xs font-black text-[#185886] uppercase tracking-wider">Yapay Zeka Ajan Entegrasyonları</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        EngelsizForum, 26 adet canlı MCP aracıyla Claude, Cursor, ChatGPT, Gemini ve özel donanım istemcilerine erişilebilirlik ve mevzuat verisi sağlar.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-sm bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protokol</span>
                          <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">MCP 2024-11-05</p>
                        </div>
                        <div className="p-3 rounded-sm bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durum</span>
                          <p className="text-xs font-mono font-semibold text-emerald-600 mt-0.5">200 OK / Aktif</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                      onClick={() => setActiveTab('mcp')}
                      className="w-full py-2.5 px-4 rounded-sm bg-[#185886] hover:bg-[#104f75] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#0f3b5c] shadow-xs"
                    >
                      <Bot size={15} /> WebMCP Konsolunu Aç
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Tabs.Content>
 
          {/* Tab 2: WebMCP & AI Ajanlar */}
          <Tabs.Content value="mcp" className="outline-none">
            <McpAdminManager />
          </Tabs.Content>

          {/* Tab 3: Trafik & IoT */}
          <Tabs.Content value="analiz" className="outline-none space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Toplam Ziyaretçi" value={stats.total_visitors} icon={<Users size={18} />} />
              <StatCard label="Anlık Aktif Ziyaretçi" value={stats.active_visitors} icon={<Radio size={18} />} live />
              <StatCard label="Kayıtlı Üyeler" value={stats.users} icon={<Users size={18} />} />
              <StatCard label="Açılan Konular" value={stats.topics} icon={<MessageSquare size={18} />} />
            </div>

            <div className="rounded-2xl border border-border/80 p-6 bg-card/85 backdrop-blur-md shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Raspberry Pi ve Donanım İstemci Kodu</h3>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Bu Python betiğini Raspberry Pi veya IoT cihazınızda çalıştırarak anlık ziyaretçi sayısını forum API&apos;sine iletebilirsiniz.
                </p>
              </div>
              <pre className="bg-background text-foreground p-4 rounded-xl border border-border/60 font-mono text-xs overflow-x-auto leading-relaxed">
{`import requests, time, uuid

API_URL = "https://www.engelsizforum.com/api/visitor-stats" 
TOKEN = "engelsizforumteknofesttanitim"
DEVICE_ID = ':'.join(['{:02x}'.format((uuid.getnode() >> el) & 0xff) for el in range(0, 12, 2)][::-1])

def veriyi_cek():
    try:
        # Cihazı aktif olarak kaydet (POST)
        requests.post(API_URL, json={"device_id": DEVICE_ID}, headers={"Authorization": f"Bearer {TOKEN}"}, timeout=10)
        # Güncel veriyi al (GET)
        res = requests.get(API_URL, headers={"Authorization": f"Bearer {TOKEN}"}, timeout=15)
        if res.status_code == 200:
            d = res.json()
            print(f"Toplam: {d.get('total_visitors', 0)}, Anlik: {d.get('active_visitors', 0)}")
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    while True:
        veriyi_cek()
        time.sleep(300)`}
              </pre>
            </div>
          </Tabs.Content>

          {/* Tab 4: Categories */}
          <Tabs.Content value="categories" className="outline-none">
            <CategoryManager categories={categories} onRefresh={fetchAllData} />
          </Tabs.Content>

          {/* Tab 5: Users */}
          <Tabs.Content value="users" className="outline-none">
             <UserManager users={usersList} onRefresh={fetchAllData} isAdmin={isAdmin} />
          </Tabs.Content>

          {/* Tab 6: Moderation */}
          <Tabs.Content value="moderation" className="outline-none">
            <ModerationManager onTopicChange={fetchAllData} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </DashboardLayout>
  );
}

function TabButton({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
  return (
    <Tabs.Trigger 
      value={value}
      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-sm text-slate-600 hover:text-[#185886] hover:bg-[#eef2f7] transition-all data-[state=active]:bg-[#185886] data-[state=active]:text-white outline-none whitespace-nowrap shrink-0 cursor-pointer border border-transparent data-[state=active]:border-[#104f75]"
    >
      <span className="shrink-0 text-current">{icon}</span>
      <span>{label}</span>
    </Tabs.Trigger>
  );
}

function StatCard({ label, value, icon, live }: { label: string, value: number, icon: React.ReactNode, live?: boolean }) {
  return (
    <div className="p-4 sm:p-5 rounded-sm border border-slate-200 bg-white shadow-xs hover:border-[#185886]/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#185886] uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          {live && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          <div className="p-1 text-[#185886]">{icon}</div>
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}

function CategoryManager({ categories, onRefresh }: { categories: any[], onRefresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'MessageSquare', parent_id: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.name.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const insertData: any = {
      id: generateUUID(),
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      slug
    };

    if (formData.parent_id) {
      insertData.parent_id = formData.parent_id;
    }
    
    const { error } = await supabase.from('categories').insert([insertData]);
    
    if (error) {
      toast.error('Hata: ' + error.message);
    } else {
      toast.success('Kategori eklendi');
      setIsAdding(false);
      setFormData({ name: '', description: '', icon: 'MessageSquare', parent_id: '' });
      onRefresh();
    }
  };

  const handleSeedDefaultCategories = async () => {
    if (!confirm('Varsayılan detaylı engelli forum hiyerarşisini (Mevzuat, Sağlık, Erişilebilirlik, Sosyal Yaşam ve alt forumlarını) yüklemek istediğinize emin misiniz? (Mevcut verileriniz silinmez, üzerine eklenir.)')) return;
    
    setSeeding(true);
    try {
      const parents = [
        { name: "Haklar ve Mevzuat", slug: "haklar-ve-mevzuat", icon: "Scale", description: "Engelli hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.", sort_order: 10 },
        { name: "Sağlık ve Medikal", slug: "saglik-ve-medikal", icon: "HeartPulse", description: "Rapor alımı, tıbbi tedaviler, medikal cihazlar ve protez/ortez deneyimleri.", sort_order: 20 },
        { name: "Erişilebilirlik ve Teknoloji", slug: "erisilebilirlik-ve-teknoloji", icon: "Eye", description: "Ekran okuyucular, fiziksel mekan tasarımı ve akıllı yardımcı araçlar.", sort_order: 30 },
        { name: "Sosyal Yaşam ve Akran Desteği", slug: "sosyal-yasam-ve-akran-destegi", icon: "Users", description: "Eğitim, kariyer, sosyal yardımlaşma ve farkındalık paylaşımları.", sort_order: 40 }
      ];

      const insertedParents: any[] = [];

      for (const parent of parents) {
        const parentId = generateUUID();
        const { data, error } = await supabase
          .from('categories')
          .insert([{ id: parentId, ...parent }])
          .select()
          .single();
        
        if (!error && data) {
          insertedParents.push(data);
        } else {
          const { data: existing } = await supabase
            .from('categories')
            .select()
            .eq('slug', parent.slug)
            .single();
          if (existing) {
            insertedParents.push(existing);
          }
        }
      }

      const parentMap = new Map(insertedParents.map(p => [p.slug, p.id]));

      const subforums = [
        { name: "Engelli Hakları ve Yasalar", slug: "engelli-haklari-ve-yasalar", icon: "Scale", description: "Engellilerin anayasal hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.", sort_order: 11, parent_slug: "haklar-ve-mevzuat" },
        { name: "Maaşlar, Ödenekler ve Sosyal Yardımlar", slug: "maaslar-odenekler-ve-sosyal-yardimlar", icon: "CreditCard", description: "2022 engelli maaşı, evde bakım aylığı, vakıf yardımları ve başvuru koşulları.", sort_order: 12, parent_slug: "haklar-ve-mevzuat" },
        { name: "Malulen Emeklilik ve Vergi İndirimi", slug: "malulen-emeklilik-ve-vergi-indirimi", icon: "PiggyBank", description: "Vergi indirimi dereceleri, erken emeklilik şartları, maluliyet tespiti ve SGK işlemleri.", sort_order: 13, parent_slug: "haklar-ve-mevzuat" },
        { name: "EKPSS (Sınav ve Atamalar)", slug: "ekpss-sinav-ve-atamalar", icon: "Award", description: "Engelli Kamu Personeli Seçme Sınavı hazırlık, başvuru, tercih, kadrolar ve atama haberleri.", sort_order: 14, parent_slug: "haklar-ve-mevzuat" },

        { name: "Engelli Sağlık Raporu", slug: "engelli-saglik-raporu", icon: "FileText", description: "Sağlık kurulu raporu alma süreci, engelli oranları, itirazlar ve hastane deneyimleri.", sort_order: 21, parent_slug: "saglik-ve-medikal" },
        { name: "Medikal Cihazlar ve Protez/Ortez", slug: "medikal-cihazlar-ve-protez-ortez", icon: "HeartPulse", description: "Tekerlekli sandalyeler, işitme cihazları, protezler, SGK ödemeleri ve marka deneyimleri.", sort_order: 22, parent_slug: "saglik-ve-medikal" },
        { name: "Kronik Hastalıklar ve İlaç Paylaşımları", slug: "kronik-hastaliklar-ve-ilac-paylasimlari", icon: "Activity", description: "Kronik rahatsızlıklarla yaşam, tedavi protokolleri, ilaçar ve yan etki paylaşımları.", sort_order: 23, parent_slug: "saglik-ve-medikal" },

        { name: "Görme Engelliler Teknolojileri", slug: "gorme-engelliler-teknolojileri", icon: "Eye", description: "NVDA, Jaws, VoiceOver ekran okuyucular, kabartma cihazlar ve sesli kütüphaneler.", sort_order: 31, parent_slug: "erisilebilirlik-ve-teknoloji" },
        { name: "İşitme ve Dil Çözümleri", slug: "isitme-ve-dil-cozumleri", icon: "Volume2", description: "İşitme cihazı ayarları, koklear implant, işaret dili eğitimleri ve alt yazı araçları.", sort_order: 32, parent_slug: "erisilebilirlik-ve-teknoloji" },
        { name: "Fiziksel Mekan ve Ulaşım Erişilebilirliği", slug: "fiziksel-mekan-ve-ulasim-erisilebilirligi", icon: "MapPin", description: "Tekerlekli sandalye dostu mekanlar, toplu taşıma, rampalar ve erişilebilirlik haritaları.", sort_order: 33, parent_slug: "erisilebilirlik-ve-teknoloji" },

        { name: "Eğitim ve İstihdam", slug: "egitim-ve-istihdam", icon: "GraduationCap", description: "Engelli öğrencilerin eğitim hakları, özel eğitim, iş ilanları ve çalışma hayatı zorlukları.", sort_order: 41, parent_slug: "sosyal-yasam-ve-akran-destegi" },
        { name: "Buluşma ve Etkinlikler", slug: "bulusma-ve-etkinlikler", icon: "Calendar", description: "Fiziksel veya çevrimiçi engelsiz buluşmalar, sanatsal ve sportif faaliyet duyuruları.", sort_order: 42, parent_slug: "sosyal-yasam-ve-akran-destegi" },
        { name: "Ayrımcılık Bildirimi ve Hak İhlalleri", slug: "ayrimcilik-bildirimi-ve-hak-ihlalleri", icon: "AlertTriangle", description: "Günlük yaşamda karşılaşılan engelli ayrımcılığı, hak ihlalleri ve hukuki başvuru takibi.", sort_order: 43, parent_slug: "sosyal-yasam-ve-akran-destegi" }
      ];

      for (const sub of subforums) {
        const parentId = parentMap.get(sub.parent_slug);
        if (parentId) {
          await supabase
            .from('categories')
            .insert([{
              id: generateUUID(),
              name: sub.name,
              slug: sub.slug,
              icon: sub.icon,
              description: sub.description,
              sort_order: sub.sort_order,
              parent_id: parentId
            }]);
        }
      }

      toast.success('Detaylı engelli forum hiyerarşisi başarıyla yüklendi!');
      onRefresh();
    } catch (err: any) {
      toast.error('Kategoriler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Alt kategorileri varsa onlar da silinecektir.')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Hata: ' + error.message);
    else {
      toast.success('Kategori silindi');
      onRefresh();
    }
  };

  const parentCategoriesList = categories.filter(c => !c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 bg-[#eef2f7] p-4 rounded-sm">
        <div>
          <h2 className="text-sm font-black text-[#185886] uppercase tracking-wider">Kategori ve Forum Hiyerarşisi</h2>
          <p className="text-xs text-slate-600 font-normal mt-0.5">Ana bölümleri ve alt forum dallarını yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSeedDefaultCategories}
            disabled={seeding}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-sm text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {seeding ? <Loader2 size={13} className="animate-spin" /> : <FolderTree size={13} />}
            Varsayılan Ağacı Yükle
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 bg-[#f2930d] hover:bg-[#d68007] text-slate-950 border border-[#b26904] px-3.5 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
          >
            <Plus size={13} /> Yeni Kategori Ekle
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const parentName = cat.parent_id 
            ? categories.find(p => p.id === cat.parent_id)?.name 
            : null;

          return (
            <div key={cat.id} className="rounded-sm border border-slate-200 bg-white shadow-xs hover:border-[#185886]/40 transition-colors flex flex-col justify-between overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                  cat.parent_id ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}>
                  {cat.parent_id ? `ALT FORUM / ${parentName}` : 'ANA BÖLÜM'}
                </span>
                <button onClick={() => handleDelete(cat.id)} className="p-1 rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Sil">
                  <Trash2 size={13}/>
                </button>
              </div>

              <div className="p-4 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-[#185886] mb-1">{cat.name}</h4>
                <p className="text-xs text-slate-500 leading-normal line-clamp-3">{cat.description || 'Açıklama belirtilmemiş.'}</p>
              </div>

              <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>slug</span>
                <span className="font-semibold text-slate-700">{cat.slug}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog.Root open={isAdding} onOpenChange={setIsAdding}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white border border-slate-300 p-5 rounded-sm shadow-2xl focus:outline-none">
            <Dialog.Title className="text-sm font-black text-[#185886] uppercase tracking-wider mb-1">Yeni Kategori Ekle</Dialog.Title>
            <Dialog.Description className="text-xs text-slate-500 mb-4">Bu kategori forum ana dizininde ve filtrelerde görünecektir.</Dialog.Description>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori / Alt Forum Adı</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#185886] outline-none" 
                  placeholder="Örn: Erişilebilirlik Donanımları"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Üst Kategori (Opsiyonel)</label>
                <select 
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#185886] outline-none cursor-pointer"
                >
                  <option value="">-- Ana Forum Bölümü Yap --</option>
                  {parentCategoriesList.map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#185886] outline-none min-h-[70px]" 
                  placeholder="Bu kategori altında paylaşılabilecek konular hakkında kısa bilgi..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 p-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer">İptal</button>
                </Dialog.Close>
                <button type="submit" className="flex-1 p-2 rounded-sm bg-[#185886] hover:bg-[#104f75] text-white text-xs font-bold transition-colors cursor-pointer">Oluştur</button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function UserManager({ users, onRefresh, isAdmin }: { users: any[], onRefresh: () => void, isAdmin: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      toast.error('Bu işlem için yönetici yetkisi gereklidir');
      return;
    }

    if (!confirm('Kullanıcı rolünü değiştirmek istediğinize emin misiniz?')) return;

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) toast.error('Hata: ' + error.message);
    else {
      toast.success('Rol güncellendi');
      onRefresh();
    }
  };

  const filteredUsers = users.filter(u => (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 bg-[#eef2f7] p-4 rounded-sm">
        <div>
          <h2 className="text-sm font-black text-[#185886] uppercase tracking-wider">Kullanıcı ve Rol Yönetimi</h2>
          <p className="text-xs text-slate-600 font-normal mt-0.5">Üye rolleri ve erişim yetkilerini düzenleyin.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input 
            type="text" 
            placeholder="Kullanıcı adı ara..."
            aria-label="Kullanıcı listesinde ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-900 focus:border-[#185886] outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5 text-xs font-bold text-[#185886] uppercase tracking-wider">Kullanıcı</th>
              <th className="px-4 py-2.5 text-xs font-bold text-[#185886] uppercase tracking-wider">Rol / Yetki</th>
              <th className="px-4 py-2.5 text-xs font-bold text-[#185886] uppercase tracking-wider text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-[#eef2f7] border border-slate-200 flex items-center justify-center font-bold text-[#185886] text-xs shrink-0">
                      {(u.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">@{u.username || 'isimsiz'}</p>
                      <p className="text-[11px] text-slate-500">{u.full_name || 'İsimsiz Üye'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border ${
                    u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 
                    u.role === 'moderator' ? 'bg-sky-50 text-sky-700 border-sky-200' : 
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {u.role || 'user'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    {isAdmin && (
                      <>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleRoleChange(u.id, 'admin')} 
                            className="px-2 py-1 rounded-sm bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer border border-slate-300"
                          >
                            Yönetici Yap
                          </button>
                        )}
                        {u.role !== 'moderator' && (
                          <button 
                            onClick={() => handleRoleChange(u.id, 'moderator')} 
                            className="px-2 py-1 rounded-sm bg-[#eef2f7] hover:bg-[#deedf7] text-[#185886] text-[11px] font-bold transition-colors cursor-pointer border border-slate-300"
                          >
                            Moderatör Yap
                          </button>
                        )}
                        {u.role !== 'user' && (
                          <button 
                            onClick={() => handleRoleChange(u.id, 'user')} 
                            className="px-2 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer border border-slate-300"
                          >
                            Üye Yap
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModerationManager({ onTopicChange }: { onTopicChange?: () => void }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentTopics = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('topics')
      .select('*, author:profiles(username)')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setTopics(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecentTopics();
  }, [fetchRecentTopics]);

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Bu konuyu ve tüm yanıtlarını silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) toast.error('Hata: ' + error.message);
    else {
      toast.success('Konu silindi');
      fetchRecentTopics();
      onTopicChange?.();
    }
  };

  const handleToggleLock = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('topics').update({ is_locked: !currentStatus }).eq('id', id);
    if (error) toast.error('Hata: ' + error.message);
    else {
      toast.success(currentStatus ? 'Konu kilidi açıldı' : 'Konu kilitlendi');
      fetchRecentTopics();
      onTopicChange?.();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-[#eef2f7] p-4 rounded-sm">
        <h2 className="text-sm font-black text-[#185886] uppercase tracking-wider">Topluluk Moderasyonu</h2>
        <p className="text-xs text-slate-600 font-normal mt-0.5">Konu kilitleme, denetim ve silme işlemleri</p>
      </div>
      
      <div className="space-y-2.5">
        {loading ? (
          <div className="h-24 animate-pulse bg-slate-100 rounded-sm"></div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-sm bg-white text-slate-500 text-xs">
            İncelenecek konu bulunmuyor.
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className="p-4 rounded-sm border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-[#185886]">@{topic.author?.username || 'isimsiz'}</span>
                  <span className="text-[10px] text-slate-400">• <ClientDate dateString={topic.created_at} /></span>
                  {topic.is_locked && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider">
                      Kilitli
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate">{topic.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{topic.content}</p>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => handleToggleLock(topic.id, topic.is_locked)}
                  className={`p-2 rounded-sm border transition-colors cursor-pointer ${topic.is_locked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-300 hover:text-amber-600'}`}
                  title={topic.is_locked ? 'Kilidi Aç' : 'Kilitle'}
                >
                  {topic.is_locked ? <Unlock size={13} /> : <Lock size={13} />}
                </button>
                <button 
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="p-2 rounded-sm bg-slate-50 text-slate-600 border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function McpAdminManager() {
  const [selectedTool, setSelectedTool] = useState('engelsizforum_live_disability_news');
  const [testMode, setTestMode] = useState<'remote' | 'webmcp' | 'simulation'>('remote');
  const [activeTab, setActiveTab] = useState<'web' | 'desktop' | 'terminal' | 'hardware'>('web');
  const [toolArgs, setToolArgs] = useState<Record<string, string>>({
    topic: 'ÖTV 2026 kararları ve Resmi Gazete engelli haberleri',
    scope: 'turkiye',
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toolsList: Array<{ id: string; name: string; desc: string; defaultParams: Record<string, string> }> = [
    { id: 'engelsizforum_live_disability_news', name: 'engelsizforum_live_disability_news', desc: 'Canlı Engelli Haberleri & Resmi Gazete (Gemini Grounding)', defaultParams: { topic: 'ÖTV 2026 ve Engelli Hakları', scope: 'turkiye' } },
    { id: 'engelsizforum_web_search', name: 'engelsizforum_web_search', desc: 'Genel Engelli Mevzuat & Arama Motoru', defaultParams: { query: 'engelli erken emeklilik prim şartları 2026' } },
    { id: 'engelsizforum_search', name: 'engelsizforum_search', desc: 'EngelsizForum İçi Konu Arama', defaultParams: { query: 'ÖTV 2026' } },
    { id: 'engelsizforum_balthazard_calc', name: 'engelsizforum_balthazard_calc', desc: 'Balthazard Oran Hesaplama', defaultParams: { rates: '40, 20, 10' } },
    { id: 'engelsizforum_disability_rights_guide', name: 'engelsizforum_disability_rights_guide', desc: 'Yasal Haklar & Muafiyet Rehberi', defaultParams: { reportPercentage: '40', disabilityType: 'Ortopedik' } },
    { id: 'engelsizforum_legislation_lookup', name: 'engelsizforum_legislation_lookup', desc: 'Mevzuat Sorgulama (ÖTV, Emeklilik)', defaultParams: { category: 'otv_2026' } },
    { id: 'engelsizforum_accessibility_checker', name: 'engelsizforum_accessibility_checker', desc: 'WCAG 2.2 Web Erişilebilirlik Denetçisi', defaultParams: { urlOrContent: 'https://www.engelsizforum.com', targetLevel: 'WCAG_AAA' } },
    { id: 'engelsizforum_tax_discount_calc', name: 'engelsizforum_tax_discount_calc', desc: 'Engellilik Gelir Vergisi İndirimi', defaultParams: { degree: '1', grossSalary: '60000' } },
    { id: 'engelsizforum_home_care_allowance_calc', name: 'engelsizforum_home_care_allowance_calc', desc: 'Evde Bakım Maaşı Gelir Testi', defaultParams: { householdCount: '4', totalHouseholdIncome: '35000', disabilityPercentage: '70' } },
    { id: 'engelsizforum_fact_checker_ai', name: 'engelsizforum_fact_checker_ai', desc: 'Canlı Bilgi & Haber Doğrulama (Fact-Checker)', defaultParams: { claim: '2026 yılında elektrik faturalarında engelli indirimi kaldırıldı mı?' } },
    { id: 'engelsizforum_general_tax_salary_calc', name: 'engelsizforum_general_tax_salary_calc', desc: 'Net-Brüt Maaş & Kıdem Tazminatı Hesaplama', defaultParams: { grossSalary: '50000', workingYears: '4', calcType: 'kidem_ihbar' } },
    { id: 'engelsizforum_code_accessibility_inspector', name: 'engelsizforum_code_accessibility_inspector', desc: 'Kod Erişilebilirlik & ARIA Denetleyici', defaultParams: { codeSnippet: '<button onClick={doSomething}><img src="icon.png" /></button>', framework: 'React' } },
  ];

  const presets: Array<{ label: string; tool: string; params: Record<string, string> }> = [
    { label: '🚗 ÖTV 2026 Limiti', tool: 'engelsizforum_live_disability_news', params: { topic: 'ÖTV 2026 limiti ve Resmi Gazete kararları', scope: 'turkiye' } },
    { label: '📰 Canlı Haber Taraması', tool: 'engelsizforum_web_search', params: { query: 'Resmi Gazete engelli bakıcı maaşı zammı 2026' } },
    { label: '📊 Balthazard (%40+%20)', tool: 'engelsizforum_balthazard_calc', params: { rates: '40, 20' } },
    { label: '🔍 Fact-Checker (Haber Doğrulama)', tool: 'engelsizforum_fact_checker_ai', params: { claim: 'Kıdem tazminatı tavanı 2026 zammı açıklandı mı?' } },
    { label: '💵 Net-Brüt Maaş & Kıdem', tool: 'engelsizforum_general_tax_salary_calc', params: { grossSalary: '55000', workingYears: '5', calcType: 'kidem_ihbar' } },
    { label: '💻 Kod WCAG Denetimi', tool: 'engelsizforum_code_accessibility_inspector', params: { codeSnippet: '<button onClick={() => {}}><img src="avatar.jpg" /></button>', framework: 'React' } },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    const found = toolsList.find((t) => t.id === toolId);
    if (found) {
      setToolArgs(found.defaultParams);
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setSelectedTool(preset.tool);
    setToolArgs(preset.params);
  };

  const handleRunTest = async () => {
    setIsExecuting(true);
    setTestResult(null);

    try {
      let formattedArgs: Record<string, any> = { ...toolArgs };
      if (selectedTool === 'engelsizforum_balthazard_calc') {
        const ratesStr = toolArgs.rates || '40, 20';
        formattedArgs = { rates: ratesStr.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n)) };
      } else if (selectedTool === 'engelsizforum_disability_rights_guide') {
        formattedArgs = { ...toolArgs, reportPercentage: Number(toolArgs.reportPercentage || 40) };
      }

      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: selectedTool,
          arguments: formattedArgs,
        },
      };

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setTestResult({
        requestPayload: payload,
        responsePayload: json,
        mode: testMode,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
      });
    } catch (err: any) {
      toast.error('Test hatası: ' + err.message);
      setTestResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success(`${label} kopyalandı`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-sm border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#185886]">MCP Sunucu Durumu</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-sm font-bold font-mono text-emerald-600">ONLINE (200 OK)</p>
          <p className="text-[10px] text-slate-400 font-mono">/api/mcp (SSE & JSON-RPC)</p>
        </div>

        <div className="p-4 rounded-sm border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#185886]">Aktif Ajan Araçları</span>
            <Bot size={14} className="text-[#185886]" />
          </div>
          <p className="text-base font-black text-slate-800 tabular-nums">26 Araç</p>
          <p className="text-[10px] text-slate-400">Mevzuat ve Erişilebilirlik Motoru</p>
        </div>

        <div className="p-4 rounded-sm border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#185886]">Canlı Arama (Grounding)</span>
            <Sparkles size={14} className="text-[#185886]" />
          </div>
          <p className="text-sm font-bold text-slate-800">Gemini 2.5 Flash</p>
          <p className="text-[10px] text-slate-400">Resmi Gazete ve Web Doğrulama</p>
        </div>

        <div className="p-4 rounded-sm border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#185886]">Protokol Standardı</span>
            <Globe size={14} className="text-[#185886]" />
          </div>
          <p className="text-sm font-bold font-mono text-slate-800">MCP (2024-11-05)</p>
          <p className="text-[10px] text-slate-400">JSON-RPC 2.0 / W3C WebML</p>
        </div>
      </div>

      {/* Interactive Tool Test Console */}
      <div className="p-5 rounded-sm border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 bg-[#eef2f7] p-3.5 rounded-sm">
          <div>
            <h3 className="text-sm font-black text-[#185886] uppercase tracking-wider">Canlı MCP Araç Test Konsolu</h3>
            <p className="text-xs text-slate-600 font-normal mt-0.5">WebMCP ve JSON-RPC araçlarını doğrudan test edin.</p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-slate-300">
            <button
              onClick={() => setTestMode('remote')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${testMode === 'remote' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Remote MCP
            </button>
            <button
              onClick={() => setTestMode('webmcp')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${testMode === 'webmcp' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              WebMCP Client
            </button>
            <button
              onClick={() => setTestMode('simulation')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${testMode === 'simulation' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Ajan Simülasyonu
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#185886]">Hızlı test önayarları:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 rounded-sm border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-3.5 md:col-span-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Araç Seçimi</label>
              <select
                value={selectedTool}
                onChange={(e) => handleToolSelect(e.target.value)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white text-slate-900 font-bold text-xs focus:border-[#185886] outline-none cursor-pointer"
              >
                {toolsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Parametreler</label>
              {Object.entries(toolArgs).map(([paramKey, paramVal]) => (
                <div key={paramKey}>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{paramKey}:</span>
                  <input
                    type="text"
                    value={paramVal}
                    onChange={(e) => setToolArgs({ ...toolArgs, [paramKey]: e.target.value })}
                    className="w-full mt-0.5 p-2 rounded-sm border border-slate-300 bg-white text-xs text-slate-900 focus:border-[#185886] outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleRunTest}
              disabled={isExecuting}
              className="w-full py-2 px-4 rounded-sm bg-[#185886] hover:bg-[#104f75] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Terminal size={13} />}
              {testMode === 'webmcp' ? 'WebMCP Çalıştır' : 'Aracı Çalıştır'}
            </button>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#185886] uppercase tracking-wider">
                Konsol Çıktısı ({testMode.toUpperCase()})
              </span>
              {testResult && (
                <span className="text-xs font-mono text-emerald-600 font-bold">200 OK • {testResult.timestamp}</span>
              )}
            </div>

            <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 font-mono text-xs overflow-x-auto min-h-[220px] max-h-[360px] space-y-3 text-slate-100">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-slate-400 py-16 justify-center">
                  <Loader2 size={15} className="animate-spin text-[#185886]" />
                  <span className="text-xs">MCP ve Gemini Grounding taranıyor...</span>
                </div>
              ) : testResult ? (
                <>
                  <div>
                    <span className="text-emerald-400 font-bold">{"// Formatlanmış Yanıt:"}</span>
                    <pre className="mt-1.5 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed bg-slate-850 p-3 rounded-sm border border-slate-800">
                      {testResult.responsePayload?.result?.content?.[0]?.text || JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-sky-400 font-bold">{"// JSON-RPC Yanıtı:"}</span>
                    <pre className="mt-1 text-slate-400 text-[11px] overflow-x-auto">
                      {JSON.stringify(testResult.responsePayload, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 py-16 text-center font-sans text-xs">
                  Soldaki araç menüsünden seçim yapıp &quot;Aracı Çalıştır&quot; butonuna basarak canlı MCP yanıtını test edin.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Snippets */}
      <div className="p-5 rounded-sm border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 bg-[#eef2f7] p-3.5 rounded-sm">
          <div>
            <h3 className="text-sm font-black text-[#185886] uppercase tracking-wider">Geliştirici ve Ajan Entegrasyon Rehberi</h3>
            <p className="text-xs text-slate-600 font-normal mt-0.5">Cursor, Claude, Windsurf, Python ve IoT entegrasyon kodları.</p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-slate-300 flex-wrap">
            <button
              onClick={() => setActiveTab('web')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${activeTab === 'web' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Web AI
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${activeTab === 'desktop' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Masaüstü IDE
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${activeTab === 'terminal' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Terminal / CLI
            </button>
            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer ${activeTab === 'hardware' ? 'bg-[#185886] text-white' : 'text-slate-600 hover:text-[#185886] hover:bg-slate-50'}`}
            >
              Donanım ve IoT
            </button>
          </div>
        </div>

        {/* Tab 1: Web AI */}
        {activeTab === 'web' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Google Gemini ve Claude Web Remote MCP</span>
                <button
                  onClick={() => copyText('https://www.engelsizforum.com/mcp', 'Remote MCP URL')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Kopyala"
                >
                  {copiedCode === 'Remote MCP URL' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-normal">Custom Connected Apps veya Remote MCP sunucu adresi:</p>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                https://www.engelsizforum.com/mcp
              </pre>
            </div>

            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">ChatGPT / Custom GPT OpenAPI Endpoint</span>
                <button
                  onClick={() => copyText('https://www.engelsizforum.com/api/mcp', 'OpenAPI URL')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Kopyala"
                >
                  {copiedCode === 'OpenAPI URL' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-normal">GPTs Actions sekmesinde kullanılacak Endpoint:</p>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                https://www.engelsizforum.com/api/mcp
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Desktop */}
        {activeTab === 'desktop' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Cursor IDE (.cursor/mcp.json)</span>
                <button
                  onClick={() => copyText(JSON.stringify({ mcpServers: { engelsizforum: { url: 'https://www.engelsizforum.com/mcp' } } }, null, 2), 'Cursor Config')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Kopyala"
                >
                  {copiedCode === 'Cursor Config' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
{`{
  "mcpServers": {
    "engelsizforum": {
      "url": "https://www.engelsizforum.com/mcp"
    }
  }
}`}
              </pre>
            </div>

            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Windsurf ve Claude Desktop</span>
                <button
                  onClick={() => copyText(JSON.stringify({ mcpServers: { engelsizforum: { url: 'https://www.engelsizforum.com/mcp' } } }, null, 2), 'Desktop Config')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Kopyala"
                >
                  {copiedCode === 'Desktop Config' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
{`{
  "mcpServers": {
    "engelsizforum": {
      "url": "https://www.engelsizforum.com/mcp"
    }
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Terminal */}
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Claude Code CLI</span>
                <button
                  onClick={() => copyText('claude mcp add engelsizforum https://www.engelsizforum.com/mcp', 'Claude CLI')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode === 'Claude CLI' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                claude mcp add engelsizforum https://www.engelsizforum.com/mcp
              </pre>
            </div>

            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Aider CLI</span>
                <button
                  onClick={() => copyText('aider --mcp-server https://www.engelsizforum.com/mcp', 'Aider CLI')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode === 'Aider CLI' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                aider --mcp-server https://www.engelsizforum.com/mcp
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Hardware */}
        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">Raspberry Pi (Python Asistan)</span>
                <button
                  onClick={() => copyText(`import requests
res = requests.post("https://www.engelsizforum.com/api/mcp", json={
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {"name": "engelsizforum_live_disability_news", "arguments": {"topic": "ÖTV 2026"}}
})
print(res.json()["result"]["content"][0]["text"])`, 'Python Script')}
                  className="p-1 hover:bg-slate-200 rounded-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode === 'Python Script' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
{`import requests
res = requests.post("https://www.engelsizforum.com/api/mcp", json={
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {"name": "engelsizforum_live_disability_news", "arguments": {"topic": "ÖTV 2026"}}
})
print(res.json()["result"]["content"][0]["text"])`}
              </pre>
            </div>

            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#185886]">ESP32 (MicroPython)</span>
              </div>
              <pre className="p-2.5 rounded-sm bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
{`import urequests, ujson
res = urequests.post("https://www.engelsizforum.com/api/mcp", 
    headers={"Content-Type": "application/json"},
    data=ujson.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "engelsizforum_balthazard_calc", "arguments": {"rates": [40, 20]}}})
)
print(res.json())`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
