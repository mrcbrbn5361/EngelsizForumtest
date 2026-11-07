'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X,
  Home,
  MessageSquare,
  Calculator,
  Percent,
  Car,
  Calendar,
  Receipt,
  HeartHandshake,
  Users,
  ShieldCheck,
  Shield,
  HelpCircle,
  Info,
  SlidersHorizontal,
  LogIn,
  LogOut,
  User,
  Plus,
  BookOpen,
  Activity,
  Award,
  ExternalLink,
  Mail,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

interface UniversalDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalDrawerMenu({ isOpen, onClose }: UniversalDrawerMenuProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const role = (profile?.role || (user?.email === 'miracbirben@gmail.com' ? 'admin' : 'guest')) as string;
  const isAdmin = role === 'admin' || user?.email === 'miracbirben@gmail.com';
  const isMod = role === 'moderator' || isAdmin;
  const isExpert = role === 'uzman' || isMod;
  const isLoggedIn = !!user;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Tüm Sayfalar ve Yetki Menüsü">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div 
        ref={drawerRef}
        className="fixed inset-y-0 right-0 max-w-full w-full sm:w-[420px] bg-[#0B1220] border-l border-[#1E293B] shadow-2xl flex flex-col z-50 text-slate-100"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1E293B] bg-[#111B2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
              EF
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-heading">
                Navigasyon &amp; Yetki Menüsü
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Rol: <span className="text-indigo-400 font-semibold uppercase">{isLoggedIn ? role : 'Ziyaretçi'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#18243A] transition-colors cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          
          {/* Quick Action Button */}
          <Link
            href="/discussions/new"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-xs"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Yeni Konu Başlat</span>
          </Link>

          {/* 1. Temel Sayfalar (Herkes) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1 font-heading">
              Topluluk &amp; Forum
            </div>
            
            <Link
              href="/"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Home size={15} className="text-indigo-400" />
                <span>Forum Ana Sayfası</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/discussions"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/discussions' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare size={15} className="text-indigo-400" />
                <span>Tüm Tartışmalar</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/communities"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname?.startsWith('/communities') ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users size={15} className="text-indigo-400" />
                <span>Tanı &amp; Dayanışma Toplulukları</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>
          </div>

          {/* 2. Resmi Mevzuat & Hesaplama Robotları (Herkes) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1 font-heading">
              Hesaplama Robotları (2026)
            </div>

            <Link
              href="/hesaplama"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calculator size={15} className="text-indigo-400" />
                <span>Tüm Robotlar Dizini</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/hesaplama/balthazard"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama/balthazard' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Percent size={15} className="text-indigo-400" />
                <span>Balthazard Oran Robotu</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Resmî Ek-2</span>
            </Link>

            <Link
              href="/hesaplama/otv"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama/otv' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Car size={15} className="text-indigo-400" />
                <span>2026 ÖTV Muafiyetli Araç</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">2.87M ₺</span>
            </Link>

            <Link
              href="/hesaplama/erken-emeklilik"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama/erken-emeklilik' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar size={15} className="text-indigo-400" />
                <span>Engelli Erken Emeklilik</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">5510 m.28</span>
            </Link>

            <Link
              href="/hesaplama/vergi-indirimi"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama/vergi-indirimi' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Receipt size={15} className="text-indigo-400" />
                <span>Gelir Vergisi İndirimi</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">GVK 31</span>
            </Link>

            <Link
              href="/hesaplama/engelli-ayligi"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === '/hesaplama/engelli-ayligi' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-slate-200 hover:bg-[#111B2E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <HeartHandshake size={15} className="text-indigo-400" />
                <span>2022 Engelli Maaşı Kriteri</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">SYDV</span>
            </Link>
          </div>

          {/* 3. Kullanıcı Yetkisi / Özel Alanlar (Üye Girişi Yapıldıysa) */}
          {isLoggedIn && (
            <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1 font-heading">
                Kullanıcı Paneli (@{profile?.username})
              </div>

              <Link
                href={`/profile/${user.id}`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#111B2E] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <User size={15} className="text-indigo-400" />
                  <span>Kullanıcı Profilim &amp; Konularım</span>
                </span>
                <ChevronRight size={13} className="text-slate-600" />
              </Link>

              <Link
                href="/messages"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#111B2E] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare size={15} className="text-indigo-400" />
                  <span>Özel Mesajlarım (DM)</span>
                </span>
                <ChevronRight size={13} className="text-slate-600" />
              </Link>

              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#111B2E] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <SlidersHorizontal size={15} className="text-indigo-400" />
                  <span>Profil &amp; Erişilebilirlik Ayarları</span>
                </span>
                <ChevronRight size={13} className="text-slate-600" />
              </Link>

              <Link
                href="/developers"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  pathname === '/developers' ? 'bg-[#18243A] text-indigo-400 border border-[#1E293B]' : 'text-indigo-300 hover:bg-[#111B2E] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={15} className="text-indigo-400" />
                  <span>Geliştirici Portalı (OAuth &amp; API)</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                  Dev Portal
                </span>
              </Link>
            </div>
          )}

          {/* 4. Yetkili / Moderatör / Admin Paneli (Sadece Yetkili Rollere) */}
          {isMod && (
            <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 px-2 pb-1 flex items-center gap-1.5 font-heading">
                <ShieldCheck size={14} />
                <span>Yönetim Yetkileri ({role.toUpperCase()})</span>
              </div>

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Shield size={15} className="text-amber-400" />
                  <span>Yönetim Kontrol Paneli (ACP)</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">
                  Yetkili
                </span>
              </Link>

              <Link
                href="/visitor-stats"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#111B2E] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Activity size={15} className="text-purple-400" />
                  <span>Canlı Ziyaretçi İstatistikleri</span>
                </span>
                <ChevronRight size={13} className="text-slate-600" />
              </Link>

              <Link
                href="/developers"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#111B2E] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={15} className="text-indigo-400" />
                  <span>Geliştirici &amp; WebMCP Ajan API</span>
                </span>
                <ChevronRight size={13} className="text-slate-600" />
              </Link>

              <Link
                href="/widgets"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-indigo-400 hover:bg-[#111B2E] hover:text-indigo-300 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-indigo-400" />
                  <span>0 TL Erişilebilirlik &amp; WebMCP Widget</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold">
                  0 TL
                </span>
              </Link>
            </div>
          )}

          {/* 5. Kurumsal & Destek Sayfaları */}
          <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1 font-heading">
              Kurumsal &amp; Bilgi
            </div>

            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#18243A] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Info size={15} className="text-slate-400" />
                <span>Hakkımızda</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#18243A] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={15} className="text-slate-400" />
                <span>Yardım &amp; Sıkça Sorulan Sorular</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/terms"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#18243A] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen size={15} className="text-slate-400" />
                <span>Kullanım Kuralları</span>
              </span>
              <ChevronRight size={13} className="text-slate-600" />
            </Link>

            <Link
              href="/privacy"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-[#18243A] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Shield size={15} className="text-slate-400" />
                <span>Gizlilik Politikası</span>
              </span>
              <ChevronRight size={13} className="text-slate-500" />
            </Link>
          </div>

          {/* 6. Sponsorluk & Destekçiler */}
          <div className="p-3 rounded-md bg-[#111B2E] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Proje Destekçileri</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Topluluk</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://yeterly.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <span>yeterly.ai</span>
                <ExternalLink size={10} />
              </a>
              <span className="text-slate-600">&bull;</span>
              <a
                href="https://goldhost.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <span>goldhost.com.tr</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#1E293B] bg-[#111B2E] flex items-center justify-between">
          {isLoggedIn ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-300 font-semibold truncate max-w-[180px]">
                @{profile?.username}
              </div>
              <Link
                href="/auth/signout"
                onClick={onClose}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <LogOut size={13} />
                <span>Çıkış</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Link
                href="/login"
                onClick={onClose}
                className="flex-1 py-1.5 text-center bg-[#18243A] border border-[#1E293B] rounded text-xs font-medium text-white hover:bg-[#1E293B] transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex-1 py-1.5 text-center bg-indigo-600 rounded text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
