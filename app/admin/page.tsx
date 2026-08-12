'use client';
import { getVisitorStats } from '../actions';
import { toast } from 'sonner';

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
  Edit, 
  CheckCircle, 
  XCircle,
  LayoutDashboard,
  Settings,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, generateUUID } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
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
        const res = await fetch('/api/visitor-stats', {
          headers: { 'Authorization': 'Bearer engelsizforumteknofesttanitim' }
        });
        if (res.ok) visitors = await res.json();
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
  }, [supabase]);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    if (error) toast.error('Kategoriler yüklenemedi');
  }, []);

  const fetchUsers = useCallback(async () => {
    // Önce created_at ile dene, hata alırsa id ile dene (created_at yeni eklendiği için)
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
      <div className="flex min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Yetkili Paneli</h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Hoş geldin, <span className="text-foreground font-bold">{profile?.username}</span> • {profile?.role}
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center rounded-xl bg-background px-6 py-3 text-sm font-bold text-foreground border border-border transition hover:bg-muted"
          >
            Foruma Dön
          </button>
        </header>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-8">
          <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Tabs.List className="flex gap-1.5 sm:gap-2 p-1.5 bg-muted rounded-2xl w-max sm:w-fit">
              <TabButton value="overview" icon={<LayoutDashboard size={18} />} label="Özet" />
              <TabButton value="analiz" icon={<TrendingUp size={18} />} label="Analiz" />
              <TabButton value="categories" icon={<FolderTree size={18} />} label="Kategori" />
              <TabButton value="users" icon={<Users size={18} />} label="Üyeler" />
              <TabButton value="moderation" icon={<MessageSquare size={18} />} label="Mod" />
            </Tabs.List>
          </div>

          <Tabs.Content value="overview" className="outline-none space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-border p-8 bg-card shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold tracking-tight">Son Kayıt Olan Üyeler</h3>
                  <button onClick={() => setActiveTab('users')} className="text-sm font-bold text-primary hover:underline">Tümünü Gör</button>
                </div>
                <div className="space-y-4">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm border border-primary/20">
                          {(u.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">@{u.username || 'isimsiz'}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{u.role}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="analiz" className="outline-none space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard label="Toplam Ziyaretçi" value={stats.total_visitors} icon={<Users size={20} />} />
              <StatCard label="Anlık Ziyaretçi" value={stats.active_visitors} icon={<Users size={20} />} />
              <StatCard label="Üyeler" value={stats.users} icon={<Users size={20} />} />
              <StatCard label="Konular" value={stats.topics} icon={<MessageSquare size={20} />} />
              <div className="col-span-2 lg:col-span-4">
                <SummaryCounter stats={stats} />
              </div>
            </div>

            <div className="rounded-3xl border border-border p-8 bg-card shadow-sm">
              <h3 className="text-xl font-black mb-6">Raspberry Pi Entegrasyon Kodu</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Bu kodu Raspberry Pi cihazınızda çalıştırarak verileri admin panelinize gönderebilirsiniz.
              </p>
              <pre className="bg-foreground text-background p-6 rounded-2xl font-mono text-xs overflow-x-auto">
{`import requests
import time
import uuid

# Uygulamanızın URL'ini buraya yazın
API_URL = "https://www.engelsizforum.com/api/visitor-stats" 
TOKEN = "engelsizforumteknofesttanitim"
# Cihaz için benzersiz bir ID
DEVICE_ID = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 2*6, 2)][::-1])

def veriyi_cek():
    try:
        # Önce bu cihazı aktif olarak kaydediyoruz (POST)
        requests.post(
            API_URL,
            json={"device_id": DEVICE_ID},
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        # Sonra güncel istatistikleri çekiyoruz (GET)
        response = requests.get(
            API_URL,
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "User-Agent": "VisitorTracker/1.0"
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[{time.strftime('%H:%M:%S')}] Toplam: {data.get('total_visitors', 0)}, Anlık: {data.get('active_visitors', 0)}")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Hata: Sunucu {response.status_code} koduyla yanıt verdi.")
    except requests.exceptions.RequestException as e:
        print(f"[{time.strftime('%H:%M:%S')}] Bağlantı Hatası: {e}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Beklenmedik Hata: {e}")

if __name__ == "__main__":
    print(f"--- Engelsiz Forum Ziyaretçi Takip Başlatıldı (5 dakikada bir) ---")
    while True:
        veriyi_cek()
        time.sleep(300) # 5 dakikada bir`}
              </pre>
            </div>
          </Tabs.Content>

          <Tabs.Content value="categories" className="outline-none">
            <CategoryManager categories={categories} onRefresh={fetchAllData} />
          </Tabs.Content>

          <Tabs.Content value="users" className="outline-none">
             <UserManager users={usersList} onRefresh={fetchAllData} isAdmin={isAdmin} />
          </Tabs.Content>

          <Tabs.Content value="moderation" className="outline-none">
            <ModerationManager onTopicChange={fetchAllData} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </DashboardLayout>
  );
}

function ModerationManager({ onTopicChange }: { onTopicChange?: () => void }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentTopics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
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
    if (!confirm('Bu konuyu ve tüm yorumlarını silmek istediğinize emin misiniz?')) return;
    
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
      <h2 className="text-2xl font-black tracking-tight">Moderasyon</h2>
      
      <div className="space-y-4">
        {loading ? (
          <div className="h-40 animate-pulse bg-muted rounded-3xl"></div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold">
            Henüz incelenecek konu bulunmuyor.
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">@{topic.author?.username}</span>
                  <span className="text-[10px] text-muted-foreground">• {new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <h4 className="font-bold text-lg truncate">{topic.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1 opacity-80">{topic.content}</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleToggleLock(topic.id, topic.is_locked)}
                  className={`p-3 rounded-xl transition-all ${topic.is_locked ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500'}`}
                  title={topic.is_locked ? 'Kilidi Aç' : 'Kilitle'}
                >
                  <AlertTriangle size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="p-3 rounded-xl bg-muted text-muted-foreground hover:bg-red-500 hover:text-white transition-all"
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TabButton({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
  return (
    <Tabs.Trigger 
      value={value}
      className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary uppercase tracking-wider sm:tracking-widest whitespace-nowrap shrink-0"
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </Tabs.Trigger>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-muted rounded-xl text-primary">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function SummaryCounter({ stats }: { stats: any }) {
  const total = stats.total_visitors + stats.active_visitors + stats.users + stats.topics;
  return (
    <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp size={20} /></div>
      </div>
      <div>
        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Genel Özet Sayacı</p>
        <p className="text-3xl font-black tabular-nums text-primary">{total}</p>
      </div>
    </div>
  );
}

// Sub-components
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
        { name: "Kronik Hastalıklar ve İlaç Paylaşımları", slug: "kronik-hastaliklar-ve-ilac-paylasimlari", icon: "Activity", description: "Kronik rahatsızlıklarla yaşam, tedavi protokolleri, ilaçlar ve yan etki paylaşımları.", sort_order: 23, parent_slug: "saglik-ve-medikal" },

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

  // Filter only main (parent) categories for dropdown list
  const parentCategoriesList = categories.filter(c => !c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Kategori Yönetimi</h2>
          <p className="text-sm text-muted-foreground font-medium">Forum yapısını ve alt forumları hiyerarşik olarak düzenleyin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedDefaultCategories}
            disabled={seeding}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-muted transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 size={18} className="animate-spin" /> : <FolderTree size={18} />}
            Varsayılan Hiyerarşiyi Seed Et
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={18} /> Yeni Kategori / Alt Forum
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const parentName = cat.parent_id 
            ? categories.find(p => p.id === cat.parent_id)?.name 
            : null;

          return (
            <div key={cat.id} className="p-5 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4 font-bold">
                    {cat.parent_id ? '↳' : '⊞'}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors" title="Sil"><Trash2 size={14}/></button>
                  </div>
                </div>
                <div className="mb-2">
                  {parentName && (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full mb-1">
                      Alt Forum / {parentName}
                    </span>
                  )}
                  {!cat.parent_id && (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-1">
                      Ana Forum Bölümü
                    </span>
                  )}
                  <h4 className="font-black text-lg leading-tight mt-1">{cat.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">{cat.description || 'Açıklama yok.'}</p>
              </div>
              <div className="flex items-center gap-2 py-2 px-3 bg-muted rounded-xl w-fit">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLUG:</span>
                <span className="text-[10px] font-mono font-bold text-foreground/80">{cat.slug}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog.Root open={isAdding} onOpenChange={setIsAdding}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background p-8 rounded-3xl shadow-2xl focus:outline-none">
            <Dialog.Title className="text-2xl font-black tracking-tight mb-2">Yeni Kategori Ekle</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-6 font-medium">Bu kategori veya alt forum tüm üyeler tarafından forum ana sayfasında görülecektir.</Dialog.Description>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1.5 ml-1">Kategori / Alt Forum Adı</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary focus:bg-background outline-none transition-all font-bold" 
                  placeholder="Erişilebilirlik Sorunları"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1.5 ml-1">Üst Kategori (Opsiyonel)</label>
                <select 
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                  className="w-full p-4 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary focus:bg-background outline-none transition-all font-bold cursor-pointer"
                >
                  <option value="">-- Ana Forum Bölümü Yap (Üst Kategori Yok) --</option>
                  {parentCategoriesList.map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1 ml-1 font-medium">Eğer bu bir Alt Forum olacaksa, bağlı olduğu Ana Bölümü seçin.</p>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1.5 ml-1">Açıklama</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary focus:bg-background outline-none transition-all font-bold min-h-[100px]" 
                  placeholder="Erişilebilirlik hakkında tartışmalar..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 p-4 rounded-xl bg-muted font-bold hover:bg-muted/80 transition-colors">İptal</button>
                </Dialog.Close>
                <button type="submit" className="flex-1 p-4 rounded-xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-primary/20 transition-all">Oluştur</button>
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
      toast.error('Bu işlem için yetkiniz yok');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight">Kullanıcı Yönetimi</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..."
            aria-label="Kullanıcı listesinde ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kullanıcı</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Durum / Rol</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm border border-primary/20 shrink-0">
                      {(u.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">@{u.username || 'isimsiz'}</p>
                      <p className="text-xs text-muted-foreground">{u.full_name || 'İsimsiz Üye'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    u.role === 'moderator' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                    'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu 
                    trigger={<button className="p-2 hover:bg-muted rounded-xl transition-colors"><MoreVertical size={18}/></button>}
                    items={[
                      { label: 'Admin Yap', onClick: () => handleRoleChange(u.id, 'admin'), hide: u.role === 'admin' || !isAdmin },
                      { label: 'Moderatör Yap', onClick: () => handleRoleChange(u.id, 'moderator'), hide: u.role === 'moderator' || !isAdmin },
                      { label: 'Normal Üye Yap', onClick: () => handleRoleChange(u.id, 'user'), hide: u.role === 'user' || !isAdmin },
                      { label: 'Profili Gör', onClick: () => {}, isExternal: true },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Minimal Dropdown Component
function DropdownMenu({ trigger, items }: { trigger: React.ReactNode, items: { label: string, onClick?: () => void, isExternal?: boolean, hide?: boolean }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 py-1 overflow-hidden"
            >
              {items.filter(item => !item.hide).map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
