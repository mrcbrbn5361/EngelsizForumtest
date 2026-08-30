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
              className="w-full bg-white border border-[#d8dee4] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#18587a]"
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
            <span className="font-semibold text-[#18587a] group-hover:underline">ÖTV 2026 Muafiyet Hesapla</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-slate-100"></div>
          <Link href="/robotlar/balthazard" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-[#18587a] group-hover:underline">Balthazard Formülü Robotu</span>
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <div className="h-[1px] bg-slate-100"></div>
          <Link href="/robotlar/emeklilik" className="flex items-center justify-between text-[13px] group">
            <span className="font-semibold text-[#18587a] group-hover:underline">Engelli Emeklilik Sorgulama</span>
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
          <div className="text-[13px] mb-3">
            Toplam: <span className="font-bold">1,248</span> (Üye: 452, Ziyaretçi: 796)
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
            <Link href="/uyeler/admin" className="font-bold text-red-600 hover:underline">Admin</Link>
            <span className="text-slate-300">,</span>
            <Link href="/uyeler/bora" className="font-bold text-green-700 hover:underline">Bora</Link>
            <span className="text-slate-300">,</span>
            <Link href="/uyeler/aria" className="font-bold text-blue-600 hover:underline">Aria</Link>
            <span className="text-slate-300">,</span>
            <Link href="/uyeler/kullanici1" className="text-[#18587a] hover:underline">MehmetCan</Link>
            <span className="text-slate-300">,</span>
            <Link href="/uyeler/kullanici2" className="text-[#18587a] hover:underline">AyşeYılmaz</Link>
            <span className="text-slate-300">,</span>
            <Link href="/uyeler/kullanici3" className="text-[#18587a] hover:underline">ErişilebilirlikUzmanı</Link>
            <span className="text-slate-300">...</span>
          </div>
          <div className="mt-3 text-[12px] text-slate-500 italic">
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
            <span className="text-slate-600">Konular:</span>
            <span className="font-mono font-semibold">142,580</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-600">Mesajlar:</span>
            <span className="font-mono font-semibold">2,145,920</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-600">Üyeler:</span>
            <span className="font-mono font-semibold">86,412</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-600">Son Üye:</span>
            <Link href="/uyeler/yeni" className="font-semibold text-[#18587a] hover:underline">Zeynepp_06</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
