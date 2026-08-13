'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ArrowLeft, Shield, Globe, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/lib/supabase';

export default function OzbekCommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunities() {
      try {
        const { data } = await supabase
          .from('communities')
          .select('*')
          .order('members_count', { ascending: false });

        if (data && data.length > 0) {
          setCommunities(data);
        } else {
          // Default fallback Uzbek communities
          setCommunities([
            {
              id: '1',
              name: "Eshittirish va Ko'rish Qulayliklari Jamiyati",
              description: "Ekran o'quvchilar, NVDA, VoiceOver va raqamli qulaylik dasturlari bo'yicha muloqot guruhi.",
              members_count: 48,
              topics_count: 12
            },
            {
              id: '2',
              name: "Nogironlik Huquqlari va Qonunchilik",
              description: "Yuridik imtiyozlar, pensiya va davlat yordam pullari bo'yicha doimiy maslahat guruhi.",
              members_count: 62,
              topics_count: 19
            },
            {
              id: '3',
              name: "EKPSS va Karyera Markazi",
              description: "Davlat xizmatlarida ishlash, imtihonlarga tayyorgarlik va masofaviy mehnat imkoniyatlari.",
              members_count: 35,
              topics_count: 9
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching communities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunities();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <Link href="/ozbek" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-2">
            <ArrowLeft size={14} /> O'zbekcha Bosh Sahifaga Qaytish
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Jamiyatlar va Guruhlar
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            O'zingizga mos bo'lgan qiziqish va qulaylik guruhlariga qo'shiling.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-bold text-sm">
            Yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-3xl p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground">👥 {c.members_count} A'zolar</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.description}
                </p>

                <button className="w-full py-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-xs uppercase transition-all">
                  Guruhga Qo'shilish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
