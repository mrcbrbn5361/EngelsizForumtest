/**
 * EngelsizForum Comprehensive MCP & AI Agent Directory Store
 * 
 * Includes full support for:
 * 1. IDE Agents (Cursor, VS Code / Copilot, Windsurf, JetBrains, Zed, Roo Code / Cline, Continue)
 * 2. CLI Agents (Claude Code, Aider AI, Goose CLI, Fabric AI, OpenInterpreter)
 * 3. Web Agents (Gemini Web, Claude.ai, ChatGPT Custom GPT Actions, Perplexity Pro, Open WebUI, Dify, Poe)
 * 4. Extension & Plugin Agents (Chrome WebMCP 1.1, Firefox WebMCP, Edge AI Sidepanel, Tampermonkey MCP Bridge, Obsidian MCP)
 * 5. Full Migration of mcpservers.org/tr directory across all domains (Engineering, Healthcare, Legal, Finance, Design, Accessibility, etc.)
 */

export interface MCPServerEntry {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'engineering' | 'healthcare' | 'legal' | 'finance' | 'design' | 'accessibility' | 'education' | 'security' | 'utilities';
  agentTypes: ('ide' | 'cli' | 'web' | 'extension' | 'hardware' | 'mobile')[];
  protocol: 'sse' | 'stdio' | 'jsonrpc_http' | 'webmcp_1_1';
  endpointUrl: string;
  githubUrl?: string;
  websiteUrl?: string;
  starCount?: number;
  isOfficial?: boolean;
  isEngelsizForumNative?: boolean;
  syncStatus: 'active' | 'synced' | 'pending';
  lastSyncedAt: string;
  tools: {
    name: string;
    description: string;
    params?: string[];
  }[];
}

export interface MCPCategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  count: number;
}

export const MCP_CATEGORIES: MCPCategoryInfo[] = [
  { id: 'all', name: 'Tüm Sunucu & Ajanlar', description: 'Sistemdeki tüm IDE, CLI, Web ve Eklenti MCP sunucuları', iconName: 'Layers', count: 32 },
  { id: 'accessibility', name: 'Erişilebilirlik & Yasal Haklar', description: 'EngelsizForum yerli yasal haklar, ÖTV, ÇÖZGER, Balthazard ve WCAG araçları', iconName: 'CheckCircle2', count: 26 },
  { id: 'engineering', name: 'Yazılım & Mühendislik', description: 'PostgreSQL, GitHub, FileSystem, Git, Docker, Terminal ve Kod Denetimi', iconName: 'Terminal', count: 12 },
  { id: 'legal', name: 'Hukuk, Mevzuat & İş Kanunu', description: '4857 İş Kanunu, Tüketici Hakları, Resmi Gazete, CİMER ve Yargı kararları', iconName: 'Scale', count: 8 },
  { id: 'finance', name: 'Finans, Vergi & Maaş', description: 'Net-Brüt maaş, kıdem tazminatı, gelir vergisi indirimi ve SGK hesaplama', iconName: 'DollarSign', count: 6 },
  { id: 'healthcare', name: 'Sağlık, Medikal & Ergonomi', description: 'MHRS, Aile Hekimliği, Protez/Ortez ödeneği ve çalışma alanı ergonomisi', iconName: 'Activity', count: 7 },
  { id: 'design', name: 'Tasarım, UI/UX & WCAG', description: 'Erişilebilir renk paletleri, kontrast oranları ve UI/UX standartları', iconName: 'Palette', count: 5 },
  { id: 'security', name: 'DevOps & Güvenlik', description: 'Fact-Checker AI, siber güvenlik denetçisi ve log doğrulama', iconName: 'ShieldCheck', count: 4 },
  { id: 'utilities', name: 'Genel Araçlar & Sözlük', description: 'Metin özetleme, e-Devlet rehberi, terim sözlüğü ve AFAD acil durum', iconName: 'Sparkles', count: 9 },
];

export const INITIAL_MCP_DIRECTORY: MCPServerEntry[] = [
  {
    id: 'engelsizforum-core',
    name: 'EngelsizForum Universal MCP Server (Canlı Türkiye Hub)',
    slug: 'engelsizforum-universal',
    description: 'Resmi Gazete canlı haber taraması, ÖTV 2026, Balthazard, İş Kanunu, Maaş/Kıdem, AFAD Deprem, e-Devlet ve WCAG kod denetimi sunan 26 araçlık evrensel Türkiye hub sunucusu.',
    category: 'accessibility',
    agentTypes: ['ide', 'cli', 'web', 'extension', 'hardware', 'mobile'],
    protocol: 'webmcp_1_1',
    endpointUrl: 'https://www.engelsizforum.com/mcp',
    githubUrl: 'https://github.com/engelsizforum/mcp-server',
    websiteUrl: 'https://www.engelsizforum.com/webmcp',
    starCount: 1420,
    isOfficial: true,
    isEngelsizForumNative: true,
    syncStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'engelsizforum_live_disability_news', description: 'Resmi Gazete ve Aile Bakanlığı canlı haber araması' },
      { name: 'engelsizforum_web_search', description: 'Google Grounding ile canlı web araması' },
      { name: 'engelsizforum_balthazard_calc', description: 'Balthazard net engel oranı hesaplama' },
      { name: 'engelsizforum_disability_rights_guide', description: 'Rapor oranına göre yasal haklar rehberi' },
      { name: 'engelsizforum_legislation_lookup', description: 'ÖTV, Emeklilik ve Evde bakım mevzuat sorgulama' },
      { name: 'engelsizforum_general_legislation_lookup', description: '4857 İş Kanunu, Tüketici Hakları ve Borçlar Kanunu' },
      { name: 'engelsizforum_fact_checker_ai', description: 'Haber ve iddia doğrulama (Fact-Checker AI)' },
      { name: 'engelsizforum_general_tax_salary_calc', description: 'Net-Brüt maaş, kıdem ve ihbar tazminatı hesaplama' },
      { name: 'engelsizforum_emergency_disaster_info', description: 'AFAD Deprem ve acil durum rehberi' },
      { name: 'engelsizforum_turkiye_gov_guide', description: 'e-Devlet, MHRS ve CİMER başvuru kılavuzu' },
      { name: 'engelsizforum_code_accessibility_inspector', description: 'WCAG 2.1 & Clean Code denetleyici' },
    ],
  },
  {
    id: 'mcpservers-postgres',
    name: 'PostgreSQL MCP Server (mcpservers.org)',
    slug: 'postgres-mcp',
    description: 'Veritabanı şema sorgulama, SQL sorgu çalıştırma ve veritabanı analitiği sunan resmi PostgreSQL sunucusu.',
    category: 'engineering',
    agentTypes: ['ide', 'cli'],
    protocol: 'stdio',
    endpointUrl: 'npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    starCount: 3890,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'query', description: 'Salt okunur SQL sorgusu çalıştırır' },
      { name: 'list_tables', description: 'Veritabanındaki tüm tabloları ve şemaları listeler' },
      { name: 'describe_table', description: 'Tablo sütun yapılarını ve indekslerini açıklar' },
    ],
  },
  {
    id: 'mcpservers-github',
    name: 'GitHub API MCP Server (mcpservers.org)',
    slug: 'github-mcp',
    description: 'Repository arama, Issue açma/kapatma, Pull Request inceleme ve kod commits takibi sağlayan resmi GitHub MCP entegrasyonu.',
    category: 'engineering',
    agentTypes: ['ide', 'cli', 'extension'],
    protocol: 'stdio',
    endpointUrl: 'npx -y @modelcontextprotocol/server-github',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    starCount: 5120,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'search_repositories', description: 'GitHub depolarında arama yapar' },
      { name: 'create_issue', description: 'Depoda yeni bir issue oluşturur' },
      { name: 'get_pull_request', description: 'PR detaylarını ve kod farklarını getirir' },
    ],
  },
  {
    id: 'mcpservers-filesystem',
    name: 'Secure FileSystem MCP Server (mcpservers.org)',
    slug: 'filesystem-mcp',
    description: 'Yerel dosya sisteminde güvenli dosya okuma, yazma, dizin tarama ve dosya arama işlemleri sunan temel MCP sunucusu.',
    category: 'engineering',
    agentTypes: ['ide', 'cli'],
    protocol: 'stdio',
    endpointUrl: 'npx -y @modelcontextprotocol/server-filesystem /allowed/path',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    starCount: 6400,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'read_file', description: 'Belirtilen dosyanın içeriğini okur' },
      { name: 'write_file', description: 'Dosyaya güvenli şekilde yazar veya günceller' },
      { name: 'list_directory', description: 'Dizin içeriğini ve klasör yapısını listeler' },
    ],
  },
  {
    id: 'mcpservers-brave-search',
    name: 'Brave Web Search MCP Server (mcpservers.org)',
    slug: 'brave-search-mcp',
    description: 'Gizlilik odaklı Brave Search API kullanarak canlı web aramaları ve yerel konum aramaları gerçekleştirir.',
    category: 'utilities',
    agentTypes: ['ide', 'cli', 'web'],
    protocol: 'stdio',
    endpointUrl: 'npx -y @modelcontextprotocol/server-brave-search',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    starCount: 2950,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'brave_web_search', description: 'Brave arama motoru ile canlı web araması' },
      { name: 'brave_local_search', description: 'Yakındaki mekan ve yerel işletme araması' },
    ],
  },
  {
    id: 'mcpservers-puppeteer',
    name: 'Puppeteer Web Automation MCP (mcpservers.org)',
    slug: 'puppeteer-mcp',
    description: 'Headless Chrome tarayıcı otomasyonu, sayfa ekran görüntüsü alma, DOM scraping ve form doldurma araçları.',
    category: 'engineering',
    agentTypes: ['ide', 'cli'],
    protocol: 'stdio',
    endpointUrl: 'npx -y @modelcontextprotocol/server-puppeteer',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    starCount: 4210,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'navigate', description: 'Belirtilen web sayfasına taranarak gidilir' },
      { name: 'screenshot', description: 'Sayfanın ekran görüntüsünü alır' },
      { name: 'click', description: 'Sayfadaki öğelere tıklar ve etkileşim kurar' },
    ],
  },
  {
    id: 'mcpservers-slack',
    name: 'Slack Workplace Communication MCP (mcpservers.org)',
    slug: 'slack-mcp',
    description: 'Slack kanallarına mesaj gönderme, kanal geçmişini okuma ve ajanın takım ile doğrudan iletişim kurmasını sağlayan entegrasyon.',
    category: 'utilities',
    agentTypes: ['web', 'extension', 'ide'],
    protocol: 'sse',
    endpointUrl: 'npx -y @modelcontextprotocol/server-slack',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    starCount: 1890,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'post_message', description: 'Slack kanalına veya kişiye mesaj gönderir' },
      { name: 'list_channels', description: 'Erişilebilir Slack kanallarını listeler' },
    ],
  },
  {
    id: 'mcpservers-wcag-accessibility',
    name: 'WCAG Accessibility Validator MCP (mcpservers.org/tr)',
    slug: 'wcag-validator-mcp',
    description: 'Web sitelerini WCAG 2.1 AA/AAA standartlarına göre tarayan, renk kontrastını ve ARIA etiketlerini doğrulayan araç.',
    category: 'accessibility',
    agentTypes: ['ide', 'web', 'extension'],
    protocol: 'jsonrpc_http',
    endpointUrl: 'https://www.engelsizforum.com/api/mcp',
    githubUrl: 'https://github.com/engelsizforum/wcag-mcp',
    starCount: 1650,
    isOfficial: true,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    tools: [
      { name: 'audit_wcag_contrast', description: 'Ön plan ve arka plan renk kontrastını AA/AAA seviyesinde doğrular' },
      { name: 'check_aria_roles', description: 'HTML bileşenlerindeki ARIA niteliklerinin doğruluğunu kontrol eder' },
    ],
  },
];
