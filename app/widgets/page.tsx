'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  Accessibility, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Bot, 
  CheckCircle2, 
  Terminal,
  Zap,
  Globe,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

export default function WidgetsPortalPage() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState<'right' | 'left'>('right');
  const [testActive, setTestActive] = useState(false);

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://engelsizforum.com';

  const scriptTag = `<script src="${baseUrl}/api/embed/accessibility.js" defer></script>`;

  const mcpSnippet = `// 0 TL WebMCP Ajan Entegrasyonu (Herhangi Bir Node / Browser Uygulaması)
const response = await fetch('${baseUrl}/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'calculate_otv',
      arguments: { price: 2500000, engineDisplacement: 1600 }
    },
    id: 1
  })
});
const result = await response.json();
console.log('2026 ÖTV Hesabı (2.873.972 TL Tavan Denetimi):', result);`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopiedScript(true);
    toast.success('Widget kodu panoya kopyalandı! Kendi sitenizin <body> etiketinin sonuna yapıştırabilirsiniz.');
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyMcp = () => {
    navigator.clipboard.writeText(mcpSnippet);
    setCopiedMcp(true);
    toast.success('WebMCP JavaScript kodu kopyalandı!');
    setTimeout(() => setCopiedMcp(false), 2500);
  };

  const handleTestWidget = () => {
    setTestActive(true);
    // Dynamically trigger or notify
    const existing = document.getElementById('ef-a11y-trigger');
    if (existing) {
      existing.click();
    } else {
      const script = document.createElement('script');
      script.src = '/api/embed/accessibility.js';
      script.defer = true;
      document.body.appendChild(script);
      toast.success('Erişilebilirlik widget\'ı sayfaya yüklendi! Sağ alt köşedeki mavi ikona tıklayın.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-10 text-white font-sans">
      
      {/* 1. Header (Microsoft Fluent & Windows 11 Acrylic Style) */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#1e293b]/60 to-[#0f172a]/80 p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400">
            <Sparkles size={14} />
            <span>0 TL Bütçe ile Açık Kaynak Widget &amp; SDK Sistemi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Diğer Sitelere Eklenebilir <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">Erişilebilirlik &amp; WebMCP</span> Widget&apos;ı
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Pahalı üçüncü taraf erişilebilirlik eklentilerine yıllık binlerce dolar ödemeye son. Tek satır HTML koduyla dilediğiniz web sitesine WCAG 2.1 AAA uyumlu sesli okuma, disleksi modu, yüksek kontrast ve WebMCP yapay zeka ajan yeteneklerini tamamen ücretsiz ekleyin.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestWidget}
              className="px-4 py-2.5 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md shadow-sky-900/30 cursor-pointer"
            >
              <Accessibility size={16} />
              <span>Canlı Widget&apos;ı Şimdi Test Et</span>
            </button>

            <button
              onClick={handleCopyScript}
              className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedScript ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>Tek Satır Kodu Kopyala</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-lg border border-white/5 bg-[#161b22] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Accessibility size={20} />
          </div>
          <h2 className="text-base font-bold text-white">WCAG 2.1 AAA Standartları</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Text-to-speech, yazı ölçekleme, disleksi fontu, sarı-siyah kontrast ve okuma cetveli ile tüm yasal erişilebilirlik gereksinimlerini tek tıkla sağlar.
          </p>
        </div>

        <div className="p-5 rounded-lg border border-white/5 bg-[#161b22] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap size={20} />
          </div>
          <h2 className="text-base font-bold text-white">0 TL Lisans &amp; Sınırsız Hız</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Abonelik yok, gizli ücret yok. Edge CDN üzerinden ultra hafif vanilla JS mimarisiyle sitenizin sayfa açılış hızını asla yavaşlatmaz.
          </p>
        </div>

        <div className="p-5 rounded-lg border border-white/5 bg-[#161b22] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Bot size={20} />
          </div>
          <h2 className="text-base font-bold text-white">WebMCP Yapay Zeka Desteği</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Model Context Protocol entegrasyonu sayesinde harici siteler ÖTV 2026 (2.873.972 TL tavanı), Balthazard ve mevzuat robotlarını API olarak çağırabilir.
          </p>
        </div>
      </div>

      {/* 3. Integration Code Generator */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#161b22] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 size={18} className="text-sky-400" />
              <span>HTML Entegrasyon Kodu</span>
            </h2>
            <p className="text-xs text-slate-400">
              Web sitenizin &lt;/body&gt; kapanış etiketinden hemen önce ekleyin.
            </p>
          </div>

          <button
            onClick={handleCopyScript}
            className="px-3.5 py-1.5 rounded-md bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedScript ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span>Kodu Kopyala</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-lg bg-[#090d13] border border-white/10 text-sky-300 font-mono text-xs overflow-x-auto leading-relaxed">
            {`<!-- EngelsizForum 0 TL Erişilebilirlik Widget'ı -->\n${scriptTag}`}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>WordPress, React, Vue, Next.js, HTML5 ve tüm web altyapıları ile %100 uyumludur.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>Kullanıcıların tarayıcı tercihleri yerel hafızada (localStorage) saklanır.</span>
          </div>
        </div>
      </div>

      {/* 4. WebMCP Agent Endpoint */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#161b22] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal size={18} className="text-purple-400" />
              <span>WebMCP Ajanı Entegrasyonu (JSON-RPC)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Harici platformlar ve AI ajanları için 2026 mevzuat hesaplama aracı.
            </p>
          </div>

          <button
            onClick={handleCopyMcp}
            className="px-3.5 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedMcp ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span>JS Örneğini Kopyala</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-lg bg-[#090d13] border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
            {mcpSnippet}
          </pre>
        </div>
      </div>

    </div>
  );
}
