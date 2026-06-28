'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import dynamic from 'next/dynamic';
import { Home, MessageSquare, Users, Info, Settings, User, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

const AccessibilityToolbar = dynamic(() => import('@/components/ui/accessibility-toolbar').then((mod) => mod.AccessibilityToolbar), { ssr: false });

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          "flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mb-2",
          isActive 
            ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
        )}
      >
        <Icon size={20} /> {label}
      </Link>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">
        <aside role="complementary" aria-label="Yan Menü" className="hidden lg:flex w-[320px] p-10 flex-col gap-12 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto bg-muted/5 border-r-2 border-border/50 shrink-0">
            <nav className="flex flex-col gap-2" aria-label="Ana Gezinti">
                <NavItem href="/" icon={Home} label="ANA SAYFA" />
                <NavItem href="/discussions" icon={MessageSquare} label="TARTIŞMALAR" />
                <NavItem href="/communities" icon={Users} label="TOPLULUKLAR" />
                <NavItem href="/about" icon={Info} label="HAKKIMIZDA" />
            </nav>

            <div className="border-t-2 border-border/50"></div>

            <nav className="flex flex-col gap-2" aria-label="Kategori Gezintisi">
              <h4 className="vibe-label ml-4 mb-4">TOPLULUKLAR</h4>
                <Link href="/communities" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all" aria-label="Görme engelliler topluluğu">
                    <AlertCircle size={20} className="text-primary" /> GÖRME
                </Link>
                <Link href="/communities" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all" aria-label="İşitme engelliler topluluğu">
                    <Database size={20} className="text-primary" /> İŞİTME
                </Link>
            </nav>

            {user && (
                <nav className="flex flex-col gap-2 mt-auto" aria-label="Hesap Gezintisi">
                    <h4 className="vibe-label ml-4 mb-4">HESAP</h4>
                    <NavItem href="/profile" icon={User} label="PROFİL" />
                </nav>
            )}
        </aside>
        <div className="flex-1 px-0 py-6 sm:p-6 md:p-12 lg:p-16 bg-background min-w-0 w-full overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}

