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
    shortDesc: '2.290.200 ₺ tavan & ters hesap',
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
      
      {/* 1. ÜST BİLGİ VE BREADCRUMB ÇUBUĞU */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Erişim Yolu">
            <Link href="/" className="hover:text-[#185886] transition-colors">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link 
              href="/hesaplama" 
              className={`hover:text-[#185886] transition-colors ${isHubPage ? 'font-bold text-[#185886]' : ''}`}
            >
              Hesaplama Araçları
            </Link>
            {currentTool && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-800">
                  {currentTool.name}
                </span>
              </>
            )}
          </nav>

          {/* Güncellik Rozeti */}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>2026 Mevzuatına Uyumlu</span>
            </span>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-block text-slate-500">
              Sağlık Bakanlığı &amp; GİB Kriterleri
            </span>
          </div>

        </div>
      </div>

      {/* 2. ANA DÜZEN: SIDEBAR + İÇERİK ALANI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Sidebar Başlığı */}
              <div className="bg-[#124d77] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Calculator className="w-4 h-4 text-blue-200" />
                  <span>HESAPLAMA ARAÇLARI</span>
                </div>
                <span className="text-[11px] bg-blue-900/60 px-2 py-0.5 rounded text-blue-100 font-semibold">
                  7 Araç
                </span>
              </div>

              {/* Mobilde Yatay Kaydırma / Masaüstünde Dikey Liste */}
              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible divide-x lg:divide-x-0 lg:divide-y divide-slate-100 p-1.5 lg:p-0">
                
                {/* Ana Hub Bağlantısı */}
                <Link
                  href="/hesaplama"
                  className={`shrink-0 lg:shrink flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-all rounded lg:rounded-none whitespace-nowrap lg:whitespace-normal ${
                    isHubPage
                      ? 'bg-[#185886] text-white border-l-0 lg:border-l-4 lg:border-[#124d77] shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#185886]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className={`w-4 h-4 shrink-0 ${isHubPage ? 'text-white' : 'text-slate-400'}`} />
                    <span>Tüm Araçlar Merkezi</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isHubPage ? 'bg-blue-900/60 text-blue-100' : 'bg-slate-100 text-slate-600'
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
                      className={`shrink-0 lg:shrink flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-all rounded lg:rounded-none whitespace-nowrap lg:whitespace-normal ${
                        isActive
                          ? 'bg-[#185886] text-white border-l-0 lg:border-l-4 lg:border-[#124d77] shadow-2xs font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#185886]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{tool.name}</span>
                      </div>

                      {tool.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ml-2 hidden sm:inline-block ${
                          isActive ? 'bg-blue-900/60 text-blue-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Alt Bilgi Kutusu */}
              <div className="hidden lg:block p-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resmi ve Güvenli</span>
                </div>
                Girdiğiniz tüm kişisel sağlık ve mali veriler yalnızca tarayıcınızda işlenir, sunucuya kaydedilmez.
              </div>

            </div>
          </aside>

          {/* ANA İÇERİK ALANI */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>

        </div>
      </div>

    </div>
  );
}
