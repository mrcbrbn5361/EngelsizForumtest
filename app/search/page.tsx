'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Search, MessageSquare, Filter, ArrowRight } from 'lucide-react';
import { MOCK_TOPICS } from '@/types/mock-data';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(MOCK_TOPICS);
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Automatically trigger update
      const filtered = MOCK_TOPICS.filter(topic => 
        topic.title.toLowerCase().includes(transcript.toLowerCase()) || 
        topic.content.toLowerCase().includes(transcript.toLowerCase())
      );
      setResults(filtered);
    };

    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = MOCK_TOPICS.filter(topic => 
      topic.title.toLowerCase().includes(query.toLowerCase()) || 
      topic.content.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold mb-6">Forumda Ara</h1>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Başlık veya içerik ara..." 
              className="w-full pl-16 pr-24 py-5 rounded-[2rem] border border-border bg-card shadow-lg focus:ring-4 focus:ring-primary/20 outline-none transition-all text-lg"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                type="button"
                onClick={startVoiceSearch}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted hover:bg-zinc-200'}`}
                title="Sesli Ara"
              >
                <div className="relative">
                  <Search className={isListening ? 'opacity-0' : 'opacity-100'} size={20} />
                  {isListening && <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">...</div>}
                </div>
              </button>
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-bold shadow-md hover:bg-primary/90 transition-all"
              >
                Ara
              </button>
            </div>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {results.length} SONUÇ BULUNDU
            </h2>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Filter size={16} /> Filtrele
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="block group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                          <div className="flex items-center gap-4 pt-2">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <MessageSquare size={14} /> 12 Yanıt
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-md text-muted-foreground uppercase tracking-wider">
                              {topic.category_id}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <p className="text-lg font-medium text-muted-foreground italic mb-2">Aramanızla eşleşen sonuç bulunamadı.</p>
                  <p className="text-sm text-muted-foreground">Farklı anahtar kelimeler denemeyi deneyin.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}
