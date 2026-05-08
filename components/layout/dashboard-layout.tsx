'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Home, MessageSquare, Users, Info, Settings, User, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <aside className="hidden lg:flex w-[280px] p-6 flex-col gap-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-muted/5 border-r border-border shrink-0">
            <nav className="flex flex-col gap-1">
                <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-foreground hover:bg-muted mb-2">
                    <Home size={18} /> Ana Sayfa
                </Link>
                <Link href="/discussions" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    <MessageSquare size={18} /> Tartışmalar
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Users size={18} /> Topluluklar
                </Link>
                <Link href="/about" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Info size={18} /> Hakkımızda
                </Link>
            </nav>

            <div className="border-t border-border"></div>

            <nav className="flex flex-col gap-1">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-4 mb-2">Engeller</h4>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    <AlertCircle size={18} /> Görme
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Database size={18} /> İşitme
                </Link>
            </nav>

            {user && (
                <nav className="flex flex-col gap-1 mt-auto">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-4 mb-2">Hesap</h4>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                        <User size={18} /> Profil
                    </Link>
                </nav>
            )}
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:p-10 bg-background min-w-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}

