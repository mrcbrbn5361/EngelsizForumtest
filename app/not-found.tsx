'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#FFF0F6] blur-3xl rounded-full"></div>
            <FileQuestion size={120} className="text-[#FF4D94] relative z-10" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-8xl md:text-9xl font-black text-[#1A1A1A]">404</h1>
            <p className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight">Bu sayfa engellerimize takıldı!</p>
            <p className="max-w-xl mx-auto text-lg md:text-xl text-[#666666] font-medium leading-relaxed">
              Gitmek istediğiniz sayfa silinmiş, taşınmış veya henüz inşa edilmemiş olabilir. Panik yapmayın, birlikte aşarız.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link 
              href="/"
              className="px-12 py-4 bg-[#FF4D94] text-[#FFFFFF] rounded-[8px] font-bold text-lg hover:bg-[#FF4D94]/90 transition-all flex items-center gap-3"
            >
              <Home size={24} /> Ana Sayfa
            </Link>
            <Link 
              href="/discussions"
              className="px-6 py-4 bg-[#F9F9FB] text-[#1A1A1A] rounded-[8px] font-bold text-sm uppercase tracking-widest flex items-center gap-3 border border-[#E5E7EB] hover:bg-[#E5E7EB] transition-all"
            >
              <ArrowLeft size={20} /> Tartışmalara Dön
            </Link>
          </div>
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
