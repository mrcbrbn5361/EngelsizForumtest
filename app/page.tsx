'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MessageCircle, ShieldCheck, Zap, ArrowRight, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function Home() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <DashboardLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Engelleri <span className="text-primary">Birlikte</span> Aşalım
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-12">
            AI destekli, tam erişilebilir forum platformu.
          </p>
          <Link
            href="/auth"
            className="px-12 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 transition-all"
          >
            Hemen Başla
          </Link>
        </section>
      </main>
    </DashboardLayout>
  );
}
