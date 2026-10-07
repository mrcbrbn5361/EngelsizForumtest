'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  Car, 
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp,
  FileText,
  Accessibility,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import TeknofestNotice from '@/components/forum/teknofest-notice';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { ModernNodeCard } from '@/components/forum/modern-node-card';
import { Button } from '@/components/ui/button';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HomePage() {
  const [filterQuery, setFilterQuery] = useState('');
  const [categoryStats, setCategoryStats] = useState<Record<string, { topicCount: number; messageCount: number; lastPost?: { title: string; author: string; date: string } }>>({});

  useEffect(() => {
    async function fetchLiveCategoryStats() {
      if (!isSupabaseConfigured) return;
      try {
        const [catRes, topRes] = await Promise.all([
          supabase.from('categories').select('id, slug, name'),
          supabase.from('topics').select(`
            id, title, category_id, comments_count, created_at,
            category:categories(id, slug),
            author:profiles(username)
          `).order('created_at', { ascending: false })
        ]);

        if (catRes.data && topRes.data) {
          const statsMap: Record<string, { topicCount: number; messageCount: number; lastPost?: { title: string; author: string; date: string } }> = {};

          for (const cat of catRes.data) {
            const catTopics = topRes.data.filter((t: any) => {
              const catObj = Array.isArray(t.category) ? t.category[0] : t.category;
              return t.category_id === cat.id || catObj?.slug === cat.slug;
            });
            const totalTopics = catTopics.length;
            const totalComments = catTopics.reduce((acc: number, t: any) => acc + (t.comments_count || 0), 0);
            const latestTopic: any = catTopics[0];
            const authorObj = Array.isArray(latestTopic?.author) ? latestTopic.author[0] : latestTopic?.author;

            statsMap[cat.slug] = {
              topicCount: totalTopics,
              messageCount: totalTopics + totalComments,
              lastPost: latestTopic ? {
                title: latestTopic.title,
                author: authorObj?.username || 'Topluluk',
                date: formatDistanceToNow(new Date(latestTopic.created_at), { addSuffix: true, locale: tr })
              } : undefined
            };
          }

          setCategoryStats(statsMap);
        }
      } catch (err) {
        console.error('Error fetching live category stats:', err);
      }
    }

    fetchLiveCategoryStats();
  }, []);

  // Structured High-Value Forum Categories with Semantic Color Differentiation
  const forumSections = [
    {
      title: 'HAKLAR, MEVZUAT VE RESMİ RAPORLAR',
      description: 'Engelli hakları, Balthazard cetveli, ÖTV araç alım şartları ve erken emeklilik mevzuatları.',
      accentColor: 'sky' as const,
      nodes: [
        {
          id: 'mevzuat-ve-haklar',
          title: 'Balthazard ve Sağlık Kurulu Raporları',
          description: 'Özür oranı cetveli, birden fazla engelin Balthazard formülü ile birleştirilmesi ve rapor itiraz süreçleri.',
          badge: 'Mevzuat Rehberi',
          accentColor: 'sky' as const,
          defaultLastPost: {
            title: '2026-2027 Balthazard Hesaplama ve Rapor Rehberi',
            author: 'BoraMevzuat',
            date: 'Bugün'
          }
        },
        {
          id: 'otv-muafiyeti-ve-araclar',
          title: 'ÖTV Muafiyeti ve Özel Tertibatlı Araçlar',
          description: '2026-2027 yılı 2.247.100 TL ÖTV muafiyetli araç alım limiti, tertibat kodları, noter devir ve MTV muafiyeti.',
          badge: 'ÖTV 2.24M ₺',
          accentColor: 'emerald' as const,
          defaultLastPost: {
            title: '2026 ÖTV Üst Limiti ve Bayi Uygulamaları',
            author: 'EngelsizSurucu',
            date: 'Bugün'
          }
        },
        {
          id: 'erken-emeklilik-ve-sgk',
          title: 'Engelli Erken Emeklilik ve SGK Hakları',
          description: 'Yaş haddi aranmaksızın kademeli erken emeklilik, prim günü ve sigortalılık süresi hesaplamaları.',
          badge: 'Yaş Şartsız',
          accentColor: 'amber' as const,
          defaultLastPost: {
            title: '4A / 4B / 4C Kademeli Emeklilik Tablosu',
            author: 'AriaA11y',
            date: 'Dün'
          }
        },
        {
          id: 'kamu-istihdam-ekpss',
          title: 'E-KPSS, Vergi İndirimi ve Kamuda İstihdam',
          description: 'E-KPSS atamaları, kura usulü yerleştirme, 1./2./3. derece gelir vergisi indirimi başvuruları.',
          badge: 'İstihdam',
          accentColor: 'indigo' as const,
          defaultLastPost: {
            title: '2026 E-KPSS Tercih Kılavuzu Duyurusu',
            author: 'FelixDev',
            date: 'Dün'
          }
        }
      ]
    },
    {
      title: 'SAĞLIK, REHABİLİTASYON VE MEDİKAL TEKNOLOJİLER',
      description: 'SGK SUT geri ödemeleri, protez/ortez destekleri ve erişilebilir tıbbi çözümler.',
      accentColor: 'emerald' as const,
      nodes: [
        {
          id: 'ortez-protez-ve-cihazlar',
          title: 'Ortez, Protez ve Yardımcı Ekipmanlar',
          description: 'SGK SUT geri ödeme kapsamındaki akülü/manuel tekerlekli sandalyeler, biyonik protezler ve medikal cihazlar.',
          badge: 'SUT Kapsamı',
          accentColor: 'emerald' as const,
          defaultLastPost: {
            title: 'SGK 2026 Akülü Tekerlekli Sandalye Ödeme Tutarları',
            author: 'MedikalDestek',
            date: 'Bu hafta'
          }
        },
        {
          id: 'fizik-tedavi-ve-rehabilitasyon',
          title: 'Fizik Tedavi ve Rehabilitasyon Merkezleri',
          description: 'Özel eğitim ve rehabilitasyon merkezleri (RAM), hidroterapi, robotik yürüme tedavileri ve tecrübeler.',
          badge: 'Rehberlik',
          accentColor: 'teal' as const,
          defaultLastPost: {
            title: 'Robotik Rehabilitasyon Deneyimleri ve Faydaları',
            author: 'FizyoterapistAli',
            date: 'Bu hafta'
          }
        }
      ]
    },
    {
      title: 'ERİŞİLEBİLİR YAŞAM, MİMARİ VE TEKNOLOJİ',
      description: 'Ekran okuyucular, mimari rampalar, dijital erişilebilirlik ve TEKNOFEST projeleri.',
      accentColor: 'teal' as const,
      nodes: [
        {
          id: 'teknofest-projeleri-ve-arge',
          title: 'TEKNOFEST Engelsiz Yaşam Projeleri & AR-GE',
          description: 'Gençlerin geliştirdiği yapay zeka destekli görme sistemleri, işaret dili çeviricileri ve haptik sensörler.',
          badge: 'TEKNOFEST 2027',
          accentColor: 'teal' as const,
          defaultLastPost: {
            title: 'TEKNOFEST 2027 Engelsiz Yaşam Kategorisi Fikir Havuzu',
            author: 'MiracBirben',
            date: 'Bugün'
          }
        },
        {
          id: 'dijital-erisim-ve-yazilim',
          title: 'Ekran Okuyucular ve Dijital Erişilebilirlik',
          description: 'NVDA, JAWS, VoiceOver, TalkBack kullanımı; web sitelerinde WCAG erişilebilirlik standartları.',
          badge: 'WCAG AAA',
          accentColor: 'indigo' as const,
          defaultLastPost: {
            title: 'NVDA 2026 Türkçe Eklentileri ve Ayar Rehberi',
            author: 'AriaA11y',
            date: 'Bu hafta'
          }
        }
      ]
    }
  ];

  // Filter based on search input
  const filteredSections = forumSections.map(section => ({
    ...section,
    nodes: section.nodes.filter(node => 
      node.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(filterQuery.toLowerCase())
    )
  })).filter(section => section.nodes.length > 0);

  return (
    <div className="w-full space-y-6">
      
      {/* TEKNOFEST Showcase Banner */}
      <TeknofestNotice />

      {/* Hero Welcome with Color Differentiation & Action Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-black uppercase tracking-wider">
              <Accessibility size={15} />
              <span>Türkiye'nin İlk Tam Erişilebilir Forumu</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Haklarını Öğren, Deneyimini Paylaş, Çözüm Üret.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              EngelsizForum; engelli bireyler, aileleri, avukatlar ve mühendisleri bir araya getiren bağımsız, reklamsız ve WCAG 2.1 AAA standartlarında bir dayanışma platformudur.
            </p>
          </div>

          {/* Quick Action Buttons with clear semantic contrast */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Link href="/hesaplama">
              <Button variant="info" size="default" className="gap-2">
                <Calculator size={16} />
                <span>Hesaplama Robotları</span>
              </Button>
            </Link>
            <Link href="/new-thread">
              <Button variant="primary" size="default" className="gap-2">
                <MessageSquare size={16} />
                <span>Yeni Konu Aç</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Forum Grid: Left Forum Nodes, Right Modern Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Category Blocks */}
        <section className="lg:col-span-8 space-y-8" aria-label="Forum Kategorileri">
          
          {/* Quick Category Filter Input */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1 relative">
              <Search size={16} className="text-slate-400 absolute left-3" />
              <input 
                type="text" 
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Kategorilerde filtrele (örn: ÖTV, Balthazard, SGK, RAM)..."
                aria-label="Kategorileri filtrele"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 font-semibold"
              />
            </div>
            {filterQuery && (
              <button 
                onClick={() => setFilterQuery('')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Temizle
              </button>
            )}
          </div>

          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              {/* Distinct Section Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${
                    section.accentColor === 'sky' 
                      ? 'bg-sky-600' 
                      : section.accentColor === 'emerald' 
                        ? 'bg-emerald-600' 
                        : 'bg-teal-600'
                  }`} />
                  <h2 className="text-sm font-black text-slate-950 dark:text-white tracking-wide uppercase">
                    {section.title}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {section.nodes.length} Kategori
                </span>
              </div>

              {/* Node Cards */}
              <div className="space-y-3">
                {section.nodes.map((node) => {
                  const live = categoryStats[node.id];
                  const liveTopicCount = live?.topicCount !== undefined ? String(live.topicCount) : '1';
                  const liveMessageCount = live?.messageCount !== undefined ? String(live.messageCount) : '13';
                  const liveLastPost = live?.lastPost || node.defaultLastPost;

                  return (
                    <ModernNodeCard
                      key={node.id}
                      id={node.id}
                      title={node.title}
                      description={node.description}
                      threadCount={liveTopicCount}
                      messageCount={liveMessageCount}
                      badge={node.badge}
                      accentColor={node.accentColor}
                      lastPost={liveLastPost}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                "{filterQuery}" aramasıyla eşleşen kategori bulunamadı.
              </p>
              <button 
                onClick={() => setFilterQuery('')}
                className="mt-3 text-xs font-black text-sky-700 underline cursor-pointer"
              >
                Tüm kategorileri göster
              </button>
            </div>
          )}
        </section>

        {/* Right Column: High-Value Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>

      </div>
    </div>
  );
}
