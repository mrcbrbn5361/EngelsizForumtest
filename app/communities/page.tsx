'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Sparkles, X, Globe, Save } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  member_count?: number;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', icon: 'users' });
  const [creating, setCreating] = useState(false);

  const fetchCommunities = React.useCallback(async () => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched communities:', data);
      setCommunities(data || []);
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const slug = newCommunity.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...newCommunity, slug }]);
      
      if (error) throw error;
      setShowCreateForm(false);
      setNewCommunity({ name: '', description: '', icon: 'users' });
      await fetchCommunities();
    } catch (err) {
      console.error('Error creating community:', err);
      alert('Topluluk oluşturulurken hata oluştu.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted) {
        await fetchCommunities();
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [fetchCommunities]);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'users': return <Users className="text-blue-500" />;
      case 'message': return <MessageSquare className="text-purple-500" />;
      case 'handshake': return <Handshake className="text-green-500" />;
      default: return <Users className="text-primary" />;
    }
  };

  return (
    <DashboardLayout>
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
        <header className="mb-12 md:mb-16 flex flex-col items-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest"
          >
            TOPLULUKLARIMIZ
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-foreground"
          >
            Özel İlgi Grupları
          </motion.h1>
          <div className="flex flex-col items-center justify-center gap-8 w-full max-w-3xl">
            <p className="text-muted-foreground text-base md:text-xl leading-relaxed font-medium">
              Deneyimlerinizi paylaşabileceğiniz ve benzer ilgi alanlarına sahip kişilerle tanışabileceğiniz topluluklara katılın.
            </p>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              <Plus size={24} className={showCreateForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
              {showCreateForm ? 'Vazgeç' : 'Topluluk Oluştur'}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <form 
              onSubmit={createCommunity}
              className="bg-card p-6 md:p-10 rounded-3xl border border-border max-w-2xl mx-auto space-y-8 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Yeni Bir Grup Kur</h2>
                <p className="text-muted-foreground font-medium">Topluluğunuzu başlatın ve insanları bir araya getirin.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">GRUP ADI</label>
                <input 
                  type="text" 
                  placeholder="Örn: Erişilebilir Oyunlar" 
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-border bg-muted/30 focus:border-primary focus:bg-background outline-none transition-all text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">AÇIKLAMA</label>
                <textarea 
                  placeholder="Grubun amacını kısaca yazın..." 
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-border bg-muted/30 focus:border-primary focus:bg-background outline-none transition-all text-lg min-h-[120px] font-medium resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={creating}
                className="w-full py-5 px-8 bg-primary text-primary-foreground rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {creating ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                {creating ? 'Kuruluyor...' : 'Grubu Kur'}
              </button>
            </form>
          </motion.div>
        )}

        <div className="relative mb-12 max-w-3xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Gruplarda ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 h-[62px] rounded-2xl border border-border bg-muted/30 focus:border-primary focus:bg-background outline-none transition-all text-lg font-bold shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="font-black text-muted-foreground text-sm uppercase tracking-widest">Veriler çekiliyor...</p>
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {filteredCommunities.map((community, index) => (
              <motion.div 
                key={community.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-card p-6 md:p-10 rounded-3xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    {getIcon(community.icon)}
                  </div>
                  <div>
                    <div className="flex items-start gap-4 mb-8">
                      <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                        {getIcon(community.icon)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">TOPLULUK</p>
                        <h2 className="text-xl md:text-2xl font-black transition-colors break-words whitespace-normal tracking-tighter text-foreground group-hover:text-primary">
                          <Link href={`/communities/${community.id}`} className="after:absolute after:inset-0 outline-none">
                            {community.name}
                          </Link>
                        </h2>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed line-clamp-3 font-medium">
                      {community.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      KEŞFET <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-6 bg-card rounded-[2.5rem] border-4 border-dashed border-border">
            <Users className="mx-auto text-muted-foreground mb-8 opacity-10" size={120} />
            <h3 className="text-3xl md:text-5xl font-black mb-6 text-foreground tracking-tighter">Topluluk Bulunamadı</h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">Aradığınız kriterlere uygun bir grup henüz yok. Kendi topluluğunuzu başlatmaya ne dersiniz?</p>
          </div>
        )}

      </main>
    </DashboardLayout>
  );
}
