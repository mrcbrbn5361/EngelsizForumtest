'use client';

import React from 'react';
import Link from 'next/link';
import { Home, MessageSquare, Users, Info, LogIn, User, Search } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md high-contrast:bg-background high-contrast:opacity-100" role="navigation" aria-label="Ana Navigasyon">
      <div className="container mx-auto flex min-h-16 items-center justify-between px-4 py-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="EngelsizForum Ana Sayfa"
        >
          <span className="bg-primary px-2 py-1 text-primary-foreground rounded-md">EF</span>
          <span className="hidden sm:inline">EngelsizForum</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          <NavLink href="/discussions" icon={<MessageSquare size={18} />} label="Tartışmalar" />
          <NavLink href="/communities" icon={<Users size={18} />} label="Topluluklar" />
          <NavLink href="/about" icon={<Info size={18} />} label="Hakkımızda" />
          
          <Link
            href="/search"
            className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
            aria-label="Arama"
          >
            <Search size={20} />
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="ml-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:bg-muted focus:ring-2 focus:ring-primary"
            >
              <User size={16} />
              <span className="hidden md:inline">Profil</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="ml-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <LogIn size={16} />
              <span className="hidden md:inline">Giriş Yap</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus:ring-2 focus:ring-primary"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
