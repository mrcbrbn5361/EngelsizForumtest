'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { MessageCircle, ShieldCheck, Zap, ArrowRight, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/discussions';
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      
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
            className="vibe-button-primary px-12 py-4 text-lg"
          >
            Hemen Başla
          </Link>
        </section>
      </main>

      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}
