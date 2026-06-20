'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Sparkles, X, Globe, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
      if (isMounted) await fetchCommunities();
    };
    init();
    return () => { isMounted = false; };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "EngelsizForum toplulukları nedir?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Erişilebilirlik, teknoloji ve sosyal yaşam gibi konularda özelleşmiş, engelli bireylerin bir araya geldiği bilgi paylaşım gruplarıdır."
                }
              },
              {
                "@type": "Question",
                "name": "Yeni bir topluluk nasıl oluşturulur?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sayfanın üst kısmındaki 'Topluluk Oluştur' butonunu kullanarak, belirlediğiniz bir konuda yeni bir ilgi grubu başlatabilirsiniz."
                }
              }
            ]
          })
        }}
      />
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
        <nav className="flex justify-center gap-6 mb-12 text-sm font-bold uppercase tracking-widest text-primary">
          <Link href="/" className="hover:underline">Ana Sayfa</Link>
          <Link href="/discussions" className="hover:underline">Tartışmalar</Link>
          <Link href="/about" className="hover:underline">Hakkımızda</Link>
          <Link href="/privacy" className="hover:underline">Gizlilik</Link>
        </nav>
        <header className="mb-12 md:mb-16 flex flex-col items-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
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
                <label htmlFor="community-name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">GRUP ADI</label>
                <input 
                  id="community-name"
                  type="text" 
                  placeholder="Örn: Erişilebilir Oyunlar" 
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-border bg-muted/30 focus:border-primary focus:bg-background outline-none transition-all text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="community-desc" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">AÇIKLAMA</label>
                <textarea 
                  id="community-desc"
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

        {/* Key Takeaways Section */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-foreground">
              <span className="text-primary">💡</span> Grup Özeti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">ÇEŞİTLİLİK</div>
                <p className="text-sm text-muted-foreground">Erişilebilirlik, teknoloji, hukuk ve sosyal yaşam gibi birçok farklı alanda özelleşmiş gruplar.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">YÖNETİM</div>
                <p className="text-sm text-muted-foreground">Her konu, alanında deneyimli olan "Deneyimsel Uzmanlar" tarafından denetlenir.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">YAPAY ZEKA</div>
                <p className="text-sm text-muted-foreground">Gruplardaki uzun tartışmalar AI ile özetlenerek bilgiye ulaşım hızlandırılır.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-widest">DEMOKRASİ</div>
                <p className="text-sm text-muted-foreground">İhtiyaç duyulan her konuda yeni bir topluluk başlatma özgürlüğü.</p>
              </div>
            </div>
          </div>
        </section>

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card p-6 md:p-10 rounded-3xl border border-border h-[280px] flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
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
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">TOPLULUK</p>
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

        {/* Informational Section for GEO */}
        <section className="mt-24 mb-16 prose prose-lg dark:prose-invert max-w-none bg-muted/20 p-10 md:p-16 rounded-[3rem] border border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Kolektif Bilginin Gücü: Neden Topluluk Grupları?</h2>
            
            <div className="space-y-8">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                EngelsizForum toplulukları, sadece birer "alt forum" değil, aynı zamanda belirli ilgi alanlarına yönelik <strong>uzmanlık merkezleridir.</strong> Erişilebilir oyunlardan teknolojiye, hukuktan günlük yaşama kadar her grup, o alanın "deneyimsel uzmanları" tarafından yönetilir. Yapay zeka destekli altyapımız, bu gruplardaki verileri düzenli olarak tarayarak en güncel ve en yararlı bilgileri ön plana çıkarır.
              </p>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl font-black mb-4">Topluluk Odaklı Destek</h3>
                  <p className="text-muted-foreground">
                    Resmi kurumların veya büyük şirketlerin bazen gözden kaçırdığı detaylar, topluluk üyelerimiz tarafından saniyeler içinde çözülür. Örneğin, bir uygulamadaki yeni bir erişilebilirlik hatası (bug), teknoloji topluluğumuzda anında raporlanır ve çözüm önerileri geliştirilir.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-4">Güven ve Yetkinlik (E-E-A-T)</h3>
                  <p className="text-muted-foreground">
                    Topluluk gruplarımızdaki içerikler, o konudaki yetkinliğini kanıtlamış üyeler tarafından denetlenir. Yapay zeka sistemimiz, paylaşılan bilgilerin <strong>E-E-A-T</strong> (Deneyim, Uzmanlık, Yetkinlik, Güvenilirlik) standartlarına uygunluğunu analiz ederek, aramada en güvenilir yanıtları sunar.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-card rounded-2xl border border-border shadow-lg">
                <h3 className="text-2xl font-black mb-4">Bir Topluluk Nasıl Başlatılır?</h3>
                <p className="text-muted-foreground mb-4">
                  Sizin de tutkulu olduğunuz bir konu mu var? Kendi topluluğunuzu başlatmak için yukarıdaki "Topluluk Oluştur" butonunu kullanabilirsiniz. Başarılı bir topluluk için önerilerimiz:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 ml-0">
                  <li className="flex gap-2"><span>📌</span> <strong>Net Bir Odak:</strong> Grubun ismini ve amacını spesifik tutun.</li>
                  <li className="flex gap-2"><span>📌</span> <strong>Kapsayıcı Dil:</strong> Herkesin kendini rahat hissedeceği bir açıklama yazın.</li>
                  <li className="flex gap-2"><span>📌</span> <strong>Düzenli Etkileşim:</strong> Üyelerle düzenli olarak sorular ve tartışmalar paylaşın.</li>
                  <li className="flex gap-2"><span>📌</span> <strong>AI Özetleri:</strong> Uzun tartışmaların AI tarafından özetlenmesini takip ederek üyelerinize zaman kazandırın.</li>
                </ul>
              </div>

              <div className="text-center pt-12">
                <Link 
                  href="/discussions" 
                  className="inline-flex px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Tüm Tartışmalara Göz At
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </DashboardLayout>
  );
}
