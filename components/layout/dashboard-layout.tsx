'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Home, MessageSquare, Users, Info, Settings, User, AlertCircle, HelpCircle, Star, Sparkles, Database } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="flex flex-1 container mx-auto gap-6 px-4">
        <aside className="hidden md:flex w-64 border-r border-border p-6 flex-col gap-8">
            <nav className="flex flex-col gap-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold bg-muted text-foreground mb-6">
                    <Home size={18} /> Ana Sayfa
                </Link>
                
                <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-4 mb-2">Kategoriler</h4>
                <Link href="/discussions" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MessageSquare size={18} /> Tartışmalar
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Users size={18} /> Topluluklar
                </Link>
                <Link href="/about" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Info size={18} /> Hakkımızda
                </Link>
            </nav>

            <nav className="flex flex-col gap-1">
              <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-4 mb-2">Engeller</h4>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <AlertCircle size={18} /> Görme
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Database size={18} /> İşitme
                </Link>
            </nav>

            {user && (
                <nav className="flex flex-col gap-1 mt-auto">
                    <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-4 mb-2">Kişisel</h4>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground">
                        <User size={18} /> Profil
                    </Link>
                </nav>
            )}
        </aside>
        <main className="flex-1 py-6">
          {children}
        </main>
      </div>
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}
