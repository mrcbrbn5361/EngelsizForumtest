import React from 'react';
import Link from 'next/link';
import { Bot, Sparkles, CheckCircle2, ArrowLeft, ShieldCheck, Terminal, Layers, Globe, Monitor, Newspaper } from 'lucide-react';

export const metadata = {
  title: 'WebMCP & Remote MCP Ajan Sistemi | EngelsizForum',
  description: 'Google Chrome Web Model Context Protocol (WebMCP) ve Remote MCP Sunucu standardı ile Web, Masaüstü ve Terminal AI Ajanları için engelli haberleri ve yasal haklar platformu.',
};

export default function WebMCPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            W3C Web ML Community Group & MCP Standardı
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Türkiye&apos;nin İlk Çok Platformlu Engelli AI Ajan Hub&apos;ı
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Yapay Zeka (AI) Ajanları ve WebMCP Entegrasyonu
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          EngelsizForum, hem site içi konuları hem de <strong className="text-foreground">tüm internetteki güncel engelli haberlerini, Resmi Gazete kararlarını ve mevzuatı</strong> Web, Masaüstü ve Terminal tabanlı tüm Yapay Zeka Ajanlarının (Gemini, Claude, Cursor, ChatGPT) kullanımına sunar.
        </p>
      </div>

      {/* Gemini Connection URL Guide Alert Box */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <h2 className="text-xl font-black text-foreground">Gemini Web / MCP Ajan Bağlantı Adresi Rehberi</h2>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed font-medium">
          Gemini Web (&quot;Özel bağlı uygulama oluşturun&quot; / Custom Connected Apps) veya Claude Desktop ayarlarında MCP sunucu adresi girerken <strong>bilgi sayfası URL&apos;si olan /webmcp yerine doğrudan API sunucu adresini</strong> kullanmalısınız:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
            <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1">
              ❌ Yanlış URL (Sayfa Adresi):
            </span>
            <p className="font-mono text-xs font-bold text-foreground line-through opacity-75">
              https://www.engelsizforum.com/webmcp
            </p>
            <p className="text-[11px] text-muted-foreground">
              Bu adres web arayüzüdür. Gemini bağlandığında HTML döndüğü için &quot;geçerli MCP sunucusu değil&quot; uyarısı verir.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-1.5">
            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✅ Doğru MCP Sunucu Adresi:
            </span>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-background px-2.5 py-1 rounded border border-emerald-500/30 w-fit">
              https://www.engelsizforum.com/mcp
            </p>
            <p className="text-[11px] text-muted-foreground">
              Veya <code className="font-mono font-bold text-foreground">https://www.engelsizforum.com/api/mcp</code>. Gemini ve tüm MCP ajanları bu adresten anında araçları tanır.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Multi-Agent Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm hover:border-blue-500/30 transition-all">
          <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Web Tabanlı AI Ajanlar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gemini Web (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">gemini.google.com</code>) ve Claude Web ajanları <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/api/mcp</code> adresimizi doğrudan Özel Bağlı Uygulama olarak ekleyebilir.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Monitor className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Masaüstü AI Ajanlar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cursor IDE, Claude Desktop ve Windsurf gibi masaüstü yapay zeka araçları SSE &amp; HTTP JSON-RPC protokolü üzerinden EngelsizForum araçlarına erişir.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm hover:border-purple-500/30 transition-all">
          <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Terminal &amp; CLI Ajanlar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Claude Code, Aider veya komut satırı yapay zeka araçları tek bir terminal komutuyla EngelsizForum MCP sunucusunu bağlayabilir.
          </p>
        </div>
      </div>

      {/* Real-Time Internet News Grounding Highlight Box */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-blue-600/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-foreground">İnternet Genelindeki Tüm Engelli Haberleri &amp; Canlı Mevzuat Arama</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          EngelsizForum MCP Ajanı sadece sitemizdeki forum konuları ile sınırlı değildir. <strong className="text-foreground">Gemini Google Search Grounding</strong> yapay zeka entegrasyonu sayesinde, internetteki tüm güncel engelli haberlerini, Resmi Gazete ilanlarını, Aile ve Sosyal Hizmetler Bakanlığı duyurularını ve ÖTV 2026 gelişmelerini canlı olarak arar ve ajanınıza aktarır.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-background/80 border border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ÖTV 2026 Araç Alım Üst Limiti &amp; Kararları</span>
          </div>
          <div className="p-3 rounded-xl bg-background/80 border border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>T.C. Resmi Gazete Engelli Yönetmelikleri</span>
          </div>
          <div className="p-3 rounded-xl bg-background/80 border border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>SGK Protez, Ortez &amp; Medikal Cihaz Ödemeleri</span>
          </div>
          <div className="p-3 rounded-xl bg-background/80 border border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>EKPSS, RAM &amp; Özel Eğitim Güncel Duyuruları</span>
          </div>
        </div>
      </div>

      {/* Exposed Tools Table */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-foreground">Kullanılabilir MCP Ajan Araçları (Aktif 9 Araç)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-3 px-4 font-semibold text-foreground">Araç Adı (Tool Name)</th>
                <th className="py-3 px-4 font-semibold text-foreground">İşlev &amp; Kapsam</th>
                <th className="py-3 px-4 font-semibold text-foreground">Parametreler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">engelsizforum_live_disability_news</td>
                <td className="py-3 px-4 text-muted-foreground">İnternetteki ve Resmi Gazete&apos;deki en güncel engelli haberlerini canlı arar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">topic: string, scope: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">engelsizforum_web_search</td>
                <td className="py-3 px-4 text-muted-foreground">Tüm internetteki engelli hakları ve tıbbi kaynaklarda canlı arama yapar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">query: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_search</td>
                <td className="py-3 px-4 text-muted-foreground">EngelsizForum veritabanındaki konu ve başlıkları arar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">query: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_balthazard_calc</td>
                <td className="py-3 px-4 text-muted-foreground">Birden fazla engel oranını Balthazard formülü ile net toplama çevirir.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">rates: number[]</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_disability_rights_guide</td>
                <td className="py-3 px-4 text-muted-foreground">Rapor oranına (%40, %70, %90) göre yasal engelli haklarını sorgular.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">reportPercentage: number</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_legislation_lookup</td>
                <td className="py-3 px-4 text-muted-foreground">ÖTV Kanunu, Emeklilik Cetveli, Evde Bakım ve EKPSS maddelerini getirir.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">category: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_ram_special_education_info</td>
                <td className="py-3 px-4 text-muted-foreground">RAM süreçlerini, ÇÖZGER derecelerini ve özel eğitim ödeneklerini sorgular.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">diagnosis: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_accessibility_toggle</td>
                <td className="py-3 px-4 text-muted-foreground">Yüksek kontrast, disleksi fontu ve biyonik okuma tercihlerini günceller.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">feature: string, enabled: boolean</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_get_categories</td>
                <td className="py-3 px-4 text-muted-foreground">5 ana kategori ve 20 alt kategoriyi ajanlara döndürür.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">(Yok)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="p-5 rounded-2xl bg-muted/60 border border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground font-medium">
            Geliştirici entegrasyon kodları, API anahtarları, Raspberry Pi donanım betikleri ve canlı test konsolu yetkili personeller için <strong className="text-foreground">Admin Paneli</strong> içerisine taşınmıştır.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
        >
          Admin Paneline Git
        </Link>
      </div>
    </div>
  );
}
