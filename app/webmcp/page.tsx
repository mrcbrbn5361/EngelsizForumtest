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
import { MCPServerEntry, MCPCategoryInfo, EXHAUSTIVE_AI_AGENTS_CATALOG, AIAgentEntry, INITIAL_MCP_DIRECTORY } from '@/lib/mcp-directory';

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
  const [toolSearchFilter, setToolSearchFilter] = useState<string>('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('all');
  const [useCustomJsonPayload, setUseCustomJsonPayload] = useState<boolean>(false);
  const [customJsonText, setCustomJsonText] = useState<string>('{}');

  const [toolParams, setToolParams] = useState<Record<string, string>>({
    topic: 'ÖTV 2026 ve Engelli Hakları Zammı',
    query: 'Resmi Gazete engelli kararları',
    grossSalary: '60000',
    workingYears: '4',
    claim: '2026 yılında engelli kimlik kartı yenilemek zorunlu mu?',
    category: 'is_kanunu',
    disasterType: 'deprem',
    codeSnippet: '<button onClick={() => doSomething()}><img src="icon.png" /></button>',
    sqlQuery: 'SELECT * FROM users WHERE active = true LIMIT 10;',
    tableName: 'disability_applications',
    repo: 'engelsizforum/core-mcp',
    issueTitle: 'WCAG AAA kontrast denetimi',
    filePath: '/config/access-policy.json',
    fileContent: '{\n  "highContrast": true\n}',
    url: 'https://www.engelsizforum.com',
    channel: 'genel-duyurular',
    message: 'Yeni mevzuat duyurusu yayınlandı.',
    rates: '40, 20, 10',
    serviceName: 'edevlet',
    jobTitle: 'Yazılım Geliştirici',
    term: 'Balthazard Formülü',
    equipmentType: 'akulu_sandalye',
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

  const BASE_TOOLS_LIST = [
    { id: 'engelsizforum_live_disability_news', name: 'engelsizforum_live_disability_news', desc: 'Resmi Gazete & Bakanlık Canlı Haber Ajanı', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_web_search', name: 'engelsizforum_web_search', desc: 'Google Grounding Canlı Web Araması', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_fact_checker_ai', name: 'engelsizforum_fact_checker_ai', desc: 'Haber & İddia Doğrulama (Fact-Checker AI)', category: 'security', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_general_legislation_lookup', name: 'engelsizforum_general_legislation_lookup', desc: '4857 İş Kanunu, Tüketici & Borçlar Hukuku', category: 'legal', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_general_tax_salary_calc', name: 'engelsizforum_general_tax_salary_calc', desc: 'Maaş, Net-Brüt & Kıdem Tazminatı Hesabı', category: 'finance', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_emergency_disaster_info', name: 'engelsizforum_emergency_disaster_info', desc: 'AFAD Deprem & Acil Durum Rehberi', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_turkiye_gov_guide', name: 'engelsizforum_turkiye_gov_guide', desc: 'e-Devlet, MHRS & CİMER Rehberi', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_code_accessibility_inspector', name: 'engelsizforum_code_accessibility_inspector', desc: 'WCAG 2.1 & Clean Code Denetçisi', category: 'engineering', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_universal_ergonomics_checker', name: 'engelsizforum_universal_ergonomics_checker', desc: 'Ofis & Bilgisayar Ergonomisi', category: 'healthcare', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_career_cv_advisor', name: 'engelsizforum_career_cv_advisor', desc: 'Kariyer & CV Hazırlama Danışmanı', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_text_summarizer_ai', name: 'engelsizforum_text_summarizer_ai', desc: 'AI Belge & Resmi Yazı Özetleyici', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_balthazard_calc', name: 'engelsizforum_balthazard_calc', desc: 'Balthazard Net Engel Oranı Hesabı', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_disability_rights_guide', name: 'engelsizforum_disability_rights_guide', desc: 'Yasal Engelli Hakları Sorgulama', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_legislation_lookup', name: 'engelsizforum_legislation_lookup', desc: 'ÖTV, Emeklilik & Evde Bakım Mevzuatı', category: 'legal', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_cozger_calculator', name: 'engelsizforum_cozger_calculator', desc: 'ÇÖZGER Çocuk Özel Gereksinim Derecesi', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_accessibility_checker', name: 'engelsizforum_accessibility_checker', desc: 'Web Erişilebilirlik Audit Aracı', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_assistive_tech_finder', name: 'engelsizforum_assistive_tech_finder', desc: 'Yardımcı Teknolojiler & Donanım Bulucu', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_tax_discount_calc', name: 'engelsizforum_tax_discount_calc', desc: 'Engellilik Gelir Vergisi İndirimi', category: 'finance', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_sgk_prosthesis_coverage', name: 'engelsizforum_sgk_prosthesis_coverage', desc: 'SGK Medikal Cihaz & Protez Ödeneği', category: 'healthcare', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_home_care_allowance_calc', name: 'engelsizforum_home_care_allowance_calc', desc: 'Evde Bakım Maaşı Gelir Testi', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_wheelchair_ramp_standards', name: 'engelsizforum_wheelchair_ramp_standards', desc: 'TS 9111 Engelli Rampası Hesaplayıcı', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_ram_special_education_info', name: 'engelsizforum_ram_special_education_info', desc: 'RAM & Özel Eğitim Destek Rehberi', category: 'education', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_accessibility_toggle', name: 'engelsizforum_accessibility_toggle', desc: 'Erişilebilirlik Tercihleri', category: 'accessibility', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_get_categories', name: 'engelsizforum_get_categories', desc: 'Forum Kategori Ağacı', category: 'utilities', server: 'EngelsizForum Universal' },
    { id: 'engelsizforum_universal_dictionary_slang', name: 'engelsizforum_universal_dictionary_slang', desc: 'Hukuki & Medikal Terim Sözlüğü', category: 'utilities', server: 'EngelsizForum Universal' },
  ];

  // Dynamic tools merged seamlessly from INITIAL_MCP_DIRECTORY and live mcpservers.org / mcpserver.com directory
  const ALL_TOOLS_LIST = React.useMemo(() => {
    const list: Array<{ id: string; name: string; desc: string; category: string; server: string }> = [...BASE_TOOLS_LIST];
    const existingIds = new Set(list.map((t) => t.id));

    // Helper to add servers tools
    const addServerTools = (servers: MCPServerEntry[]) => {
      servers.forEach((server) => {
        if (server.tools && Array.isArray(server.tools)) {
          server.tools.forEach((tool) => {
            const standardizedName = tool.name.startsWith('engelsizforum_')
              ? tool.name
              : `engelsizforum_${tool.name}`;
            
            if (!existingIds.has(standardizedName)) {
              existingIds.add(standardizedName);
              list.push({
                id: standardizedName,
                name: standardizedName,
                desc: tool.description || `${server.name} aracı`,
                category: server.category || 'utilities',
                server: server.name,
              });
            }
          });
        }
      });
    };

    addServerTools(INITIAL_MCP_DIRECTORY);
    if (directoryServers && directoryServers.length > 0) {
      addServerTools(directoryServers);
    }

    return list;
  }, [directoryServers]);

  const filteredTools = React.useMemo(() => {
    return ALL_TOOLS_LIST.filter((t) => {
      const matchesSearch =
        toolSearchFilter.trim() === '' ||
        t.name.toLowerCase().includes(toolSearchFilter.toLowerCase()) ||
        t.desc.toLowerCase().includes(toolSearchFilter.toLowerCase()) ||
        t.server.toLowerCase().includes(toolSearchFilter.toLowerCase());

      const matchesCat =
        toolCategoryFilter === 'all' || t.category === toolCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [ALL_TOOLS_LIST, toolSearchFilter, toolCategoryFilter]);

  const handleExecuteTool = async () => {
    setExecuting(true);
    setExecutionResult(null);

    let payloadArgs: Record<string, any> = {};

    if (useCustomJsonPayload) {
      try {
        payloadArgs = JSON.parse(customJsonText);
      } catch (err: any) {
        toast.error(`JSON Sözdizimi Hatası: ${err.message}`);
        setExecuting(false);
        return;
      }
    } else {
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
      } else if (selectedTool === 'engelsizforum_balthazard_calc') {
        const ratesArray = (toolParams.rates || '40, 20, 10')
          .split(',')
          .map((n) => Number(n.trim()))
          .filter((n) => !isNaN(n) && n > 0);
        payloadArgs = { rates: ratesArray };
      } else if (selectedTool.includes('postgres') || selectedTool.includes('sqlite') || selectedTool.includes('mysql') || selectedTool.includes('supabase')) {
        payloadArgs = { query: toolParams.sqlQuery || 'SELECT 1;', tableName: toolParams.tableName };
      } else if (selectedTool.includes('github') || selectedTool.includes('gitlab')) {
        payloadArgs = { repo: toolParams.repo, query: toolParams.query || 'issue search', title: toolParams.issueTitle };
      } else if (selectedTool.includes('filesystem') || selectedTool.includes('obsidian')) {
        payloadArgs = { path: toolParams.filePath, content: toolParams.fileContent, query: toolParams.query };
      } else if (selectedTool.includes('slack') || selectedTool.includes('discord')) {
        payloadArgs = { channel: toolParams.channel, message: toolParams.message };
      } else if (selectedTool.includes('puppeteer') || selectedTool.includes('fetch')) {
        payloadArgs = { url: toolParams.url, query: toolParams.query };
      } else {
        payloadArgs = { query: toolParams.query || toolParams.topic || 'Genel Sorgu', payload: toolParams.fileContent };
      }
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
      toast.success(`"${selectedTool}" MCP çağrısı tamamlandı.`);
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
            Ana sayfaya dön
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              W3C Chrome WebMCP 1.1 ve Remote MCP standardı
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              26 Evrensel ajan aracı ve otomatik senkronizasyon
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Yapay Zeka (AI) Ajanları ve Evrensel MCP Modülü
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed mt-1 font-normal">
                IDE (Cursor, VS Code, Windsurf), CLI (Claude Code, Aider), Web (Gemini, Claude, ChatGPT) ve eklenti tabanlı tüm yapay zeka ajanları için canlı haber, mevzuat, finans, hukuk ve erişilebilirlik entegrasyonu.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-xs border border-border cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
                {isSyncing ? 'Senkronize ediliyor...' : 'Tüm dizini senkronize et'}
              </button>
            </div>
          </div>
        </div>

        {/* Authenticated User Status Bar / Auth Notice */}
        {!user && !authLoading ? (
          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    Oturum açarak tüm MCP araçlarını ve ajan entegrasyonlarını kilitsiz kullanın
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                    Giriş yapan tüm kullanıcılar 26 canlı yapay zeka ajan aracını, özel API anahtarlarını, IDE/CLI konfigürasyonlarını ve canlı test konsolunu sınırsız kullanabilir.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <LogIn className="w-4 h-4" />
                Giriş yap / Üye ol
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-emerald-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Oturum açıldı ({user?.email}): Tüm 26 MCP ajan aracı, IDE/CLI konfigürasyonları ve canlı test konsolu aktif.</span>
            </div>
            <span className="font-mono bg-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] text-emerald-300">
              Sunucu adresi: https://www.engelsizforum.com/mcp
            </span>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <div className="flex border-b border-border overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'tools'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4" />
            Aktif MCP Araçları Konsolu (26 Araç)
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'directory'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="w-4 h-4" />
            MCP Sunucu Dizin Kütüphanesi
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'guides'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Eğitim Kılavuzları ve Örnek Promptlar
          </button>

          <button
            onClick={() => setActiveTab('configs')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'configs'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sliders className="w-4 h-4" />
            IDE, CLI ve Web Ajan Yapılandırmaları
          </button>

          <button
            onClick={() => setActiveTab('webmcp')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'webmcp'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-4 h-4" />
            Chrome WebMCP 1.1 Canlı Denetçi
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
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
          {/* Tool Selection Left Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  Çalıştırılacak MCP aracını seçin
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                  {filteredTools.length} araç
                </span>
              </div>

              {/* Search Bar & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={toolSearchFilter}
                    onChange={(e) => setToolSearchFilter(e.target.value)}
                    placeholder="Araç veya sunucu adı ara (örn: news, postgres, github, slack)..."
                    className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                  />
                  {toolSearchFilter && (
                    <button
                      onClick={() => setToolSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'accessibility', label: 'Erişilebilirlik' },
                    { id: 'legal', label: 'Hukuk ve Mevzuat' },
                    { id: 'finance', label: 'Maaş ve Vergi' },
                    { id: 'database', label: 'Veritabanı' },
                    { id: 'engineering', label: 'Geliştirici / Git' },
                    { id: 'utilities', label: 'Yardımcı Araçlar' },
                    { id: 'ai-agents', label: 'AI ve Ajanlar' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setToolCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                        toolCategoryFilter === cat.id
                          ? 'bg-sky-500 text-white font-semibold shadow-xs'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools List */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredTools.map((t) => {
                  const isSelected = selectedTool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTool(t.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-sky-500/60 bg-sky-500/10 text-foreground font-semibold shadow-xs'
                          : 'border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-xs text-sky-400 truncate">
                          {t.name}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium shrink-0">
                          {t.server}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-1 line-clamp-2">{t.desc}</p>
                    </button>
                  );
                })}
                {filteredTools.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Aramanızla eşleşen MCP aracı bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tool Execution & Input Parameters Right Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Seçili araç</span>
                  <h3 className="text-base sm:text-lg font-mono font-bold text-foreground break-all">{selectedTool}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseCustomJsonPayload(!useCustomJsonPayload)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      useCustomJsonPayload
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {useCustomJsonPayload ? 'Form moduna geç' : 'Ham JSON modu'}
                  </button>

                  <button
                    onClick={handleExecuteTool}
                    disabled={executing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {executing ? 'Çağrılıyor...' : 'Aracı çalıştır'}
                  </button>
                </div>
              </div>

              {/* Input Form Fields */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  {useCustomJsonPayload ? 'Doğrudan JSON RPC parametreleri (Arguments)' : 'Araç parametreleri'}
                </label>

                {useCustomJsonPayload ? (
                  <textarea
                    rows={6}
                    value={customJsonText}
                    onChange={(e) => setCustomJsonText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder={`{\n  "paramName": "value"\n}`}
                  />
                ) : (
                  <>
                    {selectedTool === 'engelsizforum_live_disability_news' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">Haber arama terimi / konusu</label>
                        <input
                          type="text"
                          value={toolParams.topic}
                          onChange={(e) => setToolParams({ ...toolParams, topic: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                          placeholder="Haber konusu veya arama terimi..."
                        />
                      </div>
                    )}

                    {(selectedTool === 'engelsizforum_web_search' || selectedTool.includes('brave') || selectedTool.includes('search')) && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">Arama sorgusu (Query)</label>
                        <input
                          type="text"
                          value={toolParams.query}
                          onChange={(e) => setToolParams({ ...toolParams, query: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                          placeholder="Aranacak sorgu metni..."
                        />
                      </div>
                    )}

                    {selectedTool === 'engelsizforum_fact_checker_ai' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">Doğrulanacak iddia / haber başlığı</label>
                        <input
                          type="text"
                          value={toolParams.claim}
                          onChange={(e) => setToolParams({ ...toolParams, claim: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                          placeholder="Doğrulanacak iddia veya sosyal medya haberi..."
                        />
                      </div>
                    )}

                    {selectedTool === 'engelsizforum_general_tax_salary_calc' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Aylık brüt maaş (TL)</label>
                          <input
                            type="number"
                            value={toolParams.grossSalary}
                            onChange={(e) => setToolParams({ ...toolParams, grossSalary: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                            placeholder="Aylık Brüt Maaş (TL)"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Kıdem yılı</label>
                          <input
                            type="number"
                            value={toolParams.workingYears}
                            onChange={(e) => setToolParams({ ...toolParams, workingYears: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                            placeholder="Çalışma Yılı"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTool === 'engelsizforum_balthazard_calc' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">Engel oranları (Virgülle ayrılmış % değerleri, örn: 40, 20, 10)</label>
                        <input
                          type="text"
                          value={toolParams.rates}
                          onChange={(e) => setToolParams({ ...toolParams, rates: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                          placeholder="40, 20, 10"
                        />
                      </div>
                    )}

                    {(selectedTool.includes('postgres') || selectedTool.includes('sqlite') || selectedTool.includes('mysql') || selectedTool.includes('supabase')) && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">SQL sorgusu</label>
                          <input
                            type="text"
                            value={toolParams.sqlQuery}
                            onChange={(e) => setToolParams({ ...toolParams, sqlQuery: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                            placeholder="SELECT * FROM table LIMIT 10;"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Tablo / Şema adı</label>
                          <input
                            type="text"
                            value={toolParams.tableName}
                            onChange={(e) => setToolParams({ ...toolParams, tableName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-mono text-foreground outline-none"
                            placeholder="disability_applications"
                          />
                        </div>
                      </div>
                    )}

                    {(selectedTool.includes('github') || selectedTool.includes('gitlab')) && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Depo (owner/repo)</label>
                          <input
                            type="text"
                            value={toolParams.repo}
                            onChange={(e) => setToolParams({ ...toolParams, repo: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                            placeholder="engelsizforum/core-mcp"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Issue başlığı / Sorgu</label>
                          <input
                            type="text"
                            value={toolParams.issueTitle}
                            onChange={(e) => setToolParams({ ...toolParams, issueTitle: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground outline-none"
                            placeholder="WCAG AAA denetim başlığı"
                          />
                        </div>
                      </div>
                    )}

                    {(selectedTool.includes('filesystem') || selectedTool.includes('obsidian')) && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Dosya yolu (Path)</label>
                          <input
                            type="text"
                            value={toolParams.filePath}
                            onChange={(e) => setToolParams({ ...toolParams, filePath: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                            placeholder="/notes/erisim.md"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Dosya içeriği (Yazma / Güncelleme için)</label>
                          <textarea
                            rows={3}
                            value={toolParams.fileContent}
                            onChange={(e) => setToolParams({ ...toolParams, fileContent: e.target.value })}
                            className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                            placeholder="Dosya içeriği..."
                          />
                        </div>
                      </div>
                    )}

                    {(selectedTool.includes('slack') || selectedTool.includes('discord')) && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Kanal adı / ID</label>
                          <input
                            type="text"
                            value={toolParams.channel}
                            onChange={(e) => setToolParams({ ...toolParams, channel: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground outline-none"
                            placeholder="genel-duyurular"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Mesaj</label>
                          <input
                            type="text"
                            value={toolParams.message}
                            onChange={(e) => setToolParams({ ...toolParams, message: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground outline-none"
                            placeholder="Gönderilecek bildirim mesajı..."
                          />
                        </div>
                      </div>
                    )}

                    {(selectedTool.includes('puppeteer') || selectedTool.includes('fetch')) && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">Hedef web URL</label>
                        <input
                          type="text"
                          value={toolParams.url}
                          onChange={(e) => setToolParams({ ...toolParams, url: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                          placeholder="https://www.engelsizforum.com"
                        />
                      </div>
                    )}

                    {selectedTool === 'engelsizforum_code_accessibility_inspector' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-muted-foreground">İncelenecek kod parçacığı (HTML/JSX)</label>
                        <textarea
                          rows={4}
                          value={toolParams.codeSnippet}
                          onChange={(e) => setToolParams({ ...toolParams, codeSnippet: e.target.value })}
                          className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
                          placeholder="İncelenecek React veya HTML kodu..."
                        />
                      </div>
                    )}

                    {/* Fallback general input if no special form matched */}
                    {![
                      'engelsizforum_live_disability_news',
                      'engelsizforum_web_search',
                      'engelsizforum_fact_checker_ai',
                      'engelsizforum_general_tax_salary_calc',
                      'engelsizforum_balthazard_calc',
                      'engelsizforum_code_accessibility_inspector',
                    ].includes(selectedTool) &&
                      !selectedTool.includes('postgres') &&
                      !selectedTool.includes('sqlite') &&
                      !selectedTool.includes('mysql') &&
                      !selectedTool.includes('supabase') &&
                      !selectedTool.includes('github') &&
                      !selectedTool.includes('gitlab') &&
                      !selectedTool.includes('filesystem') &&
                      !selectedTool.includes('obsidian') &&
                      !selectedTool.includes('slack') &&
                      !selectedTool.includes('discord') &&
                      !selectedTool.includes('puppeteer') &&
                      !selectedTool.includes('fetch') &&
                      !selectedTool.includes('search') &&
                      !selectedTool.includes('brave') && (
                        <div className="space-y-2">
                          <label className="text-[11px] text-muted-foreground">Genel parametre / sorgu</label>
                          <input
                            type="text"
                            value={toolParams.query}
                            onChange={(e) => setToolParams({ ...toolParams, query: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none"
                            placeholder="İşlenecek veri veya sorgu..."
                          />
                        </div>
                      )}
                  </>
                )}
              </div>

              {/* Execution Output Window */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  JSON-RPC 2.0 / Ajan yanıt çıktısı
                </span>
                <div className="bg-background border border-border/80 text-emerald-400 p-4 rounded-xl font-mono text-xs min-h-[220px] max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-xs">
                  {executionResult ? executionResult : '// "Aracı çalıştır" butonuna basarak canlı sonucu görüntüleyebilirsiniz.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Live mcpservers.org source banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">
                Canlı bağlantı aktif: https://mcpservers.org/tr/all
              </span>
              <span className="text-muted-foreground hidden md:inline">
                ({directoryServers.length} Adet doğrulanmış gerçek MCP sunucusu)
              </span>
            </div>
            <button
              onClick={() => fetchDirectory(selectedCategory, selectedAgentType, searchQuery)}
              disabled={loadingDirectory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectory ? 'animate-spin' : ''}`} />
              Canlı yenile
            </button>
          </div>

          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xs">
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedAgentType}
                  onChange={(e) => {
                    setSelectedAgentType(e.target.value);
                    fetchDirectory(selectedCategory, e.target.value, searchQuery);
                  }}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="all">Tüm ajan türleri</option>
                  <option value="ide">IDE ajanları (Cursor, VS Code)</option>
                  <option value="cli">CLI ajanları (Claude Code, Aider)</option>
                  <option value="web">Web ajanları (Gemini Web, ChatGPT)</option>
                  <option value="extension">Tarayıcı eklenti ajanları</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    fetchDirectory(e.target.value, selectedAgentType, searchQuery);
                  }}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none cursor-pointer"
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
              <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
              <span className="text-sm">MCP sunucu dizini yükleniyor...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directoryServers.map((server) => (
                <div
                  key={server.id}
                  className="bg-card/85 border border-border/80 hover:border-sky-500/40 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {server.category}
                      </span>
                      {server.isEngelsizForumNative && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          EngelsizForum yerli hub
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-foreground line-clamp-1">{server.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-normal">{server.description}</p>

                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] font-semibold text-foreground">Ajan araçları ({server.tools?.length || 0}):</span>
                      <div className="flex flex-wrap gap-1">
                        {server.tools?.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-muted/80 font-mono text-[10px] text-muted-foreground">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                      {server.protocol}
                    </span>

                    <button
                      onClick={() => copyToClipboard(server.endpointUrl, server.id)}
                      className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === server.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === server.id ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
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
          <div className="bg-card/95 border border-border/80 backdrop-blur-md text-foreground rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>OpenCode, Cursor, Windsurf ve Claude Code hazır JSON dosyaları</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  OpenCode ve Yapay Zeka Ajanları için Doğrudan JSON Konfigüratörü
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Projenize direkt kopyalayabileceğiniz veya indirip <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">opencode.json</code> / <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">.cursor/mcp.json</code> olarak kullanabileceğiniz %100 geçerli JSON şablonları.
                </p>
              </div>

              {/* Download / Copy Global Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => copyToClipboard(jsonPresets[selectedJsonFormat].json, `preset-${selectedJsonFormat}`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {copiedKey === `preset-${selectedJsonFormat}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === `preset-${selectedJsonFormat}` ? 'JSON Kopyalandı!' : 'Seçili JSON\'ı kopyala'}</span>
                </button>

                <button
                  onClick={() => handleDownloadJson(jsonPresets[selectedJsonFormat].fileName, jsonPresets[selectedJsonFormat].json)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors border border-border cursor-pointer"
                >
                  <Database className="w-4 h-4 text-sky-400" />
                  <span>JSON olarak indir ({jsonPresets[selectedJsonFormat].fileName})</span>
                </button>
              </div>
            </div>

            {/* Presets Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
              {[
                { id: 'opencode', label: 'OpenCode (SST)', badge: 'opencode.json' },
                { id: 'cursor', label: 'Cursor IDE', badge: '.cursor/mcp.json' },
                { id: 'windsurf', label: 'Windsurf Cascade', badge: 'mcp_config.json' },
                { id: 'claude', label: 'Claude Code & Desktop', badge: 'claude_desktop_config.json' },
                { id: 'cline', label: 'Cline & Roo Code', badge: 'cline_mcp_settings.json' },
                { id: 'vscode', label: 'VS Code Native', badge: '.vscode/mcp.json' },
                { id: 'generic', label: 'Evrensel Remote MCP', badge: 'mcp-servers.json' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedJsonFormat(p.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                    selectedJsonFormat === p.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Preset Preview Box */}
            <div className="space-y-2 bg-background rounded-2xl p-4 sm:p-5 border border-border">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="text-sky-400 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {jsonPresets[selectedJsonFormat].title}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {jsonPresets[selectedJsonFormat].description}
                </span>
              </div>

              <div className="relative pt-2">
                <pre className="p-4 rounded-xl bg-card border border-border/80 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-72">
                  {jsonPresets[selectedJsonFormat].json}
                </pre>
              </div>

              {/* OpenCode Schema Fix Notification Banner */}
              {selectedJsonFormat === 'opencode' && (
                <div className="mt-3 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-sky-400">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>&quot;Configuration is invalid ... Unrecognized key: mcpServers&quot; hatası çözümü:</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-normal">
                    OpenCode (SST), varsayılan olarak <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">mcpServers</code> anahtarını kabul etmez ve katı şema doğrulaması yapar.
                    Bilgisayarınızdaki <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">opencode.jsonc</code> veya projenizdeki <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">opencode.json</code> dosyasındaki <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">&quot;mcpServers&quot;</code> anahtarını silin. Sadece yukarıdaki <code className="text-sky-400 font-mono bg-muted px-1.5 py-0.5 rounded">&quot;mcp&quot;</code> objesini kullanın.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Filter & Search Header */}
          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Bot className="w-5 h-5 text-sky-400" />
                  Kapsamlı Yapay Zeka Ajanları (AI Agents) ve MCP Entegrasyon Kataloğu
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                  Sistemdeki tüm IDE, CLI, Web, Bulut ve eklenti tabanlı yapay zeka ajanları. EngelsizForum Universal MCP Hub ile %100 uyumludur.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                  placeholder="Ajan adı veya özellik ara (Cursor, Claude Code, Devin, Windsurf)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {[
                { id: 'all', label: `Tüm Ajanlar (${EXHAUSTIVE_AI_AGENTS_CATALOG.length})` },
                { id: 'ide_tabanli_agentlar', label: 'IDE Tabanlı Ajanlar' },
                { id: 'cli_tabanli_agentlar', label: 'CLI Tabanlı Ajanlar' },
                { id: 'web_tabanli_ve_bulut_agentlar', label: 'Web ve Bulut Ajanları' },
                { id: 'eklenti_tabanli_agentlar', label: 'Eklenti Tabanlı Ajanlar' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedAgentCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                    selectedAgentCategory === cat.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
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
                className="bg-card/85 border border-border/80 hover:border-sky-500/40 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {agent.typeBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      EngelsizForum hazır
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-foreground">{agent.name}</h4>
                    <span className="text-[11px] font-medium text-muted-foreground">{agent.categoryLabel}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed font-normal">{agent.features}</p>

                  {/* Setup Command or Config Snippet */}
                  {agent.setupCommand && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-sky-400" />
                          Yöntem 1: Terminal kurulum komutu
                        </span>
                      </div>
                      <div className="relative">
                        <pre className="p-3 rounded-xl bg-background border border-border text-foreground font-mono text-[11px] overflow-x-auto pr-10">
                          {agent.setupCommand}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(agent.setupCommand!, `cmd-${agent.id}`)}
                          className="absolute right-2 top-2 p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                          title="Komutu Kopyala"
                        >
                          {copiedKey === `cmd-${agent.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {agent.npmFixGuide && (
                        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 space-y-1">
                          <div className="font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                            <span>npm 404 Hatası Çözümü</span>
                          </div>
                          <p className="leading-snug text-muted-foreground font-normal">{agent.npmFixGuide}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {agent.configSnippet && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                          Yöntem 2: Garantili JSON konfigürasyonu ({agent.configPath || 'config.json'})
                        </span>
                      </div>
                      <div className="relative">
                        <pre className="p-3 rounded-xl bg-background border border-border text-emerald-400 font-mono text-[10px] overflow-x-auto pr-20 max-h-40">
                          {agent.configSnippet}
                        </pre>
                        <div className="absolute right-2 top-2 flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(agent.configSnippet!, `json-${agent.id}`)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                            title="JSON Kopyala"
                          >
                            {copiedKey === `json-${agent.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDownloadJson(agent.configPath || `${agent.id}-config.json`, agent.configSnippet!)}
                            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-colors cursor-pointer"
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
                      className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <span>Resmi site</span>
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
          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  MCP Araçları ve Ajan Kullanım Rehberi
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                  EngelsizForum ve mcpservers.org üzerindeki 25+ doğrulanmış MCP aracını yapay zeka ajanlarınızda (OpenCode, Cursor, Windsurf, Claude Code, Roo Code, VS Code vb.) en verimli şekilde nasıl kullanacağınızı öğrenin.
                </p>
              </div>
            </div>

            {/* Quick 3-Step Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">1</span>
                <h4 className="font-semibold text-sm text-foreground">Konfigürasyonu indirin</h4>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                  &quot;IDE ve CLI Yapılandırmaları&quot; sekmesinden kullandığınız ajan için tek tıkla hazır JSON dosyasını indirin veya kopyalayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">2</span>
                <h4 className="font-semibold text-sm text-foreground">Ajanınıza bağlayın</h4>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                  JSON dosyasını ilgili ajanın ayarlar klasörüne (`.cursor/mcp.json`, `opencode.json` vb.) ekleyerek remote SSE sunucumuzu tanımlayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">3</span>
                <h4 className="font-semibold text-sm text-foreground">Doğal dille sorgulayın</h4>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                  Ajanınıza &quot;ÖTV 2026 kararlarını sorgula&quot; veya &quot;PostgreSQL veritabanı şemasını getir&quot; dediğinizde ajan otonom olarak aracı çağırır.
                </p>
              </div>
            </div>
          </div>

          {/* Search & Category Filter for Guides */}
          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Örnek Prompt ve Araç Kullanım Kütüphanesi
                </h4>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
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
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {[
                { id: 'all', label: 'Tüm kılavuzlar (26 Araç)' },
                { id: 'accessibility', label: 'Erişilebilirlik ve Haklar' },
                { id: 'engineering', label: 'Veritabanları ve Mühendislik' },
                { id: 'dev', label: 'Git ve Kodlama' },
                { id: 'web', label: 'Web Otomasyon ve Arama' },
                { id: 'utilities', label: 'İş Birliği ve Verimlilik' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setGuideCategoryFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                    guideCategoryFilter === pill.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
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
                name: 'Resmi Gazete ve Bakanlık Canlı Haber Ajanı',
                desc: 'Resmi Gazete, Aile ve Sosyal Hizmetler Bakanlığı ve T.C. mevzuat duyurularından anlık veri çeker.',
                recommendedPrompt: '2026 yılı ÖTV muafiyetli engelli araç üst limiti ve engelli aylığı zam oranları Resmi Gazete kararları nelerdir?',
                presetParams: { topic: 'ÖTV 2026 ve Engelli Hakları Zammı' },
                tips: 'Özellikle mevzuat, kararname ve güncel hak sorgulamalarında en yüksek doğrulukta yanıt üretir.',
              },
              {
                id: 'engelsizforum_fact_checker_ai',
                category: 'accessibility',
                name: 'Haber ve İddia Doğrulama Ajanı (Fact-Checker AI)',
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
                className="bg-card/85 border border-border/80 hover:border-sky-500/40 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {card.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Canlı aktif
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-foreground">{card.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-normal">{card.desc}</p>

                  {/* Recommended Prompt Box */}
                  <div className="p-3.5 rounded-xl bg-background text-foreground font-sans text-xs space-y-2 border border-border">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-sky-400">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        Tavsiye edilen örnek prompt
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs italic font-normal leading-relaxed">
                      &quot;{card.recommendedPrompt}&quot;
                    </p>
                  </div>

                  {/* Useful Tips */}
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-medium">
                    <span className="font-semibold text-sky-400">İpucu:</span> {card.tips}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => copyToClipboard(card.recommendedPrompt, `prompt-${card.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedKey === `prompt-${card.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Promptu kopyala</span>
                  </button>

                  <button
                    onClick={() => handleQuickLaunchTool(card.id, card.presetParams)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Konsolda çalıştır</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ & Troubleshooting Guide */}
          <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Sık Sorulan Sorular ve Problem Çözüm Rehberi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <h5 className="font-semibold text-foreground text-sm">OpenCode &apos;Unrecognized key: mcpServers&apos; hatası veriyor?</h5>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  OpenCode (SST) standardında <code className="bg-muted px-1 rounded font-mono text-[11px]">mcpServers</code> anahtarı geçerli değildir. Yalnızca <code className="bg-muted px-1 rounded font-mono text-[11px]">mcp</code> kullanılmalıdır. Yapılandırma sekmesindeki hazır <code className="bg-muted px-1 rounded font-mono text-[11px]">opencode.json</code> şablonunu kullanın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <h5 className="font-semibold text-foreground text-sm">Cursor veya Claude SSE bağlantı hatası veriyor?</h5>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  Sunucu adresimizin <code className="bg-muted px-1 rounded font-mono text-[11px]">https://www.engelsizforum.com/mcp</code> tam URL olduğunu ve protokolden <code className="bg-muted px-1 rounded font-mono text-[11px]">sse</code> seçildiğini doğrulayın.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <h5 className="font-semibold text-foreground text-sm">Ajan aracı çalıştırıyor fakat yanıt Türkçe gelmiyor?</h5>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  Ajanınıza verdiğiniz promptun sonuna &quot;Lütfen yanıtı Türkçe, maddeler halinde detaylıca sun&quot; ifadesini ekleyin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                <h5 className="font-semibold text-foreground text-sm">WebMCP 1.1 ile W3C tarayıcı entegrasyonu nasıl kullanılır?</h5>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  Google Chrome 146+ veya destekleyen tarayıcılarda <code className="bg-muted px-1 rounded font-mono text-[11px]">document.modelContext</code> yerleşiktir. Sitemizdeki Polyfill ile tüm tarayıcılarda aktif çalışır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEBMCP 1.1 */}
      {activeTab === 'webmcp' && (
        <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Chrome WebMCP 1.1 W3C Tarayıcı İçi Denetçi</h3>
              <p className="text-xs text-muted-foreground font-normal">Google Chrome 146+ yerleşik tarayıcı yapay zeka yapısı ve W3C Web ML Community Group standardı.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background border border-border space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Polyfill Durumu</span>
              <p className="text-lg font-bold text-emerald-400">W3C 1.1 Aktif</p>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">document.modelContext</span>
              <p className="text-lg font-bold text-foreground">{webMCPStatus.hasDocContext ? 'Algılandı' : 'Polyfill Aktif'}</p>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Kayıtlı Araç Sayısı</span>
              <p className="text-lg font-bold text-sky-400">{webMCPStatus.toolCount} Araç</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border text-foreground font-mono text-xs space-y-2">
            <p className="text-emerald-400 font-semibold">// Chrome DevTools konsolunda test etmek için:</p>
            <p className="text-muted-foreground">console.log(document.modelContext.getRegisteredTools());</p>
            <p className="text-muted-foreground">console.log(window.WebMCP.getRegisteredTools());</p>
          </div>
        </div>
      )}

      {/* TAB 6: SYNC */}
      {activeTab === 'sync' && (
        <div className="bg-card/85 border border-border/80 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Otomatik Senkronizasyon (Auto-Sync) Modülü</h3>
                <p className="text-xs text-muted-foreground font-normal">Webhook, Cron Job ve GitHub Actions üzerinden mcpservers.org ve T.C. mevzuat değişiklikleri taranır.</p>
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? 'Senkronize Ediliyor...' : 'Şimdi Manuel Çalıştır'}
            </button>
          </div>

          {lastSyncResult && (
            <div className="p-4 rounded-xl bg-background border border-border text-foreground font-mono text-xs space-y-2">
              <p className="text-emerald-400 font-semibold">// Son Senkronizasyon Raporu:</p>
              <pre className="text-muted-foreground overflow-x-auto">{JSON.stringify(lastSyncResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
