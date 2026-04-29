'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { TopicEditor } from '@/components/forum/topic-editor';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export default function NewTopicPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/discussions');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Lütfen giriş yapın</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">Yeni bir tartışma başlatmak için önce üye girişi yapmanız gerekmektedir.</p>
        <button onClick={() => router.push('/auth')} className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold shadow-lg">Giriş Yap</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </button>

        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 md:p-12">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-black mb-4">Yeni Tartışma</h1>
            <p className="text-muted-foreground leading-relaxed">Toplulukla paylaşmak istediğiniz bir sorunuz veya tecrübeniz mi var? Detayları aşağıya yazın.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">BAŞLIK</label>
              <input 
                id="title"
                type="text" 
                required 
                placeholder="Örn: Ekran okuyucu kullanırken karşılaşılan zorluklar..." 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full p-5 rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">KATEGORİ</label>
              <select 
                id="category"
                required 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full p-5 rounded-2xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="">Bir kategori seçin...</option>
                <option value="GENEL">Genel</option>
                <option value="TEKNOLOJI">Teknoloji</option>
                <option value="YARDIM">Yardım İstiyorum</option>
                <option value="GEME">Görme Engelli</option>
                <option value="ISE">İşitme Engelli</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">İÇERİK</label>
              <TopicEditor value={content} onChange={setContent} />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} /> Tartışmayı Yayınla
              </button>
            </div>
          </form>
        </div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
