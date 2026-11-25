'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, MessageSquare, FolderTree, ShieldCheck, Home, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isUserAdmin = user?.email === 'miracbirben@gmail.com' || profile?.role === 'admin';

  useEffect(() => {
    if (!loading && !isUserAdmin) {
      router.replace('/');
    }
  }, [loading, isUserAdmin, router]);

  const NAV_ITEMS = [
    { label: 'Panel Ana Sayfası', href: '/admin', icon: LayoutDashboard },
    { label: 'Kullanıcı Yönetimi', href: '/admin/users', icon: Users },
    { label: 'İçerik Moderasyonu', href: '/admin/content', icon: MessageSquare },
    { label: 'Kategori Yönetimi', href: '/admin/categories', icon: FolderTree },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isUserAdmin) {
    return null; // Silent redirect via useEffect
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-surface-raised border-b border-line p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-fg font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={18} className="text-indigo-400 light:text-indigo-700" />
            <span>ACP Konsolu</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] text-fg-4 hover:text-fg font-bold"
          >
            <ArrowLeft size={14} /> Siteye Dön
          </Link>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0",
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "text-fg-4 bg-surface-hover border-line"
                )}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 flex-col bg-surface-raised border-r border-line sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-line bg-surface-hover/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-600 text-white shadow-lg shadow-indigo-950/20">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-sm font-bold text-fg uppercase tracking-[0.2em]">ACP Konsolu</h2>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold transition-all group min-h-[44px]",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
                    : "text-fg-4 hover:text-fg hover:bg-surface-hover"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-fg" : "text-fg-5 group-hover:text-indigo-400 light:group-hover:text-indigo-700")} />
                <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-[10px] font-bold text-fg-4 hover:text-fg hover:bg-surface-hover uppercase tracking-widest transition-all min-h-[44px]"
          >
            <ArrowLeft size={16} />
            <span>Siteye Geri Dön</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
