'use client';
import { toast } from 'sonner';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { 
  Users, Search, ChevronRight, MessageSquare, Handshake, Loader2, Plus, Save,
  Scale, CreditCard, PiggyBank, Award, FileText, HeartPulse, Activity, Eye, Volume2, MapPin, GraduationCap, Calendar, AlertTriangle, FolderTree, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  member_count?: number;
  parent_id?: string | null;
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
      toast.error('Topluluk oluşturulurken hata oluştu.');
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
    switch (iconName?.toLowerCase()) {
      case 'scale': return <Scale className="text-primary" />;
      case 'creditcard':
      case 'credit-card': return <CreditCard className="text-primary" />;
      case 'piggybank':
      case 'piggy-bank': return <PiggyBank className="text-primary" />;
      case 'award': return <Award className="text-primary" />;
      case 'filetext':
      case 'file-text': return <FileText className="text-primary" />;
      case 'heartpulse':
      case 'heart-pulse': return <HeartPulse className="text-primary text-red-500/80" />;
      case 'activity': return <Activity className="text-primary" />;
      case 'eye': return <Eye className="text-primary" />;
      case 'volume2':
      case 'volume-2': return <Volume2 className="text-primary" />;
      case 'mappin':
      case 'map-pin': return <MapPin className="text-primary" />;
      case 'graduationcap':
      case 'graduation-cap': return <GraduationCap className="text-primary" />;
      case 'calendar': return <Calendar className="text-primary" />;
      case 'alerttriangle':
      case 'alert-triangle': return <AlertTriangle className="text-primary text-amber-500/80" />;
      case 'users': return <Users className="text-primary" />;
      case 'message': return <MessageSquare className="text-primary" />;
      case 'handshake': return <Handshake className="text-primary" />;
      default: return <FolderTree className="text-primary" />;
    }
  };

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
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
              },
              {
                "@type": "WebPage",
                "@id": "https://engelsizforum.com/communities#webpage",
                "url": "https://engelsizforum.com/communities",
                "name": "Topluluklar | EngelsizForum",
                "description": "Erişilebilirlik, teknoloji, engelsiz yaşam ve sosyal konular üzerine odaklanmış uzmanlık grupları ve topluluklar.",
                "isPartOf": { "@id": "https://engelsizforum.com/#website" },
                "inLanguage": "tr-TR"
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://engelsizforum.com/communities#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Topluluklar",
                    "item": "https://engelsizforum.com/communities"
                  }
                ]
              }
            ]
          })
        }}
      />
      <main className="vibe-container py-12">
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-12 text-xs font-bold uppercase tracking-wider text-primary">
          <Link href="/" className="hover:underline">ANA SAYFA</Link>
          <Link href="/discussions" className="hover:underline">TARTIŞMALAR</Link>
          <Link href="/about" className="hover:underline">HAKKIMIZDA</Link>
          <Link href="/privacy" className="hover:underline">GİZLİLİK</Link>
        </nav>
        
        <header className="mb-12">
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <p className="vibe-label ml-0">TOPLULUK REHBERİ</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase">Topluluklar</h1>
                <p className="text-muted-foreground text-base md:text-lg font-normal leading-relaxed max-w-2xl">
                  İlgi alanlarınıza ve ihtiyaçlarınıza göre özelleşmiş alt toplulukları keşfedin.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="vibe-button-primary px-6 py-3 min-h-[48px] text-base font-semibold rounded shrink-0 flex items-center justify-center gap-2"
              >
                <Plus size={18} className={showCreateForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
                {showCreateForm ? 'VAZGEÇ' : 'YENİ TOPLULUK'}
              </button>
            </div>
          </div>
        </header>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <form 
              onSubmit={createCommunity}
              className="bg-card border border-border rounded-lg p-6 md:p-10 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Yeni Bir Topluluk Kur</h2>
                <p className="text-muted-foreground text-sm font-normal">Topluluğunuzu başlatın ve insanları bir araya getirin.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="community-name" className="vibe-label text-xs uppercase font-bold tracking-wider text-muted-foreground">Topluluk Adı</label>
                  <input 
                    id="community-name"
                    type="text" 
                    placeholder="Örn: Erişilebilir Oyunlar" 
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                    required
                    className="vibe-input h-11 text-base rounded border border-border px-3 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="community-icon" className="vibe-label text-xs uppercase font-bold tracking-wider text-muted-foreground">İkon</label>
                  <select 
                    id="community-icon"
                    className="vibe-input h-11 text-base rounded border border-border px-3 bg-background cursor-pointer"
                    value={newCommunity.icon}
                    onChange={(e) => setNewCommunity({...newCommunity, icon: e.target.value})}
                  >
                    <option value="users">Kullanıcılar</option>
                    <option value="message">Mesaj</option>
                    <option value="handshake">El Sıkışma</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="community-desc" className="vibe-label text-xs uppercase font-bold tracking-wider text-muted-foreground">Açıklama</label>
                <textarea 
                  id="community-desc"
                  placeholder="Grubun amacını kısaca yazın..." 
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  required
                  className="vibe-input min-h-[120px] py-3 text-base rounded border border-border px-3 bg-background"
                />
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 rounded text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  İPTAL
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="vibe-button-primary px-6 py-2.5 min-h-[44px] text-sm font-bold rounded flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {creating ? 'KURULUYOR...' : 'TOPLULUĞU KUR'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Key Takeaways Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <span className="text-primary text-2xl">💡</span> Topluluk Özeti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">ÇEŞİTLİLİK</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Erişilebilirlik, teknoloji, hukuk ve sosyal yaşam gibi birçok farklı alanda özelleşmiş topluluklar.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">YÖNETİM</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Her konu, alanında deneyimli olan &quot;Deneyimsel Uzmanlar&quot; tarafından denetlenir.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">YAPAY ZEKA</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Topluluklardaki uzun tartışmalar AI ile özetlenerek bilgiye ulaşım hızlandırılır.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-primary text-xs uppercase tracking-wider">DEMOKRASİ</div>
                <p className="text-xs text-muted-foreground leading-relaxed">İhtiyaç duyulan her konuda yeni bir topluluk başlatma özgürlüğü.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative mb-12 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="TOPLULUKLARDA ARA..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vibe-input vibe-input-pl-12 pr-4 h-12 text-sm uppercase rounded border border-border bg-background w-full"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border h-[220px] flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : (
          (() => {
            let activeCategories = filteredCommunities;
            
            if (activeCategories.length === 0 && !searchQuery) {
              activeCategories = [
                // Haklar ve Mevzuat
                { id: "mock-parent-1", name: "Haklar ve Mevzuat", slug: "haklar-ve-mevzuat", description: "Engelli hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.", parent_id: null },
                { id: "mock-child-1-1", name: "Engelli Hakları ve Yasalar", slug: "engelli-haklari-ve-yasalar", description: "Engellilerin anayasal hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.", icon: "Scale", parent_id: "mock-parent-1" },
                { id: "mock-child-1-2", name: "Maaşlar, Ödenekler ve Sosyal Yardımlar", slug: "maaslar-odenekler-ve-sosyal-yardimlar", description: "2022 engelli maaşı, evde bakım aylığı, vakıf yardımları ve başvuru koşulları.", icon: "CreditCard", parent_id: "mock-parent-1" },
                { id: "mock-child-1-3", name: "Malulen Emeklilik ve Vergi İndirimi", slug: "malulen-emeklilik-ve-vergi-indirimi", description: "Vergi indirimi dereceleri, erken emeklilik şartları, maluliyet tespiti ve SGK işlemleri.", icon: "PiggyBank", parent_id: "mock-parent-1" },
                { id: "mock-child-1-4", name: "EKPSS (Sınav ve Atamalar)", slug: "ekpss-sinav-ve-atamalar", description: "Engelli Kamu Personeli Seçme Sınavı hazırlık, başvuru, tercih, kadrolar ve atama haberleri.", icon: "Award", parent_id: "mock-parent-1" },
                
                // Sağlık ve Medikal
                { id: "mock-parent-2", name: "Sağlık ve Medikal", slug: "saglik-ve-medikal", description: "Rapor alımı, tıbbi tedaviler, medikal cihazlar ve protez/ortez deneyimleri.", parent_id: null },
                { id: "mock-child-2-1", name: "Engelli Sağlık Raporu", slug: "engelli-saglik-raporu", description: "Sağlık kurulu raporu alma süreci, engelli oranları, itirazlar ve hastane deneyimleri.", icon: "FileText", parent_id: "mock-parent-2" },
                { id: "mock-child-2-2", name: "Medikal Cihazlar ve Protez/Ortez", slug: "medikal-cihazlar-ve-protez-ortez", description: "Tekerlekli sandalyeler, işitme cihazları, protezler, SGK ödemeleri ve marka deneyimleri.", icon: "HeartPulse", parent_id: "mock-parent-2" },
                { id: "mock-child-2-3", name: "Kronik Hastalıklar ve İlaç Paylaşımları", slug: "kronik-hastaliklar-ve-ilac-paylasimlari", description: "Kronik rahatsızlıklarla yaşam, tedavi protokolleri, ilaçlar ve yan etki paylaşımları.", icon: "Activity", parent_id: "mock-parent-2" },
                
                // Erişilebilirlik ve Teknoloji
                { id: "mock-parent-3", name: "Erişilebilirlik ve Teknoloji", slug: "erisilebilirlik-ve-teknoloji", description: "Ekran okuyucular, fiziksel mekan tasarımı ve akıllı yardımcı araçlar.", parent_id: null },
                { id: "mock-child-3-1", name: "Görme Engelliler Teknolojileri", slug: "gorme-engelliler-teknolojileri", description: "NVDA, Jaws, VoiceOver ekran okuyucular, kabartma cihazlar ve sesli kütüphaneler.", icon: "Eye", parent_id: "mock-parent-3" },
                { id: "mock-child-3-2", name: "İşitme ve Dil Çözümleri", slug: "isitme-ve-dil-cozumleri", description: "İşitme cihazı ayarları, koklear implant, işaret dili eğitimleri ve alt yazı araçları.", icon: "Volume2", parent_id: "mock-parent-3" },
                { id: "mock-child-3-3", name: "Fiziksel Mekan ve Ulaşım Erişilebilirliği", slug: "fiziksel-mekan-ve-ulasim-erisilebilirligi", description: "Tekerlekli sandalye dostu mekanlar, toplu taşıma, rampalar ve erişilebilirlik haritaları.", icon: "MapPin", parent_id: "mock-parent-3" },
                
                // Sosyal Yaşam ve Akran Desteği
                { id: "mock-parent-4", name: "Sosyal Yaşam ve Akran Desteği", slug: "sosyal-yasam-ve-akran-destegi", description: "Eğitim, kariyer, sosyal yardımlaşma ve farkındalık paylaşımları.", parent_id: null },
                { id: "mock-child-4-1", name: "Eğitim ve İstihdam", slug: "egitim-ve-istihdam", description: "Engelli öğrencilerin eğitim hakları, özel eğitim, iş ilanları ve çalışma hayatı zorlukları.", icon: "GraduationCap", parent_id: "mock-parent-4" },
                { id: "mock-child-4-2", name: "Buluşma ve Etkinlikler", slug: "bulusma-ve-etkinlikler", description: "Fiziksel veya çevrimiçi engelsiz buluşmalar, sanatsal ve sportif faaliyet duyuruları.", icon: "Calendar", parent_id: "mock-parent-4" },
                { id: "mock-child-4-3", name: "Ayrımcılık Bildirimi ve Hak İhlalleri", slug: "ayrimcilik-bildirimi-ve-hak-ihlalleri", description: "Günlük yaşamda karşılaşılan engelli ayrımcılığı, hak ihlalleri ve hukuki başvuru takibi.", icon: "AlertTriangle", parent_id: "mock-parent-4" }
              ];
            }

            if (activeCategories.length === 0) {
              return (
                <div className="text-center py-16 px-6 bg-card rounded-lg border border-dashed border-border">
                  <Users className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
                  <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight">Topluluk Bulunamadı</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">Aradığınız kriterlere uygun bir grup henüz yok. Kendi topluluğunuzu başlatmaya ne dersiniz?</p>
                </div>
              );
            }

            const parentSections = activeCategories.filter(c => !c.parent_id);
            const childrenByParent: { [id: string]: Community[] } = {};
            activeCategories.filter(c => c.parent_id).forEach(c => {
              const pid = c.parent_id!;
              if (!childrenByParent[pid]) childrenByParent[pid] = [];
              childrenByParent[pid].push(c);
            });

            if (searchQuery || parentSections.length === 0) {
              return (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeCategories.map((community, index) => (
                    <motion.div 
                      key={community.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <Link 
                        href={`/communities/${community.id}`}
                        className="vibe-card vibe-card-hover block p-6 h-full flex flex-col justify-between relative cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                              {getIcon(community.icon)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="vibe-label text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-0">TOPLULUK</p>
                              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors whitespace-normal break-words">
                                {community.name}
                              </h2>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {community.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            KEŞFET <ChevronRight size={16} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              );
            }

            return (
              <div className="space-y-16">
                {parentSections.map((section, secIndex) => {
                  const sectionChildren = childrenByParent[section.id] || [];
                  if (sectionChildren.length === 0) return null;

                  return (
                    <section 
                      key={section.id} 
                      aria-labelledby={`sec-title-${section.id}`}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4 border-b border-border/80 pb-4">
                        <div className="p-2.5 bg-primary/5 rounded-2xl text-primary">
                          {getIcon(section.icon || 'FolderTree')}
                        </div>
                        <div>
                          <h2 
                            id={`sec-title-${section.id}`}
                            className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase"
                          >
                            {section.name}
                          </h2>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{section.description}</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectionChildren.map((community, index) => (
                          <motion.div 
                            key={community.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 + secIndex * 0.05 }}
                            className="group"
                          >
                            <Link 
                              href={`/communities/${community.id}`}
                              className="vibe-card vibe-card-hover block p-6 h-full flex flex-col justify-between relative cursor-pointer"
                              aria-describedby={`desc-${community.id}`}
                            >
                              <div>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                                    {getIcon(community.icon)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="sr-only">{section.name} kategorisinde alt forum: </span>
                                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors whitespace-normal break-words leading-snug">
                                      {community.name}
                                    </h3>
                                  </div>
                                </div>
                                <p 
                                  id={`desc-${community.id}`}
                                  className="text-sm text-muted-foreground leading-relaxed line-clamp-3"
                                >
                                  {community.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                <span className="sr-only">{community.name} konusuna </span>
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                  TARTIŞMALARI GÖR <ChevronRight size={16} />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            );
          })()
        )}

        {/* Informational Section for GEO */}
        <section className="mt-16 prose prose-slate dark:prose-invert max-w-none bg-card p-6 md:p-10 rounded-lg border border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-tight text-foreground">Kolektif Bilginin Gücü: Neden Topluluk Grupları?</h2>
            
            <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
              <p>
                EngelsizForum toplulukları, sadece birer &quot;alt forum&quot; değil, aynı zamanda belirli ilgi alanlarına yönelik <strong>uzmanlık merkezleridir.</strong> Erişilebilir oyunlardan teknolojiye, hukuktan günlük yaşama kadar her grup, o alanın &quot;deneyimsel uzmanları&quot; tarafından yönetilir. Yapay zeka destekli altyapımız, bu gruplardaki verileri düzenli olarak tarayarak en güncel ve en yararlı bilgileri ön plana çıkarır.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-6 pt-2">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">Topluluk Odaklı Destek</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Resmi kurumların veya büyük şirketlerin bazen gözden kaçırdığı detaylar, topluluk üyelerimiz tarafından saniyeler içinde çözülür. Örneğin, bir uygulamadaki yeni bir erişilebilirlik hatası (bug), teknoloji topluluğumuzda anında raporlanır ve çözüm önerileri geliştirilir.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">Güven ve Yetkinlik (E-E-A-T)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Topluluk gruplarımızdaki içerikler, o konudaki yetkinliğini kanıtlamış üyeler tarafından denetlenir. Yapay zeka sistemimiz, paylaşılan bilgilerin <strong>E-E-A-T</strong> (Deneyim, Uzmanlık, Yetkinlik, Güvenilirlik) standartlarına uygunluğunu analiz ederek, aramada en güvenilir yanıtları sunar.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-background rounded border border-border">
                <h3 className="text-base font-bold mb-4 text-foreground">Bir Topluluk Nasıl Başlatılır?</h3>
                <p className="mb-4">
                  Sizin de tutkulu olduğunuz bir konu mu var? Kendi topluluğunuzu başlatmak için yukarıdaki &quot;Topluluk Oluştur&quot; butonunu kullanabilirsiniz. Başarılı bir topluluk için önerilerimiz:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 ml-0 text-xs md:text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5" aria-hidden="true">📌</span>
                    <div>
                      <strong>Net Bir Odak:</strong> Grubun ismini ve amacını spesifik tutun.
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5" aria-hidden="true">📌</span>
                    <div>
                      <strong>Kapsayıcı Dil:</strong> Herkesin kendini rahat hissedeceği bir açıklama yazın.
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5" aria-hidden="true">📌</span>
                    <div>
                      <strong>Düzenli Etkileşim:</strong> Üyelerle düzenli olarak sorular ve tartışmalar paylaşın.
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5" aria-hidden="true">📌</span>
                    <div>
                      <strong>AI Özetleri:</strong> Uzun tartışmaların AI tarafından özetlenmesini takip ederek üyelerinize zaman kazandırın.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="text-center pt-6">
                <Link 
                  href="/discussions" 
                  className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded font-bold hover:brightness-110 active:scale-[0.98] transition-all text-sm min-h-[44px] items-center justify-center"
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
