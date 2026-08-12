import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-4">404 - Sayfa Bulunamadı</h1>
      <p className="text-muted-foreground mb-8">Aradığınız sayfa mevcut değil.</p>
      <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">Ana Sayfa</Link>
    </div>
  );
}
