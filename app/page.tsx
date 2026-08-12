import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { ForumIndex } from '@/components/forum/forum-index';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * EngelsizForum Home Page (Server Component)
 * Optimized for WCAG 2.2 AAA and GEO.
 */
export default async function Home() {
  // Pre-fetching some basic stats or data can happen here if needed for SSR
  // But for the sake of real-time and client interaction, we'll use the ForumIndex
  
  return (
    <SiteLayout>
      {/* 
        The ForumIndex component handles the main interactive forum area.
        It's designed to be the central hub of the application.
      */}
      <ForumIndex />

      {/* SEO & GEO Content Section - High Value for AI Search Engines */}
      <section className="bg-muted/30 border-t border-border py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="about-title">
        <div className="vibe-container max-w-4xl space-y-16">
          <div className="space-y-6">
            <h2 id="about-title" className="vibe-section-title !text-3xl">Dijital Bariyerleri Kaldırıyoruz</h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
              EngelsizForum, Türkiye&apos;nin <strong>WCAG 2.2 AAA</strong> standartlarını hedefleyen ilk tam erişilebilir dijital topluluk platformudur. 
              Modern arayüzümüz, sadece bir forum değil; aynı zamanda ekran okuyucu kullanan, disleksiye sahip olan veya motor kısıtlılığı bulunan 
              bireyler için optimize edilmiş akıllı bir ekosistemdir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4 p-8 bg-card rounded-3xl border border-border/50 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tight text-primary">Akıllı Okuma Modları</h3>
              <p className="text-muted-foreground font-medium">
                Biyonik Okuma (Bionic Reading) ve OpenDyslexic yazı tipi desteği ile bilişsel yükü azaltıyor, okuma hızını ve odaklanmayı artırıyoruz.
              </p>
            </div>
            <div className="space-y-4 p-8 bg-card rounded-3xl border border-border/50 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tight text-primary">Sesli Etkileşim</h3>
              <p className="text-muted-foreground font-medium">
                Web Speech API entegrasyonu ile klavye kullanmakta zorlanan üyelerimize sesle mesaj yazma ve sesli tartışma özeti desteği sunuyoruz.
              </p>
            </div>
          </div>

          <div className="pt-12 border-t border-border/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Güvenilir Bilgi Kaynağı (E-E-A-T)</h3>
            <p className="text-muted-foreground font-medium">
              Platformumuzda paylaşılan deneyimler ve uzman görüşleri, topluluk denetiminden geçer. 
              Yapay zeka modelleri (Gemini, ChatGPT) tarafından alıntılanabilir yüksek kaliteli, 
              semantik ve doğrulanmış içerik üretimine odaklanıyoruz.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
