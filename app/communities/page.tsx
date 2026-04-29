'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Users, Search, ChevronRight, MessageSquare, Handshake, Loader2 } from 'lucide-react';
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

  const fetchCommunities = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold mb-4"
          >
            Özel İlgi Grupları
          </motion.h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Deneyimlerinizi paylaşabileceğiniz ve benzer ilgi alanlarına sahip kişilerle tanışabileceğiniz topluluklara katılın.
          </p>
        </header>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Topluluk ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-bold text-muted-foreground">Topluluklar yükleniyor...</p>
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {getIcon(community.icon)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        <Link href={`/communities/${community.id}`} className="after:absolute after:inset-0 after:z-0 outline-none">
                          {community.name}
                        </Link>
                      </h2>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">KEŞFET</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-8 leading-relaxed line-clamp-3">
                    {community.description}
                  </p>
                  <div className="flex items-center text-primary font-bold gap-2 group-hover:translate-x-2 transition-transform">
                    Topluluğa Katıl <ChevronRight size={18} />
                  </div>
                </div>
                <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-[3rem] border border-dashed border-border">
            <Users className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
            <h3 className="text-xl font-bold mb-2">Henüz topluluk bulunamadı</h3>
            <p className="text-muted-foreground">Aradığınız kriterlere uygun bir grup yok veya henüz veritabanı boş.</p>
          </div>
        )}
      </main>

      <AccessibilityToolbar />
    </div>
  );
}
