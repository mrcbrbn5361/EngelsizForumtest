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
    toast.success('Widget kodu panoya kopyalandı!');
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
    const existing = document.getElementById('ef-a11y-trigger');
    if (existing) {
      existing.click();
    } else {
      const script = document.createElement('script');
      script.src = '/api/embed/accessibility.js';
      script.defer = true;
      document.body.appendChild(script);
      toast.success('Erişilebilirlik widget\'ı sayfaya yüklendi! Sağ alt köşedeki ikona tıklayın.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-10 text-[#F8FAFC] font-sans">
      
      {/* 1. Header */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E293B] bg-[#111B2E] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
            <Sparkles size={14} />
            <span>Açık Kaynak Widget & SDK Sistemi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]">
            Erişilebilirlik & <span className="text-indigo-400">WebMCP</span> Widget'ı
          </h1>

          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-3xl leading-relaxed">
            Tek satır HTML koduyla dilediğiniz web sitesine WCAG 2.2 AA uyumlu sesli okuma, disleksi modu, yüksek kontrast ve WebMCP yapay zeka ajan yeteneklerini tamamen ücretsiz ekleyin.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestWidget}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
            >
              <Accessibility size={16} />
              <span>Canlı Widget'ı Test Et</span>
            </button>

            <button
              onClick={handleCopyScript}
              className="px-4 py-2.5 rounded-lg border border-[#1E293B] bg-[#18243A] hover:bg-[#1E293B] text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedScript ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>Entegrasyon Kodunu Kopyala</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Accessibility size={20} />
          </div>
          <h2 className="text-base font-bold text-[#F8FAFC]">WCAG 2.2 AA Standartları</h2>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Sesli okuma, yazı ölçekleme, disleksi fontu ve yüksek kontrast ile tüm erişilebilirlik gereksinimlerini tek tıkla sağlar.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap size={20} />
          </div>
          <h2 className="text-base font-bold text-[#F8FAFC]">Sıfır Maliyet & Yüksek Hız</h2>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Abonelik yok. Edge CDN üzerinden ultra hafif vanilla JS mimarisiyle sitenizin performansını etkilemeden çalışır.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Bot size={20} />
          </div>
          <h2 className="text-base font-bold text-[#F8FAFC]">WebMCP Yapay Zeka</h2>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Model Context Protocol entegrasyonu sayesinde harici siteler ÖTV 2026, Balthazard ve mevzuat robotlarını API olarak çağırabilir.
          </p>
        </div>
      </div>

      {/* 3. Integration Code Generator */}
      <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Code2 size={18} className="text-indigo-400" />
              <span>HTML Entegrasyon Kodu</span>
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              Web sitenizin &lt;/body&gt; kapanış etiketinden hemen önce ekleyin.
            </p>
          </div>

          <button
            onClick={handleCopyScript}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            {copiedScript ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span>Kodu Kopyala</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-5 rounded-lg bg-[#0B1220] border border-[#1E293B] text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner">
            {`<!-- EngelsizForum Erişilebilirlik Widget'ı -->\n${scriptTag}`}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#CBD5E1]">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>WordPress, React, Vue, Next.js ve tüm web altyapıları ile %100 uyumludur.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>Kullanıcıların tercihleri yerel hafızada (localStorage) güvenle saklanır.</span>
          </div>
        </div>
      </div>

      {/* 4. WebMCP Agent Endpoint */}
      <div className="p-6 rounded-xl border border-[#1E293B] bg-[#111B2E] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Terminal size={18} className="text-emerald-400" />
              <span>WebMCP Ajanı Entegrasyonu (JSON-RPC)</span>
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              Harici platformlar ve AI ajanları için 2026 mevzuat hesaplama aracı.
            </p>
          </div>

          <button
            onClick={handleCopyMcp}
            className="px-4 py-2 rounded-md bg-[#18243A] hover:bg-[#1E293B] border border-[#1E293B] text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            {copiedMcp ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span>JS Örneğini Kopyala</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-5 rounded-lg bg-[#0B1220] border border-[#1E293B] text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner">
            {mcpSnippet}
          </pre>
        </div>
      </div>

    </div>
  );
}

