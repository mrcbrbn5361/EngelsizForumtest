'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
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
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <header className="mb-12 md:mb-20 flex flex-col items-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
          >
            TOPLULUKLARIMIZ
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Özel İlgi Grupları
          </motion.h1>
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl">
            <p className="text-muted-foreground text-sm md:text-lg leading-relaxed font-medium">
              Deneyimlerinizi paylaşabileceğiniz ve benzer ilgi alanlarına sahip kişilerle tanışabileceğiniz topluluklara katılın.
            </p>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90"
            >
              <Plus size={20} className={showCreateForm ? 'rotate-45' : ''} />
              {showCreateForm ? 'Vazgeç' : 'Topluluk Oluştur'}
            </button>
          </div>
        </header>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 md:mb-24"
          >
            <form 
              onSubmit={createCommunity}
              className="bg-card p-8 rounded-3xl border border-border shadow-soft max-w-2xl mx-auto space-y-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-center mb-2">Yeni Bir Grup Kur</h2>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">GRUP ADI</label>
                <input 
                  type="text" 
                  placeholder="Örn: Erişilebilir Oyunlar" 
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  required
                  className="w-full px-5 py-3 rounded-xl border border-border bg-muted/20 focus:border-primary outline-none transition-all text-sm md:text-base font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">AÇIKLAMA</label>
                <textarea 
                  placeholder="Grubun amacını kısaca yazın..." 
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  required
                  className="w-full px-5 py-3 rounded-xl border border-border bg-muted/20 focus:border-primary outline-none transition-all text-sm md:text-base min-h-[100px] font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={creating}
                className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90"
              >
                {creating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {creating ? 'Kuruluyor...' : 'Grubu Kur'}
              </button>
            </form>
          </motion.div>
        )}

        <div className="relative mb-12 md:mb-20 max-w-3xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Gruplarda ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-full border border-border bg-card shadow-sm focus:border-primary outline-none transition-all text-sm md:text-lg font-medium"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <Loader2 className="animate-spin text-primary" size={64} />
            <p className="font-black text-muted-foreground text-sm uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-10">
            {filteredCommunities.map((community, index) => (
                <div key={community.id} className="bg-card p-8 rounded-3xl border border-border shadow-soft flex flex-col justify-between min-h-[220px] md:min-h-[280px]">
                  <div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                        {getIcon(community.icon)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">TOPLULUK</p>
                        <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors truncate tracking-tight">
                          <Link href={`/communities/${community.id}`} className="after:absolute after:inset-0 outline-none">
                            {community.name}
                          </Link>
                        </h2>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">
                      {community.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Görüntüle <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-6 bg-card rounded-[3rem] md:rounded-[5rem] border-4 border-dashed border-border/50">
            <Users className="mx-auto text-muted-foreground mb-8 opacity-10" size={80} />
            <h3 className="text-2xl md:text-4xl font-black mb-4">Topluluk Bulunamadı</h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">Aradığınız kriterlere uygun bir grup yok. Belki de ilk grubu siz kurmalısınız?</p>
          </div>
        )}

      </main>
      </DashboardLayout>
  );
}
