'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-4">404 - Sayfa Bulunamadı</h1>
      <p className="text-muted-foreground mb-8">Aradığınız sayfa mevcut değil.</p>
      <a href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">Ana Sayfa</a>
    </div>
  );
}
