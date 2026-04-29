'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
            <FileQuestion size={120} className="text-primary relative z-10 animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black">404</h1>
            <p className="text-2xl font-bold text-muted-foreground">Aradığınız sayfa engellerimize takıldı!</p>
            <p className="max-w-md mx-auto text-muted-foreground">
              Gitmek istediğiniz sayfa silinmiş, taşınmış veya henüz inşa edilmemiş olabilir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all"
            >
              <Home size={20} /> Ana Sayfaya Dön
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-full font-bold hover:bg-muted transition-all"
            >
              <ArrowLeft size={20} /> Geri Git
            </button>
          </div>
        </motion.div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
