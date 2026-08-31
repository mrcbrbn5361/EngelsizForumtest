'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Info, 
  User, 
  AlertCircle, 
  Database,
  Calculator,
  Compass,
  Zap,
  Bookmark,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SidebarCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  topics_count?: number;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [sidebarCategories, setSidebarCategories] = useState<SidebarCategory[]>([
    { id: '1', name: 'Görme Engelliler', slug: 'gorme-engelliler' },
    { id: '2', name: 'İşitme Engelliler', slug: 'isitme-engelliler' },
    { id: '3', name: 'Bedensel Engelliler', slug: 'bedensel-engelliler' },
    { id: '4', name: 'Mevzuat & Haklar', slug: 'mevzuat-haklar' },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchSidebarCats = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, icon')
          .order('sort_order', { ascending: true })
          .limit(6);
        
        if (!error && data && data.length > 0 && isMounted) {
          setSidebarCategories(data);
        }
      } catch (err) {
        console.error('Error fetching sidebar categories:', err);
      }
    };
    fetchSidebarCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) => {
    const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
    return (
      <Link 
        href={href} 
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
          isActive 
            ? "bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 shadow-xs" 
            : "text-slate-300 hover:bg-[#161f33] hover:text-white border border-transparent"
        )}
      >
        <Icon size={16} className={isActive ? "text-sky-400" : "text-slate-400"} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };
  
  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Skip to Main Content Link for WCAG AAA */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-sky-500 text-slate-950 font-bold rounded-lg shadow-lg"
      >
        İçeriğe Atla
      </a>

      <div className="flex flex-1 w-full gap-6">
        {/* Accessible Left Sidebar (Desktop) */}
        <aside 
          role="complementary" 
          aria-label="Sol Gezinti Menüsü" 
          className="hidden lg:flex w-64 p-4 flex-col gap-6 sticky top-[80px] h-[calc(100vh-8rem)] overflow-y-auto bg-[#111726]/80 border border-white/[0.08] rounded-sm backdrop-blur-md shrink-0 shadow-lg"
        >
          {/* Main Links */}
          <nav className="flex flex-col gap-1" aria-label="Ana Menü">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Platform Gezintisi
            </p>
            <NavItem href="/" icon={Home} label="Ana Sayfa" />
            <NavItem href="/discussions" icon={MessageSquare} label="Tartışmalar" />
            <NavItem href="/communities" icon={Users} label="Topluluklar" />
            <NavItem href="/hesaplama" icon={Calculator} label="Hesaplayıcılar" />
            <NavItem href="/about" icon={Info} label="Hakkımızda" />
          </nav>

          <div className="border-t border-white/[0.08]" />

          {/* Communities / Categories */}
          <nav className="flex flex-col gap-1" aria-label="Popüler Topluluklar">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span>Topluluklar</span>
              <Link href="/communities" className="text-sky-400 hover:underline normal-case text-[11px] font-normal">Tümü</Link>
            </p>
            {sidebarCategories.map((cat) => {
              const catHref = `/communities/${cat.slug || cat.id}`;
              const isCatActive = pathname === catHref;
              return (
                <Link 
                  key={cat.id || cat.slug}
                  href={catHref} 
                  aria-current={isCatActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors outline-none",
                    isCatActive
                      ? "bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20"
                      : "text-slate-300 hover:bg-[#161f33] hover:text-white border border-transparent"
                  )}
                  aria-label={`${cat.name} topluluğu`}
                >
                  <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Account / Navigation */}
          {user && (
            <div className="mt-auto pt-4 border-t border-white/[0.08]">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Hesabım
              </p>
              <NavItem href="/profile" icon={User} label="Profilim & Ayarlar" />
            </div>
          )}
        </aside>

        {/* Main Content Landmark */}
        <main 
          id="main-content" 
          tabIndex={-1} 
          className="flex-1 min-w-0 overflow-x-hidden outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}


