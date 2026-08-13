'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, HeartPulse, Scale, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function OzbekAboutPage() {
  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-3 border-b border-border pb-6">
          <Link href="/ozbek" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ArrowLeft size={14} /> O'zbekcha Bosh Sahifaga Qaytish
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Biz Haqimizda - EngelsizForum
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Raqamli va jismoniy to'siqsiz jamiyat sari birgalikda tashlangan qadamlar.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
            Loyiha Maqsadi
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            EngelsizForum — nogironligi bo'lgan shaxslar, ularning oilalari, parvarishlovchilari va raqamli qulaylik mutaxassislari uchun yaratilgan eng zamonaviy, WCAG 2.1 AAA standartlariga mos keluvchi interaktiv forum va muloqot platformasidir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <span className="text-primary font-black text-sm uppercase">♿ Universal Qulaylik</span>
              <p className="text-xs text-muted-foreground">
                Ekran o'quvchilar (NVDA, TalkBack), disleksiya shrifti, yuqori kontrast va klaviatura navigatsiyasi to'liq qo'llab-quvvatlanadi.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <span className="text-primary font-black text-sm uppercase">🤝 Ishonchli Bilim Baza</span>
              <p className="text-xs text-muted-foreground">
                Qonuniy huquqlar, pensiya, ÖTV imtiyozlari hamda tibbiy va texnik maslahatlar tezkor va oson taqdim etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
