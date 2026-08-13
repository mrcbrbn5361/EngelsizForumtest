import React from 'react';
import Link from 'next/link';
import { Bot, Sparkles, CheckCircle2, Code2, ArrowLeft, ShieldCheck, Terminal, Layers, Scale, BookOpen, Calculator } from 'lucide-react';

export const metadata = {
  title: 'Chrome WebMCP & Remote MCP Desteği - Türkiye\'de İlk | EngelsizForum',
  description: 'Google Chrome Web Model Context Protocol (WebMCP) ve Remote MCP Sunucu standardını Türkiye\'de ilk uygulayan tam erişilebilir engelli hakları ve topluluk platformu.',
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
            W3C Web ML Community Group & MCP 2024-11-05
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Türkiye&apos;de İlk Yapay Zeka MCP Hub&apos;ı
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Google Chrome WebMCP ve Gemini Web MCP Ajanı
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          EngelsizForum, Google Chrome ve Microsoft ortaklığındaki <strong className="text-foreground">WebMCP</strong> (İstemci) ve <strong className="text-foreground">Remote MCP</strong> (Gemini / Claude / ChatGPT Ajan) standartlarını Türkiye&apos;de uygulayan ilk erişilebilir platformdur. Yapay zeka ajanları artık tüm engelli yasal haklarını, ÖTV 2026 şartlarını, Balthazard hesaplamasını ve mevzuatı anında sorgulayabilir.
        </p>
      </div>

      {/* Gemini Web MCP Server Guide Box */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-foreground">Gemini Web (gemini.google.com) Özel Bağlı Uygulama Kurulumu</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Gemini Web&apos;deki <strong className="text-foreground">&quot;Özel bağlı uygulama oluşturun&quot;</strong> (Custom Connected Apps) menüsüne EngelsizForum&apos;u eklemek için sunucu bağlantısı olarak aşağıdaki URL adresini girmelisiniz:
        </p>

        <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between gap-3 font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 overflow-x-auto">
          <span>https://www.engelsizforum.com/api/mcp</span>
          <span className="text-[11px] font-sans font-normal text-muted-foreground bg-muted px-2 py-1 rounded">Veya /mcp</span>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground uppercase tracking-wider">Adım Adım Kurulum Rehberi:</p>
          <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
            <li><strong>gemini.google.com</strong> adresini açıp ayarlardan veya istem kutusundaki <strong>&quot;Özel bağlı uygulama oluşturun&quot;</strong> seçeneğine tıklayın.</li>
            <li>Bağlantı adresi kutusuna <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">https://www.engelsizforum.com/api/mcp</code> adresini yapıştırın.</li>
            <li>Gemini sunucumuzdaki <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">initialize</code> ve <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">tools/list</code> protokolünü doğrulayarak EngelsizForum araçlarını otomatik tanıyacaktır.</li>
            <li>Artık Gemini istem penceresinde <em>&quot;EngelsizForum&apos;da ÖTV 2026 şartlarını ara&quot;</em>, <em>&quot;%40 engelli raporumla hangi hakları alabilirim?&quot;</em> veya <em>&quot;Balthazard formülü ile %40 ve %20 oranlarını hesapla&quot;</em> diyerek canlı verilere ulaşabilirsiniz!</li>
          </ol>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Ajan Dostu Mimari</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yapay zeka ajanları (Chrome built-in AI, Gemini Ajanları, Claude MCP) DOM taramak yerine doğrudan tanımlı API araçları ile etkileşime girer.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">T.C. Resmi Mevzuat Doğruluğu</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            4760 Sayılı ÖTV Kanunu, 5510 Sayılı SGK Emeklilik Kanunu, ÇÖZGER ve RAM kararlarını anında güncel olarak sorgular.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Çift Katmanlı Entegrasyon</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hem tarayıcı içi `document.modelContext` (WebMCP) hem de sunucu ucu `/api/mcp` (JSON-RPC 2.0 / SSE) üzerinden aynı anda çalışır.
          </p>
        </div>
      </div>

      {/* Exposed Tools Table */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-foreground">EngelsizForum MCP Ajan Araçları Listesi</h2>
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
                <td className="py-3 px-4 text-muted-foreground">ÖTV 2026, EKPSS, Balthazard ve forum konularını arar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">query: string</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_balthazard_calc</td>
                <td className="py-3 px-4 text-muted-foreground">Birden fazla engel oranını Balthazard formülü ile hesaplar.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">rates: number[]</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_disability_rights_guide</td>
                <td className="py-3 px-4 text-muted-foreground">Rapor oranına (%40, %70, %90) göre tüm yasal engelli haklarını sorgular.</td>
                <td className="py-3 px-4 font-mono text-xs text-foreground">reportPercentage: number</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">engelsizforum_legislation_lookup</td>
                <td className="py-3 px-4 text-muted-foreground">ÖTV Kanunu, Emeklilik Cetveli, Evde Bakım ve EKPSS kanun maddelerini sunar.</td>
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

      {/* Code Snippet */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-foreground">Örnek JS Kaydı (`document.modelContext`)</h2>
        </div>

        <pre className="p-4 rounded-xl bg-muted font-mono text-xs text-foreground overflow-x-auto leading-relaxed border border-border">
{`if (document.modelContext && typeof document.modelContext.registerTool === 'function') {
  document.modelContext.registerTool({
    name: 'engelsizforum_disability_rights_guide',
    description: 'Engelli yasal hakları rehberi',
    parameters: {
      reportPercentage: { type: 'number', description: 'Engel oranı yüzdesi', required: true }
    },
    execute: (args) => {
      // Yasal haklar kılavuzu çıktısı
      return { reportPercentage: 40, grantedRights: ['Ücretsiz Toplu Taşıma', 'EKPSS', 'Erken Emeklilik'] };
    }
  });
}`}
        </pre>
      </div>
    </div>
  );
}
