'use client';

import { Users, BarChart3, Calculator, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ClassicSidebar() {
  return (
    <aside className="w-full lg:w-[300px] flex flex-col gap-5 shrink-0">
      
      {/* Search Widget - Mobile/Tablet Fallback */}
      <div className="xf-sidebar-block md:hidden">
        <div className="p-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Forumda ara..." 
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Calculator Robots Widget */}
      <div className="xf-sidebar-block">
        <div className="xf-sidebar-header flex items-center gap-2">
          <Calculator size={14} />
          HESAPLAMA ROBOTLARI
        </div>
        <div className="p-3 flex flex-col gap-2.5">
          <Link href="/robotlar/otv-2026" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">ÖTV 2026 Muafiyet Hesapla</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-white/[0.08]"></div>
          <Link href="/robotlar/balthazard" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">Balthazard Formülü Robotu</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-white/[0.08]"></div>
          <Link href="/robotlar/emeklilik" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-sky-400 group-hover:text-sky-300 group-hover:underline">Engelli Emeklilik Sorgulama</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Online Users Widget */}
      <div className="xf-sidebar-block">
        <div className="xf-sidebar-header flex items-center gap-2">
          <Users size={14} />
          ÇEVRİMİÇİ ÜYELER
        </div>
        <div className="p-3">
          <div className="text-[13px] mb-3 text-slate-300">
            Toplam: <span className="font-bold text-slate-100">1,248</span> (Üye: 452, Ziyaretçi: 796)
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
            <Link href="/uyeler/admin" className="font-bold text-red-400 hover:text-red-300 hover:underline">Admin</Link>
            <span className="text-slate-600">,</span>
            <Link href="/uyeler/bora" className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline">Bora</Link>
            <span className="text-slate-600">,</span>
            <Link href="/uyeler/aria" className="font-bold text-sky-400 hover:text-sky-300 hover:underline">Aria</Link>
            <span className="text-slate-600">,</span>
            <Link href="/uyeler/kullanici1" className="text-sky-400 hover:text-sky-300 hover:underline font-medium">MehmetCan</Link>
            <span className="text-slate-600">,</span>
            <Link href="/uyeler/kullanici2" className="text-sky-400 hover:text-sky-300 hover:underline font-medium">AyşeYılmaz</Link>
            <span className="text-slate-600">,</span>
            <Link href="/uyeler/kullanici3" className="text-sky-400 hover:text-sky-300 hover:underline font-medium">ErişilebilirlikUzmanı</Link>
            <span className="text-slate-600">...</span>
          </div>
          <div className="mt-3 text-[12px] text-slate-400 font-medium italic">
            ...ve 446 diğer üye daha.
          </div>
        </div>
      </div>

      {/* Statistics Widget */}
      <div className="xf-sidebar-block">
        <div className="xf-sidebar-header flex items-center gap-2">
          <BarChart3 size={14} />
          FORUM İSTATİSTİKLERİ
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-300 font-medium">Konular:</span>
            <span className="font-mono font-bold text-slate-100">142,580</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-300 font-medium">Mesajlar:</span>
            <span className="font-mono font-bold text-slate-100">2,145,920</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-300 font-medium">Üyeler:</span>
            <span className="font-mono font-bold text-slate-100">86,412</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-300 font-medium">Son Üye:</span>
            <Link href="/uyeler/yeni" className="font-bold text-sky-400 hover:text-sky-300 hover:underline">Zeynepp_06</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
