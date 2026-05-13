'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import dynamic from 'next/dynamic';
const AccessibilityToolbar = dynamic(() => import('@/components/ui/accessibility-toolbar').then(mod => mod.AccessibilityToolbar), { ssr: false });
import { Home, MessageSquare, Users, Info, Settings, User, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

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
          "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all mb-1",
          isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon size={18} /> {label}
      </Link>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <aside role="complementary" aria-label="Yan Menü" className="hidden lg:flex w-[280px] p-6 flex-col gap-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-muted/5 border-r border-border shrink-0">
            <nav className="flex flex-col gap-2" aria-label="Ana Gezinti">
                <NavItem href="/" icon={Home} label="Ana Sayfa" />
                <NavItem href="/discussions" icon={MessageSquare} label="Tartışmalar" />
                <NavItem href="/communities" icon={Users} label="Topluluklar" />
                <NavItem href="/about" icon={Info} label="Hakkımızda" />
            </nav>

            <div className="border-t border-border"></div>

            <nav className="flex flex-col gap-2" aria-label="Kategori Gezintisi">
              <h4 className="text-[10px] uppercase font-black text-primary tracking-widest ml-4 mb-2">Engeller</h4>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label="Görme engelliler topluluğu">
                    <AlertCircle size={18} /> Görme
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label="İşitme engelliler topluluğu">
                    <Database size={18} /> İşitme
                </Link>
            </nav>

            {user && (
                <nav className="flex flex-col gap-2 mt-auto" aria-label="Hesap Gezintisi">
                    <h4 className="text-[10px] uppercase font-black text-primary tracking-widest ml-4 mb-2">Hesap</h4>
                    <NavItem href="/profile" icon={User} label="Profil" />
                </nav>
            )}
        </aside>
        <div className="flex-1 p-4 md:p-6 lg:p-10 bg-background min-w-0 w-full overflow-x-hidden">
          {children}
        </div>
      </div>
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}

