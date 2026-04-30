'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, MessageSquare, Users, Info, LogIn, User, Search } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * Accessible Navbar for EngelsizForum.
 */
export function Navbar() {
  const { user, loading } = useAuth();

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

        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center gap-1 lg:gap-4">
            <NavLink href="/discussions" icon={<MessageSquare size={18} />} label="Tartışmalar" />
            <NavLink href="/communities" icon={<Users size={18} />} label="Topluluklar" />
            <NavLink href="/about" icon={<Info size={18} />} label="Hakkımızda" />
          </div>
          
          <Link
            href="/search"
            className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all outline-none focus:ring-2 focus:ring-primary"
            aria-label="Arama"
          >
            <Search size={22} strokeWidth={2.5} />
          </Link>

          {!loading && (
            user ? (
              <Link
                href="/profile"
                className="ml-1 sm:ml-2 flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 p-1 sm:px-4 sm:py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary shadow-sm group shrink-0"
                aria-label="Profil Ayarları"
              >
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-primary/20 group-hover:border-white">
                    <Image 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt="" 
                      fill
                      unoptimized
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                    <User size={18} />
                  </div>
                )}
                <span className="hidden md:inline">Profil Ayarları</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="ml-1 sm:ml-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Giriş Yap</span>
              </Link>
            )
          )}
          
          {loading && (
            <div className="h-10 w-10 animate-pulse bg-muted rounded-full ml-2 border-2 border-muted"></div>
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
