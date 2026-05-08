'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
        <motion.section 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }}
  className="container mx-auto px-4 py-32 text-center relative overflow-hidden"
>
  <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -z-10 blur-3xl opacity-50" />
  <motion.h1 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-foreground max-w-4xl mx-auto"
  >
    Engelleri <span className="text-primary tracking-tighter">Birlikte</span> Aşalım
  </motion.h1>
  <p className="mx-auto max-w-xl text-lg md:text-xl text-muted-foreground mb-12 font-medium leading-relaxed">
    AI destekli, tam erişilebilir forum platformu.
  </p>
  <Link
    href="/auth"
    className="vibe-button-primary scale-110"
  >
    Hemen Başla
  </Link>
</motion.section>
      </main>
    </DashboardLayout>
  );
}
