import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
            <FileQuestion size={120} className="text-primary relative z-10" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-8xl md:text-9xl font-black vibe-heading">404</h1>
            <p className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Bu sayfa engellerimize takıldı!</p>
            <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              Gitmek istediğiniz sayfa silinmiş, taşınmış veya henüz inşa edilmemiş olabilir. Panik yapmayın, birlikte aşarız.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link 
              href="/"
              className="vibe-button-primary flex items-center gap-3"
            >
              <Home size={24} /> Ana Sayfa
            </Link>
            <Link 
              href="/discussions"
              className="vibe-card !p-5 !rounded-full flex items-center gap-3 font-black uppercase tracking-widest text-sm"
            >
              <ArrowLeft size={20} /> Tartışmalara Dön
            </Link>
          </div>
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
