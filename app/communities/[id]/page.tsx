'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { ArrowLeft, Users, MessageSquare, Shield, Globe, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchCommunity = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setCommunity(data);
    } catch (err) {
      console.error('Error fetching community:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (id && isMounted) {
        await fetchCommunity();
      }
    };
    init();
    return () => { isMounted = false; };
  }, [id, fetchCommunity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30 text-center py-20">
        <Navbar />
        <h1 className="text-2xl font-bold mt-10">Topluluk bulunamadı.</h1>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">Geri Git</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <button 
          onClick={() => router.push('/communities')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Topluluklar
        </button>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            <header className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Users size={32} />
                  </div>
                  <h1 className="text-3xl font-extrabold">{community.name}</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {community.description}
                </p>
                <div className="flex gap-4">
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all">
                    Gruba Katıl
                  </button>
                  <button className="bg-card border border-border px-8 py-3 rounded-full font-bold hover:bg-muted transition-all">
                    Mesaj Gönder
                  </button>
                </div>
              </div>
              <Users className="absolute -bottom-10 -right-10 size-64 opacity-5" />
            </header>

            <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare size={20} className="text-primary" /> Topluluk Kuralları
              </h2>
              <ul className="space-y-4">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik Odaklılık" description="Paylaşılan her içeriğin erişilebilir olduğundan (alt-text, temiz dil vb.) emin olun." />
                <RuleItem title="Gizlilik" description="Üyelerin özel bilgilerini izinsiz paylaşmayın." />
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Grup Bilgileri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Users size={14} /> Üyeler</span>
                  <span className="text-sm font-bold">Keşfediliyor...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Globe size={14} /> Görünürlük</span>
                  <span className="text-sm font-bold">Açık</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Shield size={14} /> Tür</span>
                  <span className="text-sm font-bold">Destek Grubu</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Hızlı Destek</h3>
              <p className="text-xs text-muted-foreground mb-4">Bu grup hakkında sorunuz mu var? Moderatörlere ulaşın.</p>
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg">
                Yöneticiye Yaz
              </button>
            </div>
          </aside>
        </div>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}

function RuleItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mt-1">
        ✓
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </li>
  );
}
