'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Percent, 
  Car, 
  Receipt, 
  Home, 
  Users, 
  Briefcase, 
  Calendar,
  Calculator,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  shortDesc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'balthazard',
    name: '% Balthazard Formülü',
    shortDesc: 'Birden çok engel oranı birleştirme',
    href: '/hesaplama/balthazard',
    icon: Percent,
    badge: 'Ek-2',
  },
  {
    id: 'otv',
    name: '2026 ÖTV Araç İndirimi',
    shortDesc: '2.873.972 ₺ tavan & ters hesap',
    href: '/hesaplama/otv',
    icon: Car,
    badge: '2026 Tavan',
  },
  {
    id: 'vergi-indirimi',
    name: 'Gelir Vergisi İndirimi',
    shortDesc: '1., 2. ve 3. derece net maaş kazancı',
    href: '/hesaplama/vergi-indirimi',
    icon: Receipt,
    badge: 'GVK 31',
  },
  {
    id: 'evde-bakim',
    name: 'Evde Bakım Maaşı',
    shortDesc: '2/3 asgari ücret gelir testi',
    href: '/hesaplama/evde-bakim',
    icon: Home,
    badge: 'Tam Bağımlı',
  },
  {
    id: 'engelli-ayligi',
    name: '2022 Engelli Aylığı',
    shortDesc: '1/3 asgari ücret muhtaçlık testi',
    href: '/hesaplama/engelli-ayligi',
    icon: Users,
    badge: 'SYDV',
  },
  {
    id: 'kidem-ihbar',
    name: 'Kıdem & İhbar Tazminatı',
    shortDesc: 'Tavan hesabı & 24/I-a fesih hakkı',
    href: '/hesaplama/kidem-ihbar',
    icon: Briefcase,
    badge: 'İş K. 24',
  },
  {
    id: 'erken-emeklilik',
    name: 'Engelli Erken Emeklilik',
    shortDesc: '01.10.2008 öncesi/sonrası prim günleri',
    href: '/hesaplama/erken-emeklilik',
    icon: Calendar,
    badge: '5510 & 506',
  },
];

export default function HesaplamaNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Aktif sayfa başlığı tespiti (Breadcrumb için)
  const currentTool = TOOLS.find(t => t.href === pathname);
  const isHubPage = pathname === '/hesaplama';

  // If on main hub, render page directly to prevent double breadcrumb and double sidebar
  if (isHubPage) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="w-full flex flex-col gap-5 max-w-7xl mx-auto">
      
      {/* 1. ÜST BİLGİ VE BREADCRUMB ÇUBUĞU */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400" aria-label="Erişim Yolu">
          <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 font-bold transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link 
            href="/hesaplama" 
            className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${isHubPage ? 'font-bold text-sky-700 dark:text-sky-400' : ''}`}
          >
            Hesaplama Robotları
          </Link>
          {currentTool && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-extrabold text-slate-950 dark:text-white">
                {currentTool.name}
              </span>
            </>
          )}
        </nav>

        {/* Güncellik Rozeti */}
        <div className="flex items-center gap-2 font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>2026 Mevzuatı</span>
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden sm:inline-block text-slate-500 dark:text-slate-400 text-xs">
            Resmî Gazete &amp; Sağlık Bakanlığı
          </span>
        </div>
      </div>

      {/* 2. ANA DÜZEN: SIDEBAR + İÇERİK ALANI */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            
            {/* Sidebar Başlığı */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-sky-400" />
                <span>HESAPLAMA ARAÇLARI</span>
              </div>
              <span className="text-[10px] bg-sky-950 border border-sky-800 px-2 py-0.5 rounded font-bold text-sky-300">
                7 Araç
              </span>
            </div>

            {/* Mobilde Yatay Kaydırma / Masaüstünde Dikey Liste */}
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible divide-x lg:divide-x-0 lg:divide-y divide-slate-100 dark:divide-slate-800 p-1.5 lg:p-0">
              
              {/* Ana Hub Bağlantısı */}
              <Link
                href="/hesaplama"
                className={`shrink-0 lg:shrink flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-all rounded-xl lg:rounded-none whitespace-nowrap lg:whitespace-normal min-h-[38px] ${
                  isHubPage
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-l-0 lg:border-l-4 lg:border-sky-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className={`w-4 h-4 shrink-0 ${isHubPage ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>Tüm Araçlar Merkezi</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                  isHubPage ? 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  Hub
                </span>
              </Link>

              {/* 7 Adet Hesaplama Aracı Menü Öğesi */}
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname === tool.href;

                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={`shrink-0 lg:shrink flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-all rounded-xl lg:rounded-none whitespace-nowrap lg:whitespace-normal min-h-[38px] ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-l-0 lg:border-l-4 lg:border-sky-600'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                      <span className="truncate">{tool.name}</span>
                    </div>

                    {tool.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-2 hidden sm:inline-block border ${
                        isActive 
                          ? 'bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {tool.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Alt Bilgi Kutusu */}
            <div className="hidden lg:block p-3.5 bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Resmi ve Güvenli</span>
              </div>
              Kişisel sağlık ve mali verileriniz yalnızca tarayıcınızda işlenir, sunucuya kaydedilmez.
            </div>

          </div>
        </aside>

        {/* ANA İÇERİK ALANI */}
        <section className="flex-1 w-full min-w-0">
          {children}
        </section>

      </div>

    </div>
  );
}
