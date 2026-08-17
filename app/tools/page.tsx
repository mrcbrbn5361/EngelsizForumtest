import React from 'react';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout/site-layout';
import { 
  Calculator, 
  Car, 
  Clock, 
  Cpu, 
  Settings, 
  Activity, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erişilebilirlik ve Hesaplama Araçları | EngelsizForum',
  description: 'ÖTV muafiyeti, engelli emeklilik, WebMCP yapay zeka asistanları ve erişilebilirlik araçları portalı.',
};

export default function ToolsHubPage() {
  const tools = [
    {
      title: 'ÖTV Muafiyetli Araç Hesaplama',
      description: '2026 yılı güncel mevzuat ve üst limitlerine uygun ÖTV indirimli araç bedeli hesaplayıcı.',
      icon: Car,
      href: '/hesaplama#otv-calculator',
      badge: 'Finansal Araç',
      color: 'from-blue-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30'
    },
    {
      title: 'Engelli Emeklilik ve Prim Hesaplama',
      description: 'Engel oranınız, ilk sigorta giriş tarihiniz ve prim gün sayınıza göre emeklilik şartı sorgulama.',
      icon: Clock,
      href: '/hesaplama#pension-calculator',
      badge: 'Mevzuat & Haklar',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Chrome WebMCP AI Asistanı',
      description: 'W3C WebMCP 1.1 protokolü ile forum içeriğini, özetleri ve erişilebilirlik önerilerini AI ile çalıştırma.',
      icon: Cpu,
      href: '/webmcp',
      badge: 'AI & MCP 1.1',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Erişilebilirlik Tercihleri ve Ayarlar',
      description: 'Biyonik okuma, disleksi fontu, yüksek kontrast ve metin boyutu seçeneklerini özelleştirme.',
      icon: Settings,
      href: '/accessibility-settings',
      badge: 'WCAG 2.1 AAA',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Canlı Ziyaretçi ve Stand Monitörü',
      description: 'Raspberry Pi ve IoT cihazları ile entegre canlı istatistik ve Teknofest ekranı.',
      icon: Activity,
      href: '/visitor-stats',
      badge: 'Canlı Monitör',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
    },
    {
      title: 'Erişilebilirlik Standartları & Bildirimi',
      description: 'EngelsizForum WCAG 2.1 AA/AAA uyumluluk taahhüdü ve ekran okuyucu kullanım rehberi.',
      icon: ShieldCheck,
      href: '/accessibility',
      badge: 'Kılavuz',
      color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30'
    }
  ];

  return (
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Header Breadcrumbs */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-foreground font-semibold" aria-current="page">Araçlar ve Hesaplayıcılar</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="size-3.5" />
            <span>Engelsiz Yaşam Teknolojileri</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Erişilebilirlik ve Hesaplama Araçları
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Engelli bireylerin günlük yaşamlarını, yasal haklarını, finansal hesaplamalarını ve dijital erişilebilirlik deneyimlerini kolaylaştırmak için geliştirilmiş tüm araçlar tek bir merkezde.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={idx}
                href={tool.href}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-card border border-border/80 hover:border-sky-500/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} border`}>
                      <Icon className="size-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/60">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-foreground group-hover:text-sky-400 transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-sky-400">
                  <span>Aracı Başlat</span>
                  <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Disclaimer Card */}
        <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-sky-400" />
            <span>Mevzuat ve Sorumluluk Reddi Beyanı</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hesaplama araçları Türkiye Cumhuriyeti 2026 yılı güncel Gelir İdaresi Başkanlığı (GİB) ve Sosyal Güvenlik Kurumu (SGK) mevzuatlarına göre bilgilendirme amacıyla hazırlanmıştır. Nihai resmi işlemler için ilgili vergi daireleri veya SGK il müdürlüklerine başvurulması tavsiye edilir.
          </p>
        </div>

      </div>
    </SiteLayout>
  );
}

