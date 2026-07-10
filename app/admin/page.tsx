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
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
      const [u, t, c, cat] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('topics').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
      ]);
      
      let visitors = { total_visitors: 0, active_visitors: 0 };
      try {
        visitors = await getVisitorStats();
      } catch (e) {
        console.error('Visitor stats error (non-blocking):', e);
      }

      setStats({
        users: u.count || 0,
        topics: t.count || 0,
        comments: c.count || 0,
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shrink-0">
              <Shield size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-black tracking-tight leading-none uppercase truncate">Yetkili Paneli</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground font-bold mt-1 truncate">
                <span className="hidden sm:inline">Hoş geldin, </span><span className="text-primary">{profile?.username}</span> • {profile?.role}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/')}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-xl border border-border hover:bg-muted transition-colors shrink-0"
            >
              Foruma Dön
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6 md:gap-8">
          <div className="overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <Tabs.List className="flex gap-2 p-1 bg-muted rounded-2xl w-fit">
              <TabButton value="overview" icon={<LayoutDashboard size={18} />} label="Özet" />
              <TabButton value="analiz" icon={<TrendingUp size={18} />} label="Analiz" />
              <TabButton value="categories" icon={<FolderTree size={18} />} label="Kategori" />
              <TabButton value="users" icon={<Users size={18} />} label="Üyeler" />
              <TabButton value="moderation" icon={<MessageSquare size={18} />} label="Mod" />
            </Tabs.List>
          </div>

          <Tabs.Content value="overview" className="outline-none space-y-6 md:space-y-8">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              <div className="rounded-3xl border border-border p-6 bg-card shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black tracking-tight">Son Kayıt Olun Üyeler</h3>
                  <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-primary hover:underline">Tümünü Gör</button>
                </div>
                <div className="space-y-4">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20">
                          {(u.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold">@{u.username || 'isimsiz'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{u.role}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="analiz" className="outline-none space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Toplam Ziyaretçi" value={stats.total_visitors} icon={<Users size={20} />} />
              <StatCard label="Anlık Ziyaretçi" value={stats.active_visitors} icon={<Users size={20} />} />
              <StatCard label="Üyeler" value={stats.users} icon={<Users size={20} />} />
              <StatCard label="Konular" value={stats.topics} icon={<MessageSquare size={20} />} />
            </div>

            <div className="rounded-3xl border border-border p-6 bg-card shadow-sm">
              <h3 className="text-lg font-black mb-4">Raspberry Pi Entegrasyon Kodu</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bu kodu Raspberry Pi cihazınızda çalıştırarak verileri admin panelinize gönderebilirsiniz. 
                Gereksinim: <code>pip install requests</code>
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
{`import requests
import time
import uuid

# Uygulamanızın URL'ini buraya yazın
API_URL = "https://www.engelsizforum.com/api/visitor-update" 
TOKEN = "engelsizforumteknofesttanitim"
# Cihaz için benzersiz bir ID (MAC adresi yerine)
DEVICE_ID = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 2*6, 2)][::-1])

def send_data():
    try:
        response = requests.post(
            API_URL,
            json={"mac_address": DEVICE_ID},
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        if response.status_code == 200:
            print(f"Status: {response.status_code}, Veri başarıyla gönderildi (ID: {DEVICE_ID}).")
        else:
            print(f"Status: {response.status_code}, Hata: {response.text}")
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    print(f"Veri gönderimi başlatıldı (ID: {DEVICE_ID}, Her 60 saniyede bir)...")
    while True:
        send_data()
        time.sleep(60) # 1 dakikada bir gönder`}
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
      </main>
    </div>
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
      className="flex items-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary uppercase tracking-widest"
    >
      {icon}
      <span>{label}</span>
    </Tabs.Trigger>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-muted rounded-xl">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// Sub-components
function CategoryManager({ categories, onRefresh }: { categories: any[], onRefresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'MessageSquare' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const { error } = await supabase.from('categories').insert([{ ...formData, slug }]);
    
    if (error) {
      toast.error('Hata: ' + error.message);
    } else {
      toast.success('Kategori eklendi');
      setIsAdding(false);
      setFormData({ name: '', description: '', icon: 'MessageSquare' });
      onRefresh(); // Bu artık fetchAllData'yı tetikleyecek
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Hata: ' + error.message);
    else {
      toast.success('Kategori silindi');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Kategori Yönetimi</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Yeni Kategori
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary mb-4">
                <FolderTree size={20} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><Edit size={14}/></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
            <h4 className="font-black text-lg mb-1">{cat.name}</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">{cat.description || 'Açıklama yok.'}</p>
            <div className="flex items-center gap-2 py-2 px-3 bg-muted rounded-xl w-fit">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLUG:</span>
              <span className="text-[10px] font-mono font-bold">{cat.slug}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root open={isAdding} onOpenChange={setIsAdding}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background p-8 rounded-3xl shadow-2xl focus:outline-none">
            <Dialog.Title className="text-2xl font-black tracking-tight mb-2">Yeni Kategori Ekle</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-6 font-medium">Bu kategori tüm üyeler tarafından forum ana sayfasında ve tartışma bölümlerinde görülecektir.</Dialog.Description>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1.5 ml-1">Kategori Adı</label>
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
                <button type="submit" className="flex-1 p-4 rounded-xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-primary/20 transition-all">Sanal Olarak Oluştur</button>
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

// Minimal Dropdown for the demo
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
