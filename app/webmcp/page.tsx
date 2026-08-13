import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, Sparkles, CheckCircle2, Code2, ArrowLeft, ShieldCheck, Terminal, Layers } from 'lucide-react';

export const metadata = {
  title: 'Chrome WebMCP Desteği - Türkiye\'de İlk | EngelsizForum',
  description: 'Google Chrome Web Model Context Protocol (WebMCP) standardını Türkiye\'de ilk uygulayan tam erişilebilir topluluk platformu.',
};

export default function WebMCPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            W3C Web ML Community Group
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Türkiye&apos;de İlk Entegrasyon
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Google Chrome WebMCP (Web Model Context Protocol) Entegrasyonu
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          EngelsizForum, Google Chrome ve Microsoft tarafından öncülük edilen <strong className="text-foreground">WebMCP</strong> standardını Türkiye&apos;de entegre eden ilk platformdur. Yapay zeka ajanları artık web sitemizi taramak zorunda kalmadan doğrudan tanımlı API araçlarımız ile etkileşime girebilir.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Doğrudan Ajan Erişimi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ajanlar (Chrome built-in AI, Gemini Ajanları) DOM taraması yapmadan `navigator.modelContext` üzerinden EngelsizForum fonksiyonlarına erişir.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">WCAG 2.1 AAA & Güvenlik</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tüm WebMCP çağrıları kullanıcı izni, Origin Isolation ve WCAG erişilebilirlik standartlarına %100 uyumlu olarak gerçekleşir.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Deklaratif & İmperatif Yapı</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hem HTML `toolname` nitelikleri hem de JavaScript `registerTool()` fonksiyonları ile tam kapsama sağlanır.
          </p>
        </div>
      </div>

      {/* Exposed Tools Table */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-foreground">EngelsizForum WebMCP Ajan Araçları</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-3 px-4 font-semibold text-foreground">Araç Adı (Tool Name)</th>
                <th className="py-3 px-4 font-semibold text-foreground">Açıklama</th>
                <th className="py-3 px-4 font-semibold text-foreground">Parametreler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_search</td>
                <td className="py-3 px-4 text-muted-foreground">ÖTV 2026, EKPSS, Balthazard ve mevzuat konularını arar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">query: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_balthazard_calc</td>
                <td className="py-3 px-4 text-muted-foreground">Balthazard formülü ile net engel oranını hesaplar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">rates: number[]</td>
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

      {/* Code Snippet */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-foreground">Örnek Kod Yapısı (`lib/webmcp.ts`)</h2>
        </div>

        <pre className="p-4 rounded-xl bg-muted font-mono text-xs text-foreground overflow-x-auto leading-relaxed border border-border">
{`if (navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
  navigator.modelContext.registerTool({
    name: 'engelsizforum_balthazard_calc',
    description: 'Balthazard engel oranı hesaplama aracı',
    parameters: {
      rates: { type: 'array', description: 'Engel oranları dizisi', required: true }
    },
    execute: (args) => {
      // Balthazard hesaplama algoritması
      return { balthazardScore: 76 };
    }
  });
}`}
        </pre>
      </div>
    </div>
  );
}
