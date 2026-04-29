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

  if (!user) return <div className="p-20 text-center">Lütfen giriş yapın.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2"><ArrowLeft size={16} /> Geri</button>
        <h1 className="text-3xl font-bold mb-8">Yeni Tartışma</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            required 
            placeholder="Başlık" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full p-4 rounded-xl border"
          />
          <select 
            required 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="w-full p-4 rounded-xl border"
          >
            <option value="">Kategori Seçin</option>
            <option value="GENEL">Genel</option>
          </select>
          <TopicEditor value={content} onChange={setContent} />
          <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold">Yayınla</button>
        </form>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
