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
    const isActive = href === '/' ? pathname === '/' : pathname === href || (pathname ? pathname.startsWith(href + '/') : false);
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

      <div className="flex flex-1 w-full">
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


