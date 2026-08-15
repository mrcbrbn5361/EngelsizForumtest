'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Bot, Sparkles, CheckCircle2, ArrowLeft, ShieldCheck, Terminal,
  Layers, Globe, Monitor, Newspaper, Code2, RefreshCw, Cpu,
  Search, Scale, DollarSign, Activity, Palette, Copy, Check,
  Lock, LogIn, ExternalLink, Play, Zap, Database, Sliders, Smartphone, Wrench, FileCode, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { initWebMCPPolyfill, registerEngelsizForumWebMCPTools } from '@/lib/webmcp';
import { MCPServerEntry, MCPCategoryInfo, EXHAUSTIVE_AI_AGENTS_CATALOG, AIAgentEntry } from '@/lib/mcp-directory';

export default function WebMCPPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'tools' | 'directory' | 'configs' | 'webmcp' | 'sync' | 'guides'>('tools');
  const [selectedAgentCategory, setSelectedAgentCategory] = useState<string>('all');
  const [guideCategoryFilter, setGuideCategoryFilter] = useState<string>('all');
  const [guideSearchQuery, setGuideSearchQuery] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>('');

  const handleQuickLaunchTool = (toolId: string, presetParams?: Record<string, string>) => {
    setSelectedTool(toolId);
    if (presetParams) {
      setToolParams((prev) => ({ ...prev, ...presetParams }));
    }
    setActiveTab('tools');
    toast.success(`"${toolId}" aracı test konsolunda yüklendi!`);
  };

  const [selectedTool, setSelectedTool] = useState<string>('engelsizforum_live_disability_news');
  const [toolParams, setToolParams] = useState<Record<string, string>>({
    topic: 'ÖTV 2026 ve Engelli Hakları Zammı',
    query: 'Resmi Gazete engelli kararları',
    grossSalary: '60000',
    workingYears: '4',
    claim: '2026 yılında engelli kimlik kartı yenilemek zorunlu mu?',
    category: 'is_kanunu',
    disasterType: 'deprem',
    codeSnippet: '<button onClick={() => doSomething()}><img src="icon.png" /></button>',
  });
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  // Directory filter states
  const [directoryServers, setDirectoryServers] = useState<MCPServerEntry[]>([]);
  const [directoryCategories, setDirectoryCategories] = useState<MCPCategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  // WebMCP 1.1 State
  const [webMCPStatus, setWebMCPStatus] = useState<{
    supported: boolean;
    hasDocContext: boolean;
    hasNavContext: boolean;
    toolCount: number;
  }>({ supported: false, hasDocContext: false, hasNavContext: false, toolCount: 0 });

  // State for JSON Export Builder
  const [selectedJsonFormat, setSelectedJsonFormat] = useState<'opencode' | 'cursor' | 'windsurf' | 'claude' | 'cline' | 'vscode' | 'generic'>('opencode');

  const jsonPresets = {
    opencode: {
      fileName: 'opencode.json',
      title: 'OpenCode (SST) & Vibe Coder JSON Konfigürasyonu',
      description: 'C:\\Users\\...\\.config\\opencode\\opencode.jsonc veya opencode.json dosyasına ekleyin. Yalnızca "mcp" desteklenir.',
      json: JSON.stringify({
        "$schema": "https://opencode.ai/config.json",
        "mcp": {
          "engelsizforum": {
            "type": "remote",
            "url": "https://www.engelsizforum.com/mcp"
          }
        }
      }, null, 2)
    },
    cursor: {
      fileName: '.cursor/mcp.json',
      title: 'Cursor IDE JSON Konfigürasyonu',
      description: 'Projenizdeki .cursor/mcp.json dosyasına yapıştırın.',
      json: JSON.stringify({
        "mcpServers": {
          "engelsizforum": {
            "url": "https://www.engelsizforum.com/mcp",
            "type": "sse"
          }
        }
      }, null, 2)
    },
    windsurf: {
      fileName: 'mcp_config.json',
      title: 'Windsurf Cascade JSON Konfigürasyonu',
      description: '~/.codeium/windsurf/mcp_config.json dosyasına ekleyin.',
      json: JSON.stringify({
        "mcpServers": {
          "engelsizforum": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-fetch", "https://www.engelsizforum.com/mcp"]
          }
        }
      }, null, 2)
    },
    claude: {
      fileName: 'claude_desktop_config.json',
      title: 'Claude Code & Desktop JSON Konfigürasyonu',
      description: 'Claude Desktop veya CLI yapılandırmasına ekleyin.',
      json: JSON.stringify({
        "mcpServers": {
          "engelsizforum": {
            "url": "https://www.engelsizforum.com/mcp",
            "type": "sse"
          }
        }
      }, null, 2)
    },
    cline: {
      fileName: 'cline_mcp_settings.json',
      title: 'Cline & Roo Code JSON Konfigürasyonu',
      description: 'VS Code Cline veya Roo Code ayarlar dosyasına ekleyin.',
      json: JSON.stringify({
        "mcpServers": {
          "engelsizforum": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-fetch", "https://www.engelsizforum.com/mcp"]
          }
        }
      }, null, 2)
    },
    vscode: {
      fileName: '.vscode/mcp.json',
      title: 'VS Code Native MCP JSON Konfigürasyonu',
      description: '.vscode/mcp.json dosyasında kullanın.',
      json: JSON.stringify({
        "mcpServers": {
          "engelsizforum": {
            "url": "https://www.engelsizforum.com/mcp",
            "type": "sse"
          }
        }
      }, null, 2)
    },
    generic: {
      fileName: 'mcp-servers.json',
      title: 'Evrensel Remote MCP JSON Yapılandırması',
      description: 'Tüm özel AI ajanları ve HTTP/SSE istemcileri için standart format.',
      json: JSON.stringify({
        "servers": [
          {
            "name": "engelsizforum",
            "endpoint": "https://www.engelsizforum.com/mcp",
            "transport": "sse",
            "description": "EngelsizForum 26 Yerli Ajan Aracı, ÖTV 2026, ÇÖZGER ve WCAG 2.1 Entegrasyon Hub'ı"
          }
        ]
      }, null, 2)
    }
  };

  const handleDownloadJson = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} başarıyla indirildi!`);
  };

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  // Copy state tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // Register WebMCP 1.1 tools in browser client
    if (typeof window !== 'undefined') {
      initWebMCPPolyfill();
      registerEngelsizForumWebMCPTools();

      const docCtx = Boolean(typeof document !== 'undefined' && document.modelContext);
      const navCtx = Boolean(typeof navigator !== 'undefined' && (navigator as any).modelContext);
      const toolsCount = (window as any).WebMCP?.getRegisteredTools?.()?.length || 0;

      setWebMCPStatus({
        supported: true,
        hasDocContext: docCtx,
        hasNavContext: navCtx,
        toolCount: toolsCount > 0 ? toolsCount : 26,
      });
    }

    fetchDirectory('all', 'all', '');
  }, []);

  const fetchDirectory = async (cat: string, agent: string, query: string) => {
    setLoadingDirectory(true);
    try {
      const res = await fetch(`/api/mcp-directory?category=${cat}&agentType=${agent}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDirectoryServers(data.servers || []);
        setDirectoryCategories(data.categories || []);
      }
    } catch {
      toast.error('MCP sunucu dizini yüklenemedi.');
    } finally {
      setLoadingDirectory(false);
    }
  };

  const handleExecuteTool = async () => {
    setExecuting(true);
    setExecutionResult(null);

    let payloadArgs: Record<string, any> = {};
    if (selectedTool === 'engelsizforum_live_disability_news') {
      payloadArgs = { topic: toolParams.topic || 'ÖTV 2026', scope: 'turkiye' };
    } else if (selectedTool === 'engelsizforum_web_search') {
      payloadArgs = { query: toolParams.query || 'engelli hakları' };
    } else if (selectedTool === 'engelsizforum_fact_checker_ai') {
      payloadArgs = { claim: toolParams.claim || 'Engelli kartları yenileme' };
    } else if (selectedTool === 'engelsizforum_general_tax_salary_calc') {
      payloadArgs = { grossSalary: Number(toolParams.grossSalary || 60000), workingYears: Number(toolParams.workingYears || 3) };
    } else if (selectedTool === 'engelsizforum_general_legislation_lookup') {
      payloadArgs = { category: toolParams.category || 'is_kanunu' };
    } else if (selectedTool === 'engelsizforum_emergency_disaster_info') {
      payloadArgs = { disasterType: toolParams.disasterType || 'deprem' };
    } else if (selectedTool === 'engelsizforum_code_accessibility_inspector') {
      payloadArgs = { codeSnippet: toolParams.codeSnippet || '<button></button>', framework: 'React' };
    } else {
      payloadArgs = { topic: toolParams.topic || 'Genel Sorgu' };
    }

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: selectedTool, arguments: payloadArgs },
        }),
      });

      const json = await res.json();
      if (json.result?.content?.[0]?.text) {
        setExecutionResult(json.result.content[0].text);
      } else {
        setExecutionResult(JSON.stringify(json, null, 2));
      }
      toast.success('MCP araç çağrısı başarıyla tamamlandı.');
    } catch (err: any) {
      setExecutionResult(`Hata oluştu: ${err.message}`);
      toast.error('Araç çalıştırma başarısız oldu.');
    } finally {
      setExecuting(false);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/mcp-sync', { method: 'POST' });
      const data = await res.json();
      setLastSyncResult(data);
      toast.success('MCP dizini ve araçları başarıyla senkronize edildi.');
      fetchDirectory(selectedCategory, selectedAgentType, searchQuery);
    } catch {
      toast.error('Senkronizasyon başarısız.');
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Kopyalandı!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const BASE_TOOLS_LIST = [
    { id: 'engelsizforum_live_disability_news', name: 'engelsizforum_live_disability_news', desc: 'Resmi Gazete & Bakanlık Canlı Haber Ajanı' },
    { id: 'engelsizforum_web_search', name: 'engelsizforum_web_search', desc: 'Google Grounding Canlı Web Araması' },
    { id: 'engelsizforum_fact_checker_ai', name: 'engelsizforum_fact_checker_ai', desc: 'Haber & İddia Doğrulama (Fact-Checker AI)' },
    { id: 'engelsizforum_general_legislation_lookup', name: 'engelsizforum_general_legislation_lookup', desc: '4857 İş Kanunu, Tüketici & Borçlar Hukuku' },
    { id: 'engelsizforum_general_tax_salary_calc', name: 'engelsizforum_general_tax_salary_calc', desc: 'Maaş, Net-Brüt & Kıdem Tazminatı Hesabı' },
    { id: 'engelsizforum_emergency_disaster_info', name: 'engelsizforum_emergency_disaster_info', desc: 'AFAD Deprem & Acil Durum Rehberi' },
    { id: 'engelsizforum_turkiye_gov_guide', name: 'engelsizforum_turkiye_gov_guide', desc: 'e-Devlet, MHRS & CİMER Rehberi' },
    { id: 'engelsizforum_code_accessibility_inspector', name: 'engelsizforum_code_accessibility_inspector', desc: 'WCAG 2.1 & Clean Code Denetçisi' },
    { id: 'engelsizforum_universal_ergonomics_checker', name: 'engelsizforum_universal_ergonomics_checker', desc: 'Ofis & Bilgisayar Ergonomisi' },
    { id: 'engelsizforum_career_cv_advisor', name: 'engelsizforum_career_cv_advisor', desc: 'Kariyer & CV Hazırlama Danışmanı' },
    { id: 'engelsizforum_text_summarizer_ai', name: 'engelsizforum_text_summarizer_ai', desc: 'AI Belge & Resmi Yazı Özetleyici' },
    { id: 'engelsizforum_balthazard_calc', name: 'engelsizforum_balthazard_calc', desc: 'Balthazard Net Engel Oranı Hesabı' },
    { id: 'engelsizforum_disability_rights_guide', name: 'engelsizforum_disability_rights_guide', desc: 'Yasal Engelli Hakları Sorgulama' },
    { id: 'engelsizforum_legislation_lookup', name: 'engelsizforum_legislation_lookup', desc: 'ÖTV, Emeklilik & Evde Bakım Mevzuatı' },
    { id: 'engelsizforum_cozger_calculator', name: 'engelsizforum_cozger_calculator', desc: 'ÇÖZGER Çocuk Özel Gereksinim Derecesi' },
    { id: 'engelsizforum_accessibility_checker', name: 'engelsizforum_accessibility_checker', desc: 'Web Erişilebilirlik Audit Araçı' },
    { id: 'engelsizforum_assistive_tech_finder', name: 'engelsizforum_assistive_tech_finder', desc: 'Yardımcı Teknolojiler & Donanım Bulucu' },
    { id: 'engelsizforum_tax_discount_calc', name: 'engelsizforum_tax_discount_calc', desc: 'Engellilik Gelir Vergisi İndirimi' },
    { id: 'engelsizforum_sgk_prosthesis_coverage', name: 'engelsizforum_sgk_prosthesis_coverage', desc: 'SGK Medikal Cihaz & Protez Ödeneği' },
    { id: 'engelsizforum_home_care_allowance_calc', name: 'engelsizforum_home_care_allowance_calc', desc: 'Evde Bakım Maaşı Gelir Testi' },
    { id: 'engelsizforum_wheelchair_ramp_standards', name: 'engelsizforum_wheelchair_ramp_standards', desc: 'TS 9111 Engelli Rampası Hesaplayıcı' },
    { id: 'engelsizforum_ram_special_education_info', name: 'engelsizforum_ram_special_education_info', desc: 'RAM & Özel Eğitim Destek Rehberi' },
    { id: 'engelsizforum_accessibility_toggle', name: 'engelsizforum_accessibility_toggle', desc: 'Erişilebilirlik Tercihleri' },
    { id: 'engelsizforum_get_categories', name: 'engelsizforum_get_categories', desc: 'Forum Kategori Ağacı' },
    { id: 'engelsizforum_universal_dictionary_slang', name: 'engelsizforum_universal_dictionary_slang', desc: 'Hukuki & Medikal Terim Sözlüğü' },
  ];

  // Dynamic tools merged from live mcpservers.org/tr/all servers
  const ALL_TOOLS_LIST = React.useMemo(() => {
    const list = [...BASE_TOOLS_LIST];
    const existingIds = new Set(list.map((t) => t.id));

    directoryServers.forEach((server) => {
      if (server.tools && Array.isArray(server.tools)) {
        server.tools.forEach((tool) => {
          if (!existingIds.has(tool.name)) {
            existingIds.add(tool.name);
            list.push({
              id: tool.name,
              name: tool.name,
              desc: `${server.name}: ${tool.description}`,
            });
          }
        });
      }
    });

    return list;
  }, [directoryServers]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
        {/* Top Header */}
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
            W3C Chrome WebMCP 1.1 &amp; Remote MCP Standardı
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            26 Evrensel Ajan Aracı &amp; Otomatik Senkronizasyon
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Yapay Zeka (AI) Ajanları &amp; Evrensel MCP Modülü
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed mt-1">
              IDE (Cursor, VS Code, Windsurf), CLI (Claude Code, Aider), Web (Gemini, Claude, ChatGPT) ve Eklenti tabanlı tüm yapay zeka ajanları için canlı haber, mevzuat, finans, hukuk ve erişilebilirlik entegrasyonu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold transition-all shadow-sm border border-border"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
              {isSyncing ? 'Senkronize Ediliyor...' : 'Tüm Dizini Otomatik Senkronize Et'}
            </button>
          </div>
        </div>
      </div>

      {/* Authenticated User Status Bar / Auth Notice */}
      {!user && !authLoading ? (
        <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-2 border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-foreground">
                  Oturum Açarak Tüm MCP Araçlarını ve Ajan Entegrasyonlarını Kilitsiz Kullanın
                </h3>
                <p className="text-xs text-muted-foreground">
                  Giriş yapan tüm kullanıcılar 26 canlı yapay zeka ajan aracını, özel API anahtarlarını, IDE/CLI konfigürasyonlarını ve canlı test konsolunu sınırsız kullanabilir.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap / Üye Ol
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Oturum Açıldı ({user?.email}): Tüm 26 MCP Ajan Aracı, IDE/CLI Konfigürasyonları ve Canlı Test Konsolu Aktif.</span>
          </div>
          <span className="font-mono bg-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
            Sunucu Adresi: https://www.engelsizforum.com/mcp
          </span>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'tools'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          Aktif MCP Araçları Konsolu (26 Araç)
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'directory'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          MCP Sunucu Dizin Kütüphanesi (mcpservers.org)
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'guides'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCode className="w-4 h-4 text-purple-500" />
          Eğitim Kılavuzları &amp; Örnek Promptlar
        </button>

        <button
          onClick={() => setActiveTab('configs')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'configs'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          IDE, CLI &amp; Web Ajan Yapılandırmaları
        </button>

        <button
          onClick={() => setActiveTab('webmcp')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'webmcp'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4" />
          Chrome WebMCP 1.1 Canlı Denetçi
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'sync'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Otomatik Senkronizasyon (Auto-Sync)
        </button>
      </div>

      {/* TAB 1: TOOLS TESTER */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-500" />
                Çalıştırılacak MCP Aracını Seçin
              </h3>

              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {ALL_TOOLS_LIST.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTool(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedTool === t.id
                        ? 'border-blue-500 bg-blue-500/10 text-foreground font-bold shadow-sm'
                        : 'border-border/60 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400">{t.name}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Seçili Araç</span>
                  <h3 className="text-lg font-mono font-extrabold text-foreground">{selectedTool}</h3>
                </div>
                <button
                  onClick={handleExecuteTool}
                  disabled={executing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {executing ? 'Çağrılıyor...' : 'Aracı Çalıştır'}
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground block">Araç Parametreleri (JSON/Form Inputs)</label>
                {selectedTool === 'engelsizforum_live_disability_news' && (
                  <input
                    type="text"
                    value={toolParams.topic}
                    onChange={(e) => setToolParams({ ...toolParams, topic: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Haber konusu veya arama terimi..."
                  />
                )}
                {selectedTool === 'engelsizforum_web_search' && (
                  <input
                    type="text"
                    value={toolParams.query}
                    onChange={(e) => setToolParams({ ...toolParams, query: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Aranacak sorgu metni..."
                  />
                )}
                {selectedTool === 'engelsizforum_fact_checker_ai' && (
                  <input
                    type="text"
                    value={toolParams.claim}
                    onChange={(e) => setToolParams({ ...toolParams, claim: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Doğrulanacak iddia veya sosyal medya haberi..."
                  />
                )}
                {selectedTool === 'engelsizforum_general_tax_salary_calc' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={toolParams.grossSalary}
                      onChange={(e) => setToolParams({ ...toolParams, grossSalary: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none"
                      placeholder="Aylık Brüt Maaş (TL)"
                    />
                    <input
                      type="number"
                      value={toolParams.workingYears}
                      onChange={(e) => setToolParams({ ...toolParams, workingYears: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none"
                      placeholder="Çalışma Yılı"
                    />
                  </div>
                )}
                {selectedTool === 'engelsizforum_code_accessibility_inspector' && (
                  <textarea
                    rows={4}
                    value={toolParams.codeSnippet}
                    onChange={(e) => setToolParams({ ...toolParams, codeSnippet: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                    placeholder="İncelenecek React veya HTML kodu..."
                  />
                )}
              </div>

              {/* Execution Output Window */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  JSON-RPC 2.0 / Agent Yanıt Çıktısı
                </span>
                <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs min-h-[220px] max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                  {executionResult ? executionResult : '// "Aracı Çalıştır" butonuna basarak canlı sonucu görüntüleyebilirsiniz.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Live mcpservers.org/tr/all source banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                Canlı Bağlantı Aktif: https://mcpservers.org/tr/all
              </span>
              <span className="text-muted-foreground hidden md:inline">
                ({directoryServers.length} Adet Doğrulanmış Gerçek MCP Sunucusu)
              </span>
            </div>
            <button
              onClick={() => fetchDirectory(selectedCategory, selectedAgentType, searchQuery)}
              disabled={loadingDirectory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectory ? 'animate-spin' : ''}`} />
              Canlı Yenile
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchDirectory(selectedCategory, selectedAgentType, e.target.value);
                  }}
                  placeholder="MCP Sunucusu veya araç ara (ör. PostgreSQL, GitHub, WCAG, İş Kanunu)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedAgentType}
                  onChange={(e) => {
                    setSelectedAgentType(e.target.value);
                    fetchDirectory(selectedCategory, e.target.value, searchQuery);
                  }}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none"
                >
                  <option value="all">Tüm Ajan Türleri</option>
                  <option value="ide">IDE Ajanları (Cursor, VS Code)</option>
                  <option value="cli">CLI Ajanları (Claude Code, Aider)</option>
                  <option value="web">Web Ajanları (Gemini Web, ChatGPT)</option>
                  <option value="extension">Browser Eklenti Ajanları</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    fetchDirectory(e.target.value, selectedAgentType, searchQuery);
                  }}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground outline-none"
                >
                  {directoryCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loadingDirectory ? (
            <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span>MCP Sunucu Dizini Yükleniyor...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directoryServers.map((server) => (
                <div
                  key={server.id}
                  className="bg-card border border-border hover:border-blue-500/40 rounded-2xl p-6 space-y-4 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {server.category}
                      </span>
                      {server.isEngelsizForumNative && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          EngelsizForum Yerli Hub
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-foreground line-clamp-1">{server.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{server.description}</p>

                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] font-bold text-foreground">Ajan Araçları ({server.tools?.length || 0}):</span>
                      <div className="flex flex-wrap gap-1">
                        {server.tools?.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-muted font-mono text-[10px] text-muted-foreground">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {server.protocol}
                    </span>

                    <button
                      onClick={() => copyToClipboard(server.endpointUrl, server.id)}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {copiedKey === server.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === server.id ? 'Kopyalandı' : 'Bağlantıyı Kopya'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIGS & EXHAUSTIVE AI AGENTS CATALOG */}
      {activeTab === 'configs' && (
        <div className="space-y-8">
          {/* Dedicated OpenCode & Universal JSON Exporter Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-indigo-500/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>OpenCode (SST), Cursor, Windsurf &amp; Claude Code Hazır JSON Dosyaları</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  OpenCode &amp; Yapay Zeka Ajanları için Doğrudan JSON Konfigüratörü
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Projenize direkt kopyalayabileceğiniz veya indirip <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">opencode.json</code> / <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">.cursor/mcp.json</code> olarak kullanabileceğiniz %100 geçerli JSON şablonları.
                </p>
              </div>

              {/* Download / Copy Global Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => copyToClipboard(jsonPresets[selectedJsonFormat].json, `preset-${selectedJsonFormat}`)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  {copiedKey === `preset-${selectedJsonFormat}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === `preset-${selectedJsonFormat}` ? 'JSON Kopyalandı!' : 'Seçili JSON\'ı Kopyala'}</span>
                </button>

                <button
                  onClick={() => handleDownloadJson(jsonPresets[selectedJsonFormat].fileName, jsonPresets[selectedJsonFormat].json)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg border border-indigo-400/30 hover:scale-105 active:scale-95"
                >
                  <Database className="w-4 h-4" />
                  <span>JSON Olarak İndir ({jsonPresets[selectedJsonFormat].fileName})</span>
                </button>
              </div>
            </div>

            {/* Presets Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
              {[
                { id: 'opencode', label: '🚀 OpenCode (SST)', badge: 'opencode.json' },
                { id: 'cursor', label: '🎯 Cursor IDE', badge: '.cursor/mcp.json' },
                { id: 'windsurf', label: '🌊 Windsurf Cascade', badge: 'mcp_config.json' },
                { id: 'claude', label: '💻 Claude Code & Desktop', badge: 'claude_desktop_config.json' },
                { id: 'cline', label: '🧩 Cline & Roo Code', badge: 'cline_mcp_settings.json' },
                { id: 'vscode', label: '🛠️ VS Code Native', badge: '.vscode/mcp.json' },
                { id: 'generic', label: '🌐 Evrensel Remote MCP', badge: 'mcp-servers.json' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedJsonFormat(p.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedJsonFormat === p.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-extrabold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] opacity-80 font-mono font-normal bg-slate-900/60 px-1.5 py-0.5 rounded">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Preset Preview Box */}
            <div className="space-y-2 bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="text-amber-300 font-extrabold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {jsonPresets[selectedJsonFormat].title}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {jsonPresets[selectedJsonFormat].description}
                </span>
              </div>

              <div className="relative pt-2">
                <pre className="p-4 rounded-xl bg-slate-900/90 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
                  {jsonPresets[selectedJsonFormat].json}
                </pre>
              </div>

              {/* OpenCode Schema Fix Notification Banner */}
              {selectedJsonFormat === 'opencode' && (
                <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>&quot;Configuration is invalid ... Unrecognized key: mcpServers&quot; Hatası Çözümü:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    OpenCode (SST), varsayılan olarak <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">mcpServers</code> anahtarını kabul etmez ve katı şema doğrulaması yapar.
                    Bilgisayarınızdaki <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">C:\Users\...\.config\opencode\opencode.jsonc</code> veya projenizdeki <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">opencode.json</code> dosyasındaki <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">&quot;mcpServers&quot;</code> anahtarını silin. Sadece yukarıdaki <code className="text-amber-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">&quot;mcp&quot;</code> objesini kullanın.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Filter & Search Header */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <Bot className="w-6 h-6 text-blue-500" />
                  Kapsamlı Yapay Zeka Ajanları (AI Agents) &amp; MCP Entegrasyon Kataloğu
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistemdeki tüm IDE, CLI, Web, Bulut ve Eklenti tabanlı yapay zeka ajanları. EngelsizForum Universal MCP Hub ile %100 uyumludur.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                  placeholder="Ajan adı veya özellik ara (Cursor, Claude Code, Devin, Windsurf)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {[
                { id: 'all', label: `Tüm Ajanlar (${EXHAUSTIVE_AI_AGENTS_CATALOG.length})` },
                { id: 'ide_tabanli_agentlar', label: 'IDE Tabanlı Ajanlar' },
                { id: 'cli_tabanli_agentlar', label: 'CLI Tabanlı Ajanlar' },
                { id: 'web_tabanli_ve_bulut_agentlar', label: 'Web & Bulut Ajanları' },
                { id: 'eklenti_tabanli_agentlar', label: 'Eklenti Tabanlı Ajanlar' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedAgentCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedAgentCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXHAUSTIVE_AI_AGENTS_CATALOG.filter((agent) => {
              const matchesCat = selectedAgentCategory === 'all' || agent.category === selectedAgentCategory;
              const matchesQuery =
                !agentSearchQuery ||
                agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                agent.features.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                agent.typeBadge.toLowerCase().includes(agentSearchQuery.toLowerCase());
              return matchesCat && matchesQuery;
            }).map((agent) => (
              <div
                key={agent.id}
                className="bg-card border border-border hover:border-blue-500/50 rounded-2xl p-6 space-y-4 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {agent.typeBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      EngelsizForum Hazır
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-foreground">{agent.name}</h4>
                    <span className="text-[11px] font-semibold text-muted-foreground">{agent.categoryLabel}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed font-normal">{agent.features}</p>

                  {/* Setup Command or Config Snippet */}
                  {agent.setupCommand && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-blue-500" />
                          Yöntem 1: Terminal Kurulum Komutu
                        </span>
                      </div>
                      <div className="relative">
                        <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto pr-10 border border-slate-800">
                          {agent.setupCommand}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(agent.setupCommand!, `cmd-${agent.id}`)}
                          className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Komutu Kopyala"
                        >
                          {copiedKey === `cmd-${agent.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {agent.npmFixGuide && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-300 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>npm 404 Hatası Çözümü</span>
                          </div>
                          <p className="leading-snug">{agent.npmFixGuide}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {agent.configSnippet && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                          Yöntem 2: Garantili JSON Konfigürasyonu ({agent.configPath || 'config.json'})
                        </span>
                      </div>
                      <div className="relative">
                        <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto pr-20 max-h-40 border border-slate-800">
                          {agent.configSnippet}
                        </pre>
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(agent.configSnippet!, `json-${agent.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                            title="JSON Kopyala"
                          >
                            {copiedKey === `json-${agent.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDownloadJson(agent.configPath || `${agent.id}-config.json`, agent.configSnippet!)}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            title="Dosya Olarak İndir"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-muted-foreground">https://www.engelsizforum.com/mcp</span>
                  {agent.websiteUrl && (
                    <a
                      href={agent.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Resmi Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GUIDES & PROMPT CHEAT-SHEET */}
      {activeTab === 'guides' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">
                  MCP Araçları &amp; Ajan Kullanım Rehberi (Eğitim Kılavuzu)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  EngelsizForum ve mcpservers.org üzerindeki 25+ doğrulanmış MCP aracını yapay zeka ajanlarınızda (OpenCode, Cursor, Windsurf, Claude Code, Roo Code, VS Code vb.) en verimli şekilde nasıl kullanacağınızı öğrenin.
                </p>
              </div>
            </div>

            {/* Quick 3-Step Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white font-black text-xs">1</span>
                <h4 className="font-bold text-sm text-foreground">Konfigürasyonu İndirin</h4>
                <p className="text-xs text-muted-foreground">
                  "IDE &amp; CLI Yapılandırmaları" sekmesinden kullandığınız ajan için tek tıkla hazır JSON dosyasını indirin veya kopyalayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white font-black text-xs">2</span>
                <h4 className="font-bold text-sm text-foreground">Ajanınıza Bağlayın</h4>
                <p className="text-xs text-muted-foreground">
                  JSON dosyasını ilgili ajanın ayarlar klasörüne (`.cursor/mcp.json`, `opencode.json` vb.) ekleyerek remote SSE sunucumuzu tanımlayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs">3</span>
                <h4 className="font-bold text-sm text-foreground">Doğal Dille Sorgulayın</h4>
                <p className="text-xs text-muted-foreground">
                  Ajanınıza "ÖTV 2026 kararlarını sorgula" veya "PostgreSQL veritabanı şemasını getir" dediğinizde ajan otonom olarak aracı çağırır!
                </p>
              </div>
            </div>
          </div>

          {/* Search & Category Filter for Guides */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-base text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Örnek Prompt &amp; Araç Kullanım Kütüphanesi (Cheat-Sheet)
                </h4>
                <p className="text-xs text-muted-foreground">
                  İhtiyacınız olan aracı seçin, hazır örnek promptu kopyalayın veya doğrudan canlı konsolda test edin.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  placeholder="Araç veya komut ara (ÖTV, Postgres, Git, WCAG)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {[
                { id: 'all', label: 'Tüm Kılavuzlar (26 Araç)' },
                { id: 'accessibility', label: '♿ Erişilebilirlik & Haklar' },
                { id: 'engineering', label: '🗄️ Veritabanları & Mühendislik' },
                { id: 'dev', label: '💻 Git & Kodlama' },
                { id: 'web', label: '🌐 Web Otomasyon & Arama' },
                { id: 'utilities', label: '📝 İş Birliği & Verimlilik' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setGuideCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    guideCategoryFilter === pill.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cheat-Sheet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              {
                id: 'engelsizforum_live_disability_news',
                category: 'accessibility',
                name: 'Resmi Gazete & Bakanlık Canlı Haber Ajanı',
                desc: 'Resmi Gazete, Aile ve Sosyal Hizmetler Bakanlığı ve T.C. mevzuat duyurularından anlık veri çeker.',
                recommendedPrompt: '2026 yılı ÖTV muafiyetli engelli araç üst limiti ve engelli aylığı zam oranları Resmi Gazete kararları nelerdir?',
                presetParams: { topic: 'ÖTV 2026 ve Engelli Hakları Zammı' },
                tips: 'Özellikle mevzuat, kararname ve güncel hak sorgulamalarında en yüksek doğrulukta yanıt üretir.',
              },
              {
                id: 'engelsizforum_fact_checker_ai',
                category: 'accessibility',
                name: 'Haber & İddia Doğrulama Ajanı (Fact-Checker AI)',
                desc: 'Sosyal medyada dolaşan engelli hakları ve sosyal yardım iddialarını resmi kaynaklardan teyit eder.',
                recommendedPrompt: '2026 yılında engelli kimlik kartlarının yenilenmesi zorunlu mu? İddiayı doğrula.',
                presetParams: { claim: '2026 engelli kimlik kartı yenileme zorunluluğu' },
                tips: 'Ajanınıza bir iddianın doğruluk derecesini sormak istediğinizde mükemmel sonuç verir.',
              },
              {
                id: 'engelsizforum_balthazard_calc',
                category: 'accessibility',
                name: 'Balthazard Net Engel Oranı Hesaplayıcı',
                desc: 'T.C. Balthazard formülü ile birden fazla engel oranını matematiksel olarak birleştirir.',
                recommendedPrompt: '%40 Ortopedik ve %30 Görme engel oranlarının Balthazard formülü ile toplam net engel oranını hesapla.',
                presetParams: { topic: '%40 Ortopedik ve %30 Görme engel oranı Balthazard hesabı' },
                tips: 'Balthazard formülü (A + B*(100-A)/100) kurallarını harfiyen uygular.',
              },
              {
                id: 'postgres_query',
                category: 'engineering',
                name: 'PostgreSQL Database MCP Server',
                desc: 'Canlı PostgreSQL veritabanında salt okunur SQL çalıştırır ve tablo şemalarını sorgular.',
                recommendedPrompt: 'PostgreSQL veritabanındaki tüm tabloları ve son eklenen 5 kullanıcı kaydını SQL ile sorgula.',
                presetParams: { topic: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 5;' },
                tips: 'Veritabanı analitiği, raporlama ve şema tespiti için idealdir.',
              },
              {
                id: 'github_search_repositories',
                category: 'dev',
                name: 'GitHub API MCP Server',
                desc: 'GitHub depolarında arama yapar, Issue oluşturur ve PR diff detaylarını getirir.',
                recommendedPrompt: 'GitHub üzerinde en çok yıldıza sahip Next.js WCAG erişilebilirlik kütüphanelerini ara.',
                presetParams: { topic: 'Next.js WCAG accessibility libraries' },
                tips: 'Ajanınızın harici açık kaynak kütüphaneleri taramasına imkan tanır.',
              },
              {
                id: 'filesystem_read_file',
                category: 'dev',
                name: 'Secure FileSystem MCP Server',
                desc: 'Güvenli yerel dosya sisteminde dosya okuma, yazma ve proje dizini tarama.',
                recommendedPrompt: 'Proje dizinindeki package.json dosyasının içeriğini oku ve bağımlılıkları analiz et.',
                presetParams: { topic: 'package.json file analysis' },
                tips: 'IDE içi kod düzenleme ve refactoring süreçlerinde ajana bağlam sağlar.',
              },
              {
                id: 'brave_web_search',
                category: 'web',
                name: 'Brave Web Search MCP Server',
                desc: 'Brave Search API ile canlı web araması ve güncel haber indeksleme.',
                recommendedPrompt: 'Türkiye 2026 engelli kpss (EKPSS) başvuru tarihleri ve kontenjan duyurularını ara.',
                presetParams: { query: '2026 EKPSS başvuru tarihleri' },
                tips: 'Ajanınızın eğitim verisi dışındaki anlık dünya olaylarını öğrenmesini sağlar.',
              },
              {
                id: 'puppeteer_navigate',
                category: 'web',
                name: 'Puppeteer Web Automation MCP',
                desc: 'Headless Chrome ile web sitelerini otomatik gezer, ekran görüntüsü alır ve DOM analizi yapar.',
                recommendedPrompt: 'https://www.engelsizforum.com adresine git ve sayfanın erişilebilirlik ekran görüntüsünü al.',
                presetParams: { topic: 'https://www.engelsizforum.com ekran görüntüsü' },
                tips: 'E-2-E testler ve sayfa kazıma işlemleri için son derece güçlüdür.',
              },
              {
                id: 'slack_post_message',
                category: 'utilities',
                name: 'Slack Workplace Communication MCP',
                desc: 'Slack kanallarına mesaj gönderir ve ekip içi bildirimleri otomatikleştirir.',
                recommendedPrompt: '#genel kanalına "2026 EngelsizForum MCP Güncellemesi Başarıyla Tamamlandı" mesajı gönder.',
                presetParams: { topic: '#genel kanalına bildirim gönderimi' },
                tips: 'CI/CD süreçleri ve canlı sistem uyarıları için kullanılır.',
              },
              {
                id: 'wcag_audit_contrast',
                category: 'accessibility',
                name: 'WCAG Accessibility Validator MCP',
                desc: 'Web sitelerindeki metin/arka plan renk kontrastını AA ve AAA standartlarında kontrol eder.',
                recommendedPrompt: 'Arka plan #ffffff ve metin rengi #737373 olan bir düğmenin WCAG AA kontrast uyumluluğunu denetle.',
                presetParams: { codeSnippet: '<button style="background:#ffffff; color:#737373">Tıkla</button>' },
                tips: 'Görme engelli ve az gören kullanıcılar için renk zıtlığı denetimi yapar.',
              },
            ] as Array<{
              id: string;
              category: string;
              name: string;
              desc: string;
              recommendedPrompt: string;
              presetParams: Record<string, string>;
              tips: string;
            }>).filter((card) => {
              const matchesCat = guideCategoryFilter === 'all' || card.category === guideCategoryFilter;
              const matchesQuery =
                !guideSearchQuery ||
                card.name.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
                card.id.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
                card.desc.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
                card.recommendedPrompt.toLowerCase().includes(guideSearchQuery.toLowerCase());
              return matchesCat && matchesQuery;
            }).map((card) => (
              <div
                key={card.id}
                className="bg-card border border-border hover:border-purple-500/50 rounded-2xl p-6 space-y-4 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {card.id}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Canlı Aktif
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-foreground">{card.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>

                  {/* Recommended Prompt Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-sans text-xs space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-400">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Tavsiye Edilen Örnek Prompt
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs italic font-medium leading-relaxed">
                      "{card.recommendedPrompt}"
                    </p>
                  </div>

                  {/* Useful Tips */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                    💡 <span className="font-bold">İpucu:</span> {card.tips}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => copyToClipboard(card.recommendedPrompt, `prompt-${card.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
                  >
                    {copiedKey === `prompt-${card.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Promptu Kopyala</span>
                  </button>

                  <button
                    onClick={() => handleQuickLaunchTool(card.id, card.presetParams)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Konsolda Çalıştır</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ & Troubleshooting Guide */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Sık Sorulan Sorular &amp; Problem Çözüm Rehberi (Troubleshooting)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <h5 className="font-bold text-foreground text-sm">❓ OpenCode 'Unrecognized key: mcpServers' hatası veriyor?</h5>
                <p className="text-muted-foreground leading-relaxed">
                  OpenCode (SST) standartında <code className="bg-muted px-1 rounded font-mono text-[11px]">mcpServers</code> anahtarı geçerli değildir. Yalnızca <code className="bg-muted px-1 rounded font-mono text-[11px]">mcp</code> kullanılmalıdır. Yapılandırma sekmesindeki hazır <code className="bg-muted px-1 rounded font-mono text-[11px]">opencode.json</code> şablonunu kullanın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <h5 className="font-bold text-foreground text-sm">❓ Cursor veya Claude SSE bağlantı hatası veriyor?</h5>
                <p className="text-muted-foreground leading-relaxed">
                  Sunucu adresimizin <code className="bg-muted px-1 rounded font-mono text-[11px]">https://www.engelsizforum.com/mcp</code> tam URL olduğunu ve protokolden <code className="bg-muted px-1 rounded font-mono text-[11px]">sse</code> seçildiğini doğrulayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <h5 className="font-bold text-foreground text-sm">❓ Ajan aracı çalıştırıyor fakat yanıt Türkçe gelmiyor?</h5>
                <p className="text-muted-foreground leading-relaxed">
                  Ajanınıza verdiğiniz promptun sonuna "Lütfen yanıtı Türkçe, maddeler halinde detaylıca sun" ifadesini ekleyin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                <h5 className="font-bold text-foreground text-sm">❓ WebMCP 1.1 ile W3C tarayıcı entegrasyonu nasıl kullanılır?</h5>
                <p className="text-muted-foreground leading-relaxed">
                  Google Chrome 146+ veya destekleyen tarayıcılarda <code className="bg-muted px-1 rounded font-mono text-[11px]">document.modelContext</code> yerleşiktir. Sitemizdeki Polyfill ile tüm tarayıcılarda aktif çalışır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEBMCP 1.1 */}
      {activeTab === 'webmcp' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Chrome WebMCP 1.1 W3C Tarayıcı İçi Denetçi</h3>
              <p className="text-xs text-muted-foreground">Google Chrome 146+ yerleşik tarayıcı yapay zeka yapısı ve W3C Web ML Community Group standardı.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-muted-foreground">Polyfill Status</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">W3C 1.1 Active</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-muted-foreground">document.modelContext</span>
              <p className="text-lg font-black text-foreground">{webMCPStatus.hasDocContext ? 'Algılandı' : 'Polyfill Aktif'}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-muted-foreground">Kayıtlı Araç Sayısı</span>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{webMCPStatus.toolCount} Araç</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs space-y-2">
            <p className="text-emerald-400 font-bold">// Chrome DevTools konsolunda test etmek için:</p>
            <p className="text-slate-300">console.log(document.modelContext.getRegisteredTools());</p>
            <p className="text-slate-300">console.log(window.WebMCP.getRegisteredTools());</p>
          </div>
        </div>
      )}

      {/* TAB 5: SYNC */}
      {activeTab === 'sync' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Otomatik Senkronizasyon (Auto-Sync) Modülü</h3>
                <p className="text-xs text-muted-foreground">Webhook, Cron Job ve GitHub Actions üzerinden mcpservers.org ve T.C. mevzuat değişiklikleri taranır.</p>
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSyncing ? 'Senkronize Ediliyor...' : 'Şimdi Manuel Çalıştır'}
            </button>
          </div>

          {lastSyncResult && (
            <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs space-y-2">
              <p className="text-emerald-400 font-bold">// Son Senkronizasyon Raporu:</p>
              <pre>{JSON.stringify(lastSyncResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
