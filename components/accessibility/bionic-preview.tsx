'use client';

import React, { useState, useMemo } from 'react';
import { Zap, Type, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function BionicPreview() {
  const [text, setText] = useState('EngelsizForum, engelli bireyler için tam erişilebilir, yapay zeka destekli ilk yerli topluluk platformudur. Biyonik okuma, gözünüzün metin üzerinde daha hızlı kaymasını sağlar.');
  const [isActive, setIsActive] = useState(true);

  const bionicText = useMemo(() => {
    if (!isActive) return text;
    
    return text.split(' ').map((word, i) => {
      if (word.length <= 3) {
        return <span key={i} className="font-black text-primary">{word} </span>;
      }
      const mid = Math.ceil(word.length / 2);
      const firstHalf = word.substring(0, mid);
      const secondHalf = word.substring(mid);
      
      return (
        <span key={i}>
          <span className="font-black text-primary">{firstHalf}</span>
          <span className="text-foreground/70">{secondHalf}</span>
          {' '}
        </span>
      );
    });
  }, [text, isActive]);

  return (
    <section className="max-w-[1280px] mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 rounded-[32px] p-8 md:p-12 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={120} className="text-primary" />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
              <Zap size={14} /> Yeni Özellik Deneyimi
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Biyonik Okuma ile <br />
              <span className="text-primary">Daha Hızlı Odaklanın</span>
            </h2>
            
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
              Gözlerimizin kelimeleri tanıma hızını artıran bu teknoloji, özellikle disleksi veya odaklanma güçlüğü çeken bireyler için okuma konforunu %40 oranında artırır.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl hover:-translate-y-1 active:translate-y-0",
                  isActive 
                    ? "bg-primary text-white ring-4 ring-primary/20" 
                    : "bg-background border-2 border-primary/20 text-primary hover:bg-primary/5"
                )}
              >
                {isActive ? "Biyonik Mod: AÇIK" : "Biyonik Mod: KAPALI"}
              </button>
              
              <button
                onClick={() => setText('Engelsiz bir dünya için teknolojiyi erişilebilir kılıyoruz. Her bireyin bilgiye eşit erişim hakkı vardır.')}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
              >
                <RefreshCw size={18} /> Örnek Metni Değiştir
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50" />
            <div className="relative bg-background/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl min-h-[300px] flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <Type size={14} /> Okuma Önizleme
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm font-medium text-muted-foreground min-h-[80px]"
                placeholder="Buraya bir metin yazın ve biyonik okumayı test edin..."
              />

              <div className="h-px bg-border" />

              <div className="text-lg md:text-xl leading-relaxed text-foreground select-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isActive ? 'active' : 'inactive'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {bionicText}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 p-3 rounded-xl border border-primary/10">
                <Info size={12} />
                İpucu: Bu özellik tüm tartışma sayfalarımızda yerleşiktir.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
