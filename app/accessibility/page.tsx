'use client';

import React from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Award, Accessibility, ShieldCheck, Keyboard, Sparkles, 
  Eye, MousePointer, Type, Monitor, Smartphone, 
  CheckCircle2, AlertCircle, MessageSquare, ArrowRight,
  Zap, Brain, Volume2, Search, Scale
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AccessibilityStatementPage() {
  return (
    <SiteLayout>
      <div className="flex-1 w-full" role="main">
        
        {/* --- HERO SECTION --- */}
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
              >
                <Award size={14} className="animate-pulse" /> WCAG 2.1 AA / AAA UYUMLULUK
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-[1.1]"
              >
                Erişilebilirlik <br />
                <span className="text-primary">Taahhüdümüz.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto opacity-80"
              >
                EngelsizForum, sadece bir web sitesi değil; her bireyin bilgiye eşit, bağımsız ve konforlu bir şekilde ulaşabildiği dijital bir kaledir.
              </motion.p>
            </div>
          </div>
        </section>

        {/* --- CORE STANDARDS GRID --- */}
        <section className="py-24 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <ShieldCheck className="w-8 h-8" />, 
                  title: 'DÜZEY AA / AAA', 
                  text: 'Tüm temel alanlarda WCAG 2.1 AA uyumluluk kriterlerini karşılıyor, AAA seviyesini hedefliyoruz.',
                  tag: 'STANDART'
                },
                { 
                  icon: <Accessibility className="w-8 h-8" />, 
                  title: 'EKRAN OKUYUCULAR', 
                  text: 'VoiceOver, NVDA ve JAWS ile test edilmiş semantik HTML ve ARIA etiketleri ile tam uyum.',
                  tag: 'TEKNOLOJİ'
                },
                { 
                  icon: <Keyboard className="w-8 h-8" />, 
                  title: 'KLAVYE GEZİNTİSİ', 
                  text: 'Mouse kullanmadan, sadece Tab tuşuyla tüm kontrollere ve sayfalara hızlı ve mantıksal erişim.',
                  tag: 'NAVİGASYON'
                }
              ].map((item, idx) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-[2rem] p-10 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">{item.tag}</div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed opacity-80">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DETAILED FEATURES BENTO --- */}
        <section className="py-24 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">Teknik Özellikler</h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                    Platformumuzun her satır kodu, yardımcı teknolojilerin en verimli şekilde çalışabilmesi için optimize edilmiştir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Semantik HTML5', icon: <Monitor className="w-5 h-5" /> },
                    { title: 'ARIA Roller', icon: <Zap className="w-5 h-5" /> },
                    { title: 'Odak Belirteçleri', icon: <MousePointer className="w-5 h-5" /> },
                    { title: 'Alternatif Metinler', icon: <Eye className="w-5 h-5" /> },
                    { title: 'Esnek Yazı Tipleri', icon: <Type className="w-5 h-5" /> },
                    { title: 'Mobil Uyumluluk', icon: <Smartphone className="w-5 h-5" /> }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        {feat.icon}
                      </div>
                      <span className="font-bold text-foreground text-xs uppercase tracking-tight">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                <div className="bg-foreground text-background rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <Brain size={14} className="text-primary" /> AI DESTEKLİ ERİŞİLEBİLİRLİK
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">Akıllı Adaptasyon</h3>
                    <p className="text-sm md:text-base text-background/70 font-medium leading-relaxed">
                      Yapay zeka asistanlarımız Aria, Felix ve Bora; platformdaki içerikleri analiz ederek karmaşık terimleri sadeleştirir ve görsel içerikler için anlık betimlemeler oluşturur.
                    </p>
                    <ul className="space-y-4">
                      {[
                        'Otomatik Metin Özetleme',
                        'Bilişsel Yükü Azaltan Sade Dil',
                        'Gerçek Zamanlı Sesli Destek'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-background/90">
                          <CheckCircle2 className="text-primary w-4 h-4" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ASSISTIVE TECH TABLE --- */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Desteklenen Yardımcı Teknolojiler</h2>
              <p className="text-muted-foreground font-medium">Platformumuz aşağıdaki araçlarla en yüksek performansta çalışacak şekilde kodlanmıştır.</p>
            </div>

            <div className="overflow-hidden border border-border rounded-[2rem] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">PLATFORM</th>
                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">YARDIMCI ARAÇ</th>
                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border text-right">DURUM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { plat: 'Windows', tool: 'NVDA & JAWS', status: 'Tam Uyumlu' },
                    { plat: 'macOS / iOS', tool: 'VoiceOver', status: 'Tam Uyumlu' },
                    { plat: 'Android', tool: 'TalkBack', status: 'Tam Uyumlu' },
                    { plat: 'Tüm Tarayıcılar', tool: 'Ekran Büyüteçleri', status: 'Optimize Edildi' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-6 text-sm font-black text-foreground uppercase tracking-tight">{row.plat}</td>
                      <td className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-tight">{row.tool}</td>
                      <td className="p-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FEEDBACK SECTION --- */}
        <section className="py-24 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-card border border-border rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={32} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Geri Bildiriminiz Değerlidir</h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                    Erişilebilirlik yolculuğumuz asla bitmiyor. Eğer bir engelle karşılaşırsanız, lütfen bize bildirin. Geri bildirimlerinizi öncelikli olarak inceliyoruz.
                  </p>
                </div>
                <div className="p-6 bg-muted rounded-2xl border border-border/50 space-y-2">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">İLETİŞİM E-POSTA</div>
                  <a href="mailto:miracbirben@engelsizforum.com" className="text-xl font-black text-primary hover:underline">miracbirben@engelsizforum.com</a>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                 <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-primary w-5 h-5" />
                      <span className="font-black text-foreground text-xs uppercase tracking-tight">Hatalı Bildirim Süreci</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold leading-relaxed opacity-80 uppercase tracking-wide">
                      Bildirilen her erişilebilirlik sorunu, teknik ekibimiz tarafından 48 saat içerisinde incelenir ve düzeltme planına dahil edilir.
                    </p>
                 </div>
                 <Link 
                    href="/" 
                    className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-5 text-sm font-black text-background transition hover:bg-foreground/90 uppercase tracking-widest shadow-xl"
                  >
                    ANA SAYFAYA DÖN <ArrowRight size={18} />
                 </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
