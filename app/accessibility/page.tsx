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
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-border/60 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider"
              >
                <Award size={14} className="animate-pulse" /> WCAG 2.2 AAA UYUMLULUK
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
              >
                Erişilebilirlik <br />
                <span className="text-sky-400">Taahhüdümüz.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto"
              >
                EngelsizForum, sadece bir forum değil; her bireyin bilgiye eşit, bağımsız ve konforlu bir şekilde ulaşabildiği dijital bir dayanışma platformudur.
              </motion.p>
            </div>
          </div>
        </section>

        {/* --- CORE STANDARDS GRID --- */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: <ShieldCheck className="w-6 h-6" />, 
                  title: 'DÜZEY AA / AAA', 
                  text: 'Tüm temel alanlarda WCAG 2.2 AA uyumluluk kriterlerini karşılıyor, AAA seviyesini hedefliyoruz.',
                  tag: 'STANDART'
                },
                { 
                  icon: <Accessibility className="w-6 h-6" />, 
                  title: 'EKRAN OKUYUCULAR', 
                  text: 'VoiceOver, NVDA ve JAWS ile test edilmiş semantik HTML ve ARIA etiketleri ile tam uyum.',
                  tag: 'TEKNOLOJİ'
                },
                { 
                  icon: <Keyboard className="w-6 h-6" />, 
                  title: 'KLAVYE GEZİNTİSİ', 
                  text: 'Mouse kullanmadan, sadece Tab tuşuyla tüm kontrollere ve sayfalara hızlı ve mantıksal erişim.',
                  tag: 'NAVİGASYON'
                }
              ].map((item, idx) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border/80 rounded-2xl p-8 shadow-xs hover:border-sky-500/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2">{item.tag}</div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DETAILED FEATURES BENTO --- */}
        <section className="py-16 border-y border-border/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Teknik Özellikler</h2>
                  <p className="text-base text-muted-foreground font-normal leading-relaxed">
                    Platformumuzun her satır kodu, yardımcı teknolojilerin en verimli şekilde çalışabilmesi için optimize edilmiştir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Semantik HTML5', icon: <Monitor className="w-5 h-5" /> },
                    { title: 'ARIA Roller', icon: <Zap className="w-5 h-5" /> },
                    { title: 'Odak Belirteçleri', icon: <MousePointer className="w-5 h-5" /> },
                    { title: 'Alternatif Metinler', icon: <Eye className="w-5 h-5" /> },
                    { title: 'Esnek Yazı Tipleri', icon: <Type className="w-5 h-5" /> },
                    { title: 'Mobil Uyumluluk', icon: <Smartphone className="w-5 h-5" /> }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-4 bg-card border border-border/80 rounded-xl shadow-xs hover:border-sky-500/30 transition-all group">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-sky-400 group-hover:bg-sky-500/10 transition-colors">
                        {feat.icon}
                      </div>
                      <span className="font-bold text-foreground text-xs uppercase tracking-wider">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 relative w-full">
                <div className="bg-card border border-border/80 text-foreground rounded-2xl p-8 md:p-10 shadow-xs relative overflow-hidden space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-[10px] font-bold uppercase tracking-wider border border-sky-500/20">
                      <Brain size={13} /> AI DESTEKLİ ERİŞİLEBİLİRLİK
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight">Akıllı Adaptasyon</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                      Yapay zeka araçlarımız platformdaki içerikleri analiz ederek karmaşık mevzuat maddelerini ve terimleri sadeleştirir.
                    </p>
                    <ul className="space-y-3 pt-2">
                      {[
                        'Otomatik Metin Özetleme & Sade Dil',
                        'Bilişsel Yükü Azaltan Modlar (Disleksi, Biyonik)',
                        'Yüksek Kontrast & Dinamik Boyutlandırma'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-foreground">
                          <CheckCircle2 className="text-sky-400 w-4 h-4 shrink-0" /> {item}
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
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Desteklenen Yardımcı Teknolojiler</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">Platformumuz aşağıdaki araçlarla en yüksek performansta çalışacak şekilde kodlanmıştır.</p>
            </div>

            <div className="overflow-x-auto border border-border/80 rounded-2xl shadow-xs bg-card">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">PLATFORM</th>
                    <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">YARDIMCI ARAÇ</th>
                    <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 text-right">DURUM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { plat: 'Windows', tool: 'NVDA & JAWS', status: 'Tam Uyumlu' },
                    { plat: 'macOS / iOS', tool: 'VoiceOver', status: 'Tam Uyumlu' },
                    { plat: 'Android', tool: 'TalkBack', status: 'Tam Uyumlu' },
                    { plat: 'Tüm Tarayıcılar', tool: 'Ekran Büyüteçleri', status: 'Optimize Edildi' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-xs font-bold text-foreground uppercase tracking-wide">{row.plat}</td>
                      <td className="p-4 text-xs font-medium text-muted-foreground">{row.tool}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
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
        <section className="py-16 bg-muted/20 border-t border-border/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-card border border-border/80 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <MessageSquare size={24} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Geri Bildiriminiz Değerlidir</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                    Erişilebilirlik yolculuğumuz asla bitmiyor. Eğer bir engelle karşılaşırsanız, lütfen bize bildirin. Geri bildirimlerinizi öncelikli olarak inceliyoruz.
                  </p>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">İLETİŞİM E-POSTA</div>
                  <a href="mailto:miracbirben@engelsizforum.com" className="text-sm font-bold text-sky-400 hover:underline">miracbirben@engelsizforum.com</a>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                 <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-sky-400 w-4 h-4 shrink-0" />
                      <span className="font-bold text-foreground text-xs uppercase tracking-wider">Hata Bildirim Süreci</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                      Bildirilen her erişilebilirlik sorunu, teknik ekibimiz tarafından 48 saat içerisinde incelenir ve düzeltme planına dahil edilir.
                    </p>
                 </div>
                 <Link 
                    href="/discussions" 
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-xs font-bold text-white transition uppercase tracking-wider shadow-xs"
                  >
                    Forum Tartışmalarına Dön <ArrowRight size={14} />
                 </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
