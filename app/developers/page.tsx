'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Key, 
  Shield, 
  Copy, 
  Check, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Code2, 
  AlertTriangle, 
  Terminal, 
  Lock, 
  CheckCircle2, 
  Globe, 
  LogIn,
  Layers,
  Home,
  Info,
  Server,
  Cpu,
  ArrowRight,
  Play,
  Send,
  Clock,
  Sparkles,
  Accessibility,
  Sliders,
  Download,
  Eye,
  Type,
  Volume2,
  Palette,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { SiteLayout } from '@/components/layout/site-layout';
import { EngelsizForumLogo, EngelsizForumLoginButton } from '@/components/ui/engelsizforum-brand';
import { cn } from '@/lib/utils';

interface OAuthApp {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at?: string;
}

export default function DeveloperPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [activeTab, setActiveTab] = useState<'apps' | 'docs' | 'button' | 'widget' | 'rest' | 'console' | 'webmcp'>('apps');
  const [selectedDocLang, setSelectedDocLang] = useState<'nextauth' | 'nodejs' | 'python' | 'php'>('nextauth');

  // Erişilebilirlik Widget'ı Generator & Wappalyzer Test State
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [widgetColor, setWidgetColor] = useState<string>('#185886');
  const [widgetLang, setWidgetLang] = useState<'tr' | 'en'>('tr');
  const [widgetCodeTab, setWidgetCodeTab] = useState<'html' | 'react' | 'wappalyzer' | 'api'>('html');
  const [widgetSignatureCheck, setWidgetSignatureCheck] = useState<{
    checked: boolean;
    hasWindowGlobal: boolean;
    hasMetaTag: boolean;
    hasDomElement: boolean;
    hasScriptEndpoint: boolean;
    version: string;
  }>({
    checked: false,
    hasWindowGlobal: false,
    hasMetaTag: false,
    hasDomElement: false,
    hasScriptEndpoint: false,
    version: '1.0.0',
  });

  const runSignatureCheck = () => {
    if (typeof window === 'undefined') return;

    if (!(window as any).EngelsizAccessibility && !document.getElementById('engelsiz-widget-script')) {
      const s = document.createElement('script');
      s.id = 'engelsiz-widget-script';
      s.src = '/widget/engelsiz-accessibility.js';
      s.async = true;
      document.body.appendChild(s);
    }

    setTimeout(() => {
      const hasWindowGlobal = typeof window !== 'undefined' && !!(window as any).EngelsizAccessibility;
      const hasMetaTag = typeof document !== 'undefined' && !!document.querySelector('meta[name="engelsiz-accessibility"]');
      const hasDomElement = typeof document !== 'undefined' && !!document.getElementById('engelsiz-accessibility-widget');
      const version = (window as any)?.EngelsizAccessibility?.version || '1.0.0';

      setWidgetSignatureCheck({
        checked: true,
        hasWindowGlobal,
        hasMetaTag,
        hasDomElement,
        hasScriptEndpoint: true,
        version,
      });
    }, 400);
  };

  // Logolu Giriş Butonu Generator State
  const [btnTheme, setBtnTheme] = useState<'green' | 'blue' | 'dark' | 'white'>('green');
  const [btnSize, setBtnSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [btnLayout, setBtnLayout] = useState<'split' | 'solid' | 'badge'>('split');
  const [btnAppClientId, setBtnAppClientId] = useState<string>('');
  const [btnCodeType, setBtnCodeType] = useState<'html' | 'react' | 'svg' | 'logo'>('html');

  // Canlı API Test Konsolu State
  const [consoleEndpoint, setConsoleEndpoint] = useState<'balthazard' | 'discussions' | 'userinfo' | 'openid' | 'webmcp'>('balthazard');
  const [consoleMethod, setConsoleMethod] = useState<'GET' | 'POST'>('POST');
  const [consoleUrl, setConsoleUrl] = useState('/api/v1/calculate/balthazard');
  const [consoleBody, setConsoleBody] = useState(JSON.stringify({ rates: [40, 20, 10] }, null, 2));
  const [consoleToken, setConsoleToken] = useState('');
  const [consoleLoading, setConsoleLoading] = useState(false);
  const [consoleResponse, setConsoleResponse] = useState<any>(null);
  const [consoleStatus, setConsoleStatus] = useState<number | null>(null);
  const [consoleLatency, setConsoleLatency] = useState<number | null>(null);

  const handleSelectEndpoint = (ep: 'balthazard' | 'discussions' | 'userinfo' | 'openid' | 'webmcp') => {
    setConsoleEndpoint(ep);
    setConsoleResponse(null);
    setConsoleStatus(null);
    setConsoleLatency(null);

    if (ep === 'balthazard') {
      setConsoleMethod('POST');
      setConsoleUrl('/api/v1/calculate/balthazard');
      setConsoleBody(JSON.stringify({ rates: [40, 20, 10] }, null, 2));
    } else if (ep === 'discussions') {
      setConsoleMethod('GET');
      setConsoleUrl('/api/discussions?limit=5&page=1');
      setConsoleBody('');
    } else if (ep === 'userinfo') {
      setConsoleMethod('GET');
      setConsoleUrl('/api/oauth/userinfo');
      setConsoleBody('');
    } else if (ep === 'openid') {
      setConsoleMethod('GET');
      setConsoleUrl('/api/well-known/openid-configuration');
      setConsoleBody('');
    } else if (ep === 'webmcp') {
      setConsoleMethod('GET');
      setConsoleUrl('/api/well-known/mcp.json');
      setConsoleBody('');
    }
  };

  const handleExecuteConsoleRequest = async () => {
    try {
      setConsoleLoading(true);
      setConsoleResponse(null);
      setConsoleStatus(null);
      const startTime = performance.now();

      const headers: Record<string, string> = {};
      if (consoleMethod === 'POST') {
        headers['Content-Type'] = 'application/json';
      }
      if (consoleToken.trim()) {
        headers['Authorization'] = `Bearer ${consoleToken.trim()}`;
      }

      const res = await fetch(consoleUrl, {
        method: consoleMethod,
        headers,
        body: consoleMethod === 'POST' && consoleBody.trim() ? consoleBody.trim() : undefined,
      });

      const endTime = performance.now();
      setConsoleLatency(Math.round(endTime - startTime));
      setConsoleStatus(res.status);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setConsoleResponse(data);
      } else {
        const text = await res.text();
        setConsoleResponse(text);
      }
    } catch (err: any) {
      setConsoleStatus(500);
      setConsoleResponse({ error: 'İstek başarısız oldu', details: err.message });
    } finally {
      setConsoleLoading(false);
    }
  };

  // Modal durumları
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<OAuthApp | null>(null);
  const [secretModalData, setSecretModalData] = useState<{ clientId: string; clientSecret: string; appName: string } | null>(null);

  // Form durumları
  const [formName, setFormName] = useState('');
  const [formRedirectUris, setFormRedirectUris] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ message: string; details?: string; hint?: string } | null>(null);

  // Kopyalama geri bildirimi
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Uygulama verilerini yükle
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setLoadError(null);
      
      const res = await fetch('/api/developer/apps');
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const loadedApps = data.apps || [];
        setApps(loadedApps);
        if (loadedApps.length > 0) {
          setBtnAppClientId(loadedApps[0].client_id);
        }
        setLoadError(null);
      } else {
        setLoadError({
          message: data.message || 'Uygulamalar listelenirken bir hata oluştu.',
          details: data.details,
          hint: data.hint,
        });
      }
    } catch (err: any) {
      console.error('Veri yükleme hatası:', err);
      setLoadError({
        message: 'Sunucuya bağlanırken bir hata oluştu.',
        details: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
      setApps([]);
    }
  }, [user, authLoading, loadData]);

  // Yeni Uygulama Oluşturma
  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const res = await fetch('/api/developer/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formName,
          redirect_uris: formRedirectUris,
          description: formDescription,
          logo_url: formLogoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Uygulama oluşturulamadı.');
        return;
      }

      // Başarılı: Secret Modalini Aç (Sadece bir kez gösterilir!)
      setSecretModalData({
        clientId: data.app.client_id,
        clientSecret: data.plain_client_secret,
        appName: data.app.client_name,
      });

      setIsCreateModalOpen(false);
      setFormName('');
      setFormRedirectUris('');
      setFormDescription('');
      setFormLogoUrl('');
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Uygulama Güncelleme
  const handleUpdateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setFormError(null);
    setFormSubmitting(true);

    try {
      const res = await fetch(`/api/developer/apps/${editingApp.client_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formName,
          redirect_uris: formRedirectUris,
          description: formDescription,
          logo_url: formLogoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Uygulama güncellenemedi.');
        return;
      }

      setIsEditModalOpen(false);
      setEditingApp(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Secret Yenileme (Rotate Secret)
  const handleRotateSecret = async (app: OAuthApp) => {
    const confirmRotate = window.confirm(
      `"${app.client_name}" uygulamasının Gizli Anahtarını (Client Secret) yenilemek istediğinize emin misiniz?\n\nUYARI: Mevcut anahtarınız anında geçersiz kalacak ve yeni anahtar sadece bir kez gösterilecektir!`
    );
    if (!confirmRotate) return;

    try {
      const res = await fetch(`/api/developer/apps/${app.client_id}/rotate-secret`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Anahtar yenilenemedi.');
        return;
      }

      setSecretModalData({
        clientId: app.client_id,
        clientSecret: data.plain_client_secret,
        appName: app.client_name,
      });
    } catch {
      alert('Anahtar yenileme sırasında bağlantı hatası oluştu.');
    }
  };

  // Uygulama Silme
  const handleDeleteApp = async (app: OAuthApp) => {
    const confirmDelete = window.confirm(
      `"${app.client_name}" uygulamasını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz. Bu uygulamaya bağlı tüm kullanıcı oturumları ve OAuth token'ları anında iptal edilecektir.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/developer/apps/${app.client_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Silme işlemi başarısız oldu.');
      }
    } catch {
      alert('Silme işlemi sırasında hata oluştu.');
    }
  };

  const openEditModal = (app: OAuthApp) => {
    setEditingApp(app);
    setFormName(app.client_name);
    setFormRedirectUris(app.redirect_uris.join('\n'));
    setFormDescription(app.description || '');
    setFormLogoUrl(app.logo_url || '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const getSampleAuthUrl = (app: OAuthApp) => {
    const firstRedirect = app.redirect_uris[0] || 'http://localhost:3000/api/auth/callback/engelsizforum';
    return `/api/oauth/authorize?client_id=${encodeURIComponent(app.client_id)}&redirect_uri=${encodeURIComponent(firstRedirect)}&response_type=code&scope=read&state=ef_test_${Math.floor(Math.random() * 10000)}`;
  };

  return (
    <SiteLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 min-w-0">
        {/* Breadcrumb Navigation */}
        <nav className="bg-[#111B2E]/50 border border-[#1E293B] px-5 py-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 rounded-lg backdrop-blur-sm" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-400 font-bold transition-colors flex items-center gap-1.5">
            <Home size={14} />
            <span>Ana Sayfa</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="font-bold text-white uppercase tracking-widest text-[10px]">Geliştirici Portalı</span>
        </nav>

        {/* Developer Portal Header */}
        <header className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#111B2E] shadow-sm">
          <div className="bg-[#18243A]/50 text-indigo-300 font-bold uppercase text-[10px] tracking-[0.2em] py-3 px-6 flex flex-wrap items-center justify-between border-b border-[#1E293B] gap-4">
            <div className="flex items-center gap-2">
              <Code2 size={14} />
              <span>EngelsizForum Geliştirici Portalı</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              OAuth 2.0 / WebMCP
            </span>
          </div>

          <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  &ldquo;EngelsizForum ile Giriş Yap&rdquo; &amp; Canlı Mevzuat Entegrasyonu
                </h1>
                {user && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    <CheckCircle2 size={11} />
                    <span>Aktif Oturum</span>
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-normal">
                Kendi web sitenize, mobil uygulamanıza veya AI asistanlarınıza EngelsizForum OAuth 2.0 kimlik doğrulama, topluluk API&apos;leri ve WebMCP canlı mevzuat akışını entegre edin.
              </p>
            </div>

            {user ? (
              <button
                onClick={() => {
                  setFormName('');
                  setFormRedirectUris('http://localhost:3000/api/auth/callback/engelsizforum');
                  setFormDescription('');
                  setFormLogoUrl('');
                  setFormError(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-sm min-h-[44px]"
              >
                <Plus size={16} />
                <span>Yeni Uygulama Kaydet</span>
              </button>
            ) : (
              <Link
                href="/login?redirect=/developers"
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-sm min-h-[44px]"
              >
                <LogIn size={16} />
                <span>Giriş Yaparak Başla</span>
              </Link>
            )}
          </div>
        </header>

        {/* Tabs Navigation */}
        <nav className="flex flex-wrap gap-1.5 border border-[#1E293B] bg-[#111B2E] p-2 rounded-md shadow-inner overflow-x-auto scrollbar-none" role="tablist">
          {[
            { id: 'apps', label: 'Uygulamalarım', icon: Layers },
            { id: 'docs', label: 'OAuth 2.0 Rehberi', icon: Terminal },
            { id: 'button', label: 'Giriş Butonu', icon: LogIn },
            { id: 'widget', label: 'Widget', icon: Accessibility },
            { id: 'rest', label: 'REST API', icon: Server },
            { id: 'console', label: 'API Konsolu', icon: Play },
            { id: 'webmcp', label: 'WebMCP', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'widget') runSignatureCheck();
                }}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2 min-h-[40px] whitespace-nowrap border",
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'text-slate-400 hover:text-white bg-[#18243A] border-[#1E293B] hover:border-slate-600'
                )}
              >
                <Icon size={14} />
                <span>{tab.label} {tab.id === 'apps' && apps.length > 0 ? `(${apps.length})` : ''}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: APPS LIST */}
        {activeTab === 'apps' && (
          <div className="space-y-4">
            {!user ? (
              <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E]">
                <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center gap-2">
                  <Lock size={13} className="text-amber-400" />
                  <span>Geliştirici Girişi Gerekiyor</span>
                </div>
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Kendi OAuth 2.0 istemci uygulamanızı (Client ID &amp; Secret) oluşturmak ve API anahtarlarınızı yönetmek için foruma giriş yapın.
                  </p>
                  <Link
                    href="/login?redirect=/developers"
                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold transition-colors shadow-xs"
                  >
                    <LogIn size={13} />
                    <span>Giriş Yap / Üye Ol</span>
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="border border-[#1E293B] rounded-md p-8 text-center text-xs text-slate-400 bg-[#111B2E]">
                Uygulama listesi yükleniyor...
              </div>
            ) : loadError ? (
              <div className="border border-amber-500/30 rounded-md overflow-hidden bg-[#111B2E] shadow-xs">
                <div className="bg-amber-950/40 border-b border-amber-800/40 text-amber-200 font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span>Veritabanı / Şema Uyarısı</span>
                  </div>
                  <button
                    onClick={() => loadData()}
                    className="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Tekrar Dene</span>
                  </button>
                </div>
                <div className="p-5 space-y-3 text-xs text-slate-300">
                  <div className="font-semibold text-amber-200 flex items-center gap-2">
                    <span>{loadError.message}</span>
                  </div>
                  {loadError.details && (
                    <div className="p-2.5 bg-[#0B1220] text-amber-300 rounded-md font-mono text-[11px] break-all border border-[#1E293B]">
                      Hata Detayı: {loadError.details}
                    </div>
                  )}
                  <p className="text-slate-400 leading-relaxed">
                    {loadError.hint || 'Supabase projenizde `oauth_clients` tablosu eksik veya gerekli izinler tanımlanmamış. Lütfen aşağıdaki güncel SQL şemasını Supabase SQL Editöründe çalıştırarak veritabanınızı güncelleyin.'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => loadData()}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer min-h-[36px]"
                    >
                      <RefreshCw size={12} />
                      <span>Bağlantıyı Yeniden Kontrol Et</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('docs');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#18243A] border border-[#1E293B] hover:bg-[#1E293B] text-slate-200 px-3.5 py-2 text-xs font-semibold cursor-pointer min-h-[36px]"
                    >
                      <Code2 size={12} />
                      <span>Dokümantasyon &amp; Kurulum</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : apps.length === 0 ? (
              <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-xs">
                <div className="bg-[#18243A] border-b border-[#1E293B] text-slate-200 font-bold text-xs uppercase py-2.5 px-4">
                  Kayıtlı Uygulama Bulunamadı
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-md bg-[#18243A] text-indigo-400 border border-[#1E293B] flex items-center justify-center mx-auto">
                    <Key size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Henüz Kayıtlı Bir Uygulamanız Yok</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Kendi web siteniz veya mobil uygulamanız için ilk OAuth 2.0 istemcinizi oluşturun. Client ID ve Secret anında üretilecektir.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormName('');
                      setFormRedirectUris('http://localhost:3000/api/auth/callback/engelsizforum');
                      setFormDescription('');
                      setFormLogoUrl('');
                      setFormError(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-xs transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Plus size={14} />
                    <span>İlk Uygulamanızı Oluşturun</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-xs">
                <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                  <span>Kayıtlı OAuth 2.0 İstemcileri ({apps.length})</span>
                  <span className="text-slate-400 text-[10px] font-normal">İstemci Kimlikleri ve Yönlendirme Adresleri</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#18243A]/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Uygulama Adı</th>
                        <th className="p-3">Client ID</th>
                        <th className="p-3">Yönlendirme URI (Callback)</th>
                        <th className="p-3">Kayıt Tarihi</th>
                        <th className="p-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {apps.map((app) => (
                        <tr key={app.client_id} className="hover:bg-[#18243A]/40 transition-colors">
                          <td className="p-3 align-top font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              <span>{app.client_name}</span>
                            </div>
                            {app.description && (
                              <p className="text-[11px] text-slate-400 font-normal mt-0.5 pl-4">
                                {app.description}
                              </p>
                            )}
                          </td>
                          <td className="p-3 align-top font-mono text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5 bg-[#18243A] border border-[#1E293B] px-2 py-1 rounded-md w-fit">
                              <span className="truncate max-w-[160px] text-indigo-300">{app.client_id}</span>
                              <button
                                onClick={() => copyToClipboard(app.client_id, `cid-${app.client_id}`)}
                                title="Client ID'yi kopyala"
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                {copiedKey === `cid-${app.client_id}` ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="space-y-1">
                              {app.redirect_uris.map((uri, idx) => (
                                <div key={idx} className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                                  {uri}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 align-top text-slate-400 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-3 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getSampleAuthUrl(app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="OAuth Giriş Ekranını Test Et"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-indigo-300 border border-[#1E293B] text-[11px] font-bold transition-colors"
                              >
                                <ExternalLink size={11} />
                                <span>Test Et</span>
                              </a>
                              <button
                                onClick={() => openEditModal(app)}
                                title="Uygulamayı Düzenle"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#18243A] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <Edit3 size={11} />
                                <span>Düzenle</span>
                              </button>
                              <button
                                onClick={() => handleRotateSecret(app)}
                                title="Client Secret'i Yenile"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#18243A] hover:bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <RefreshCw size={11} />
                                <span>Secret Yenile</span>
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app)}
                                title="Uygulamayı Sil"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#18243A] hover:bg-rose-950/40 text-rose-300 border border-rose-800/40 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <Trash2 size={11} />
                                <span>Sil</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OAUTH 2.0 INTEGRATION GUIDE */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            {/* Quick Action: Logolu Giriş Butonu Banner */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold shadow-2xs">
                  <LogIn size={15} />
                </div>
                <div>
                  <div className="font-bold text-white">Resmi &ldquo;EngelsizForum ile Giriş Yap&rdquo; Butonunu Kullanın</div>
                  <div className="text-slate-300 text-[11px]">Standart resmi kurumsal logomuz ile hazır buton kodunu hemen kopyalayabilirsiniz.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('button')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors shadow-2xs self-start sm:self-auto min-h-[36px]"
              >
                Logolu Buton Kılavuzu &rarr;
              </button>
            </div>

            {/* Endpoints Table */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                <span>OAuth 2.0 Standart Uç Noktaları (Endpoints)</span>
                <span className="text-[10px] text-slate-400 font-mono">RFC 6749 Standardı</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#18243A]/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3">Protokol Adımı</th>
                      <th className="p-3">Metot</th>
                      <th className="p-3">Uç Nokta (URL)</th>
                      <th className="p-3">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    <tr className="hover:bg-[#18243A]/30 transition-colors">
                      <td className="p-3 font-bold text-white">Yetkilendirme (Authorize)</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">GET</td>
                      <td className="p-3 font-mono text-indigo-300 select-all">https://engelsizforum.com/api/oauth/authorize</td>
                      <td className="p-3 text-slate-300">Kullanıcının izin onayını verdiği web consent sayfası.</td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30 transition-colors">
                      <td className="p-3 font-bold text-white">Erişim Jetonu (Token)</td>
                      <td className="p-3 font-mono text-indigo-400 font-bold">POST</td>
                      <td className="p-3 font-mono text-indigo-300 select-all">https://engelsizforum.com/api/oauth/token</td>
                      <td className="p-3 text-slate-300">Yetkilendirme kodu (code) ile Bearer Access Token takası.</td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30 transition-colors">
                      <td className="p-3 font-bold text-white">Kullanıcı Bilgileri (Userinfo)</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">GET</td>
                      <td className="p-3 font-mono text-indigo-300 select-all">https://engelsizforum.com/api/oauth/userinfo</td>
                      <td className="p-3 text-slate-300">Bearer token ile kullanıcının ID, isim, e-posta ve rollerini alma.</td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30 transition-colors">
                      <td className="p-3 font-bold text-white">Jeton İptali (Revoke)</td>
                      <td className="p-3 font-mono text-indigo-400 font-bold">POST</td>
                      <td className="p-3 font-mono text-indigo-300 select-all">https://engelsizforum.com/api/oauth/revoke</td>
                      <td className="p-3 text-slate-300">Kullanıcı oturumu kapattığında token&apos;ı sunucuda geçersiz kılma.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between border-b border-[#1E293B]">
                <span>Entegrasyon Kod Örnekleri</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {(['nextauth', 'nodejs', 'python', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedDocLang(lang)}
                      className={`px-2.5 py-1 rounded-md font-bold uppercase cursor-pointer transition-colors ${
                        selectedDocLang === lang
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-[#18243A]'
                      }`}
                    >
                      {lang === 'nextauth' ? 'NextAuth.js' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] text-slate-100 font-mono text-xs overflow-x-auto relative border border-[#1E293B]">
                <button
                  onClick={() => {
                    const codeSnippets: Record<string, string> = {
                      nextauth: `// NextAuth.js (Auth.js v5) Özel Sağlayıcı Yapılandırması
export const authOptions = {
  providers: [
    {
      id: "engelsizforum",
      name: "EngelsizForum",
      type: "oauth",
      authorization: {
        url: "https://engelsizforum.com/api/oauth/authorize",
        params: { scope: "read" },
      },
      token: "https://engelsizforum.com/api/oauth/token",
      userinfo: "https://engelsizforum.com/api/oauth/userinfo",
      clientId: process.env.ENGELSIZFORUM_CLIENT_ID,
      clientSecret: process.env.ENGELSIZFORUM_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    },
  ],
};`,
                      nodejs: `// Node.js / Express ile Token Takası
const response = await fetch("https://engelsizforum.com/api/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET,
    code: authCodeFromQuery,
    redirect_uri: "http://localhost:3000/api/auth/callback/engelsizforum",
  }),
});
const { access_token } = await response.json();`,
                      python: `# Python / FastAPI / Requests ile Kullanıcı Bilgisi Alma
import requests

headers = {"Authorization": f"Bearer {access_token}"}
userinfo = requests.get("https://engelsizforum.com/api/oauth/userinfo", headers=headers).json()
print(f"Hoş geldin, {userinfo['name']}!")`,
                      php: `// PHP cURL ile Jeton Alma
$ch = curl_init("https://engelsizforum.com/api/oauth/token");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type'    => 'authorization_code',
    'client_id'     => $clientId,
    'client_secret' => $clientSecret,
    'code'          => $_GET['code'],
    'redirect_uri'  => $redirectUri,
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($ch), true);`,
                    };
                    copyToClipboard(codeSnippets[selectedDocLang] || '', 'code-snippet');
                  }}
                  className="absolute top-3 right-3 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-sm text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'code-snippet' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Kopyala</span>
                </button>

                {selectedDocLang === 'nextauth' && (
                  <pre className="leading-relaxed">
{`// NextAuth.js (Auth.js) Özel Sağlayıcı Yapılandırması
export const authOptions = {
  providers: [
    {
      id: "engelsizforum",
      name: "EngelsizForum",
      type: "oauth",
      authorization: {
        url: "https://engelsizforum.com/api/oauth/authorize",
        params: { scope: "read" },
      },
      token: "https://engelsizforum.com/api/oauth/token",
      userinfo: "https://engelsizforum.com/api/oauth/userinfo",
      clientId: process.env.ENGELSIZFORUM_CLIENT_ID,
      clientSecret: process.env.ENGELSIZFORUM_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    },
  ],
};`}
                  </pre>
                )}

                {selectedDocLang === 'nodejs' && (
                  <pre className="leading-relaxed">
{`// Node.js / Express ile Token Takası
const response = await fetch("https://engelsizforum.com/api/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET,
    code: authCodeFromQuery,
    redirect_uri: "http://localhost:3000/api/auth/callback/engelsizforum",
  }),
});
const { access_token } = await response.json();`}
                  </pre>
                )}

                {selectedDocLang === 'python' && (
                  <pre className="leading-relaxed">
{`# Python / FastAPI / Requests ile Kullanıcı Bilgisi Alma
import requests

headers = {"Authorization": f"Bearer {access_token}"}
userinfo = requests.get("https://engelsizforum.com/api/oauth/userinfo", headers=headers).json()
print(f"Hoş geldin, {userinfo['name']}!")`}
                  </pre>
                )}

                {selectedDocLang === 'php' && (
                  <pre className="leading-relaxed">
{`// PHP cURL ile Jeton Alma
$ch = curl_init("https://engelsizforum.com/api/oauth/token");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type'    => 'authorization_code',
    'client_id'     => $clientId,
    'client_secret' => $clientSecret,
    'code'          => $_GET['code'],
    'redirect_uri'  => $redirectUri,
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($ch), true);`}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGOLU GİRİŞ BUTONU & MARKA KILAVUZU */}
        {activeTab === 'button' && (
          <div className="space-y-5">
            {/* Header Block */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <LogIn size={14} className="text-indigo-400" />
                  <span>Resmi &ldquo;EngelsizForum ile Giriş Yap&rdquo; Logolu Buton Kılavuzu</span>
                </div>
                <span className="text-[11px] font-normal text-indigo-300 bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-800/40">
                  Marka &amp; UI Standartları
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#18243A]/50 border border-[#1E293B] rounded-md">
                  <div className="space-y-1 max-w-2xl text-xs sm:text-sm text-slate-300">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400 shrink-0" />
                      <span>Logosuz Düz Butondan &rarr; Resmi Kurumsal Logolu Giriş Butonuna Geçiş</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Standart jenerik dünya ikonu yerine, EngelsizForum&apos;un tescilli resmi logosunu taşıyan butonları kullanarak kullanıcılarınızda güven oluşturun.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 p-2.5 bg-[#0B1220] rounded-md border border-[#1E293B] shadow-2xs">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Önceki (Jenerik)</span>
                      <div className="bg-slate-800 text-slate-300 px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 opacity-70">
                        <Globe size={11} />
                        <span>Giriş Yap</span>
                      </div>
                    </div>
                    <span className="text-slate-600 font-bold">&rarr;</span>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Yeni (Resmi Logolu)</span>
                      <div className="bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1.5 shadow-xs">
                        <div className="w-3.5 h-3.5 rounded-sm bg-indigo-900 flex items-center justify-center text-[9px] font-black leading-none">
                          E
                        </div>
                        <span>EngelsizForum</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* İnteraktif Buton Yapılandırıcı */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                  {/* Sol Sütun: Ayarlar */}
                  <div className="lg:col-span-5 space-y-4 bg-[#18243A]/40 p-4 border border-[#1E293B] rounded-md">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wide border-b border-[#1E293B] pb-2">
                      1. Buton Tasarımını Özelleştirin
                    </h3>

                    {/* Tema Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Tema &amp; Renk Paleti:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBtnTheme('green')}
                          className={`p-2 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'green'
                              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold ring-1 ring-emerald-500'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="text-xs">Yeşil (Canlı)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('blue')}
                          className={`p-2 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'blue'
                              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold ring-1 ring-indigo-500'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <span className="text-xs">İndigo (Resmi)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('dark')}
                          className={`p-2 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'dark'
                              ? 'border-slate-500 bg-slate-800 text-white font-bold ring-1 ring-slate-500'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0B1220] border border-slate-700 shrink-0"></span>
                          <span className="text-xs">Koyu Gece</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('white')}
                          className={`p-2 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'white'
                              ? 'border-white bg-white text-slate-950 font-bold ring-1 ring-white'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-white shrink-0"></span>
                          <span className="text-xs">Beyaz Çerçeveli</span>
                        </button>
                      </div>
                    </div>

                    {/* Boyut Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Buton Boyutu:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setBtnSize(sz)}
                            className={`py-2 px-2 rounded-md border text-center text-xs cursor-pointer transition-all ${
                              btnSize === sz
                                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold ring-1 ring-indigo-500'
                                : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                            }`}
                          >
                            {sz === 'sm' ? 'Küçük (36px)' : sz === 'md' ? 'Standart (44px)' : 'Büyük (52px)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Düzeni */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Logo Düzeni:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBtnLayout('split')}
                          className={`p-2 rounded-md border text-left text-xs cursor-pointer transition-all ${
                            btnLayout === 'split'
                              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold ring-1 ring-indigo-500'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="block font-bold">Logo Rozeti + Metin</span>
                          <span className="text-[10px] text-slate-400 font-normal">Kompakt kurumsal rozet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnLayout('badge')}
                          className={`p-2 rounded-md border text-left text-xs cursor-pointer transition-all ${
                            btnLayout === 'badge'
                              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold ring-1 ring-indigo-500'
                              : 'border-[#1E293B] bg-[#18243A] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="block font-bold">Tam Wordmark Logo</span>
                          <span className="text-[10px] text-slate-400 font-normal">Tam kurumsal logo</span>
                        </button>
                      </div>
                    </div>

                    {/* Kayıtlı Uygulama Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">Yetkilendirilecek Uygulamanız:</label>
                      {apps.length > 0 ? (
                        <select
                          value={btnAppClientId}
                          onChange={(e) => setBtnAppClientId(e.target.value)}
                          className="w-full text-xs p-2 bg-[#18243A] border border-[#1E293B] rounded-md text-white focus:outline-none focus:border-indigo-500"
                        >
                          {apps.map((app) => (
                            <option key={app.client_id} value={app.client_id}>
                              {app.client_name} ({app.client_id.substring(0, 16)}...)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={btnAppClientId || 'YOUR_CLIENT_ID'}
                          onChange={(e) => setBtnAppClientId(e.target.value)}
                          placeholder="client_id giriniz"
                          className="w-full text-xs p-2 bg-[#18243A] border border-[#1E293B] rounded-md font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Sağ Sütun: Canlı Önizleme & Kod Kopyalama */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Canlı Önizleme Kartı */}
                    <div className="p-6 bg-[#0B1220] border border-[#1E293B] rounded-md flex flex-col items-center justify-center gap-4 text-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Canlı Buton Önizlemesi
                      </span>

                      <div className="p-4 flex items-center justify-center">
                        <EngelsizForumLoginButton
                          theme={btnTheme}
                          size={btnSize}
                          layout={btnLayout}
                          clientId={btnAppClientId || 'YOUR_CLIENT_ID'}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <a
                          href={`/oauth/authorize?client_id=${encodeURIComponent(btnAppClientId || 'YOUR_CLIENT_ID')}&redirect_uri=http://localhost:3000/api/auth/callback/engelsizforum&response_type=code&scope=read&state=preview_test`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
                        >
                          <ExternalLink size={13} />
                          <span>Onay Ekranını Test Et (Canlı Logo Önizleme)</span>
                        </a>
                      </div>
                    </div>

                    {/* Kod Kopyalama Sekmeleri */}
                    <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E]">
                      <div className="bg-[#18243A] text-white p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#1E293B]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setBtnCodeType('html')}
                            className={`px-2.5 py-1.5 rounded-md font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#111B2E]'
                            }`}
                          >
                            HTML &amp; CSS
                          </button>
                          <button
                            onClick={() => setBtnCodeType('react')}
                            className={`px-2.5 py-1.5 rounded-md font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'react' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#111B2E]'
                            }`}
                          >
                            React / Next.js
                          </button>
                          <button
                            onClick={() => setBtnCodeType('svg')}
                            className={`px-2.5 py-1.5 rounded-md font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'svg' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#111B2E]'
                            }`}
                          >
                            Doğrudan İmaj (SVG Link)
                          </button>
                          <button
                            onClick={() => setBtnCodeType('logo')}
                            className={`px-2.5 py-1.5 rounded-md font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'logo' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#111B2E]'
                            }`}
                          >
                            Resmi Logo (Image 2 SVG)
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            let snippet = '';
                            const curClientId = btnAppClientId || 'YOUR_CLIENT_ID';
                            const bgColor = btnTheme === 'green' ? '#00875a' : btnTheme === 'blue' ? '#185886' : btnTheme === 'dark' ? '#0f172a' : '#ffffff';
                            const textColor = btnTheme === 'white' ? '#0f172a' : '#ffffff';
                            const borderColor = btnTheme === 'green' ? '#006644' : btnTheme === 'blue' ? '#12466b' : btnTheme === 'dark' ? '#1e293b' : '#cbd5e1';

                            if (btnCodeType === 'html') {
                              snippet = `<!-- EngelsizForum ile Giriş Yap - Logolu Resmi Buton -->
<a href="https://engelsizforum.com/api/oauth/authorize?client_id=${curClientId}&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read&state=xyz"
   style="display:inline-flex;align-items:center;gap:10px;background:${bgColor};color:${textColor};padding:10px 16px;border-radius:4px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:700;border:1px solid ${borderColor};box-shadow:0 1px 2px rgba(0,0,0,0.06);transition:opacity 0.15s ease;"
   onmouseover="this.style.opacity='0.92'"
   onmouseout="this.style.opacity='1'">
  <!-- EngelsizForum Resmi Logo Rozeti -->
  <span style="display:inline-flex;align-items:center;justify-content:center;background:#185886;width:28px;height:28px;border-radius:3px;border:1px solid rgba(255,255,255,0.25);">
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
      <path d="M6 8h14v3.5H10v3.5h7v3.5h-7V23h10V26H6V8z" fill="#FFFFFF"/>
      <circle cx="24" cy="9.5" r="2.5" fill="#38BDF8"/>
      <path d="M21 14h6v3h-3.5v9H21V14z" fill="#7DD3FC"/>
    </svg>
  </span>
  <span>EngelsizForum <span style="font-weight:400;opacity:0.9;">ile Giriş Yap</span></span>
</a>`;
                            } else if (btnCodeType === 'react') {
                              snippet = `// React / Next.js Bileşeni
import React from 'react';

export function LoginWithEngelsizForum() {
  const authUrl = "https://engelsizforum.com/api/oauth/authorize?client_id=${curClientId}&redirect_uri=" + 
    encodeURIComponent(window.location.origin + "/api/auth/callback/engelsizforum") + 
    "&response_type=code&scope=read&state=ef_state";

  return (
    <a
      href={authUrl}
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded bg-[${bgColor}] hover:opacity-90 text-[${textColor}] font-bold text-sm border border-[${borderColor}] shadow-xs transition-all select-none"
    >
      <div className="w-7 h-7 rounded bg-[#185886] flex items-center justify-center border border-white/20">
        <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
          <path d="M6 8h14v3.5H10v3.5h7v3.5h-7V23h10V26H6V8z" fill="#FFFFFF" />
          <circle cx="24" cy="9.5" r="2.5" fill="#38BDF8" />
          <path d="M21 14h6v3h-3.5v9H21V14z" fill="#7DD3FC" />
        </svg>
      </div>
      <span>EngelsizForum <span className="font-normal opacity-90">ile Giriş Yap</span></span>
    </a>
  );
}`;
                            } else if (btnCodeType === 'svg') {
                              snippet = `<!-- Hosted Dinamik SVG Buton (Tek Satır) -->
<a href="https://engelsizforum.com/api/oauth/authorize?client_id=${curClientId}&redirect_uri=YOUR_REDIRECT_URI&response_type=code">
  <img src="https://engelsizforum.com/api/brand/button?theme=${btnTheme}&text=full" alt="EngelsizForum ile Giriş Yap" width="250" height="44" />
</a>`;
                            } else {
                              snippet = `<!-- EngelsizForum Resmi Logosu (Image 2 Vektör) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 36" width="196" height="36">
  <rect width="196" height="36" rx="3" fill="#185886"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
    <text x="12" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">ENGELS</text>
    <text x="100.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900">I</text>
    <circle cx="104.5" cy="10.5" r="2.5" fill="#38BDF8"/>
    <text x="110.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">Z</text>
    <text x="126" y="25.5" fill="#7DD3FC" font-size="21" font-weight="300" letter-spacing="0.4px">FORUM</text>
  </g>
</svg>`;
                            }

                            copyToClipboard(snippet, 'btn-snippet');
                          }}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xs font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'btn-snippet' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>Kodu Kopyala</span>
                        </button>
                      </div>

                      <div className="p-3 bg-[#0f172a] text-slate-200 font-mono text-[11px] overflow-x-auto max-h-[220px]">
                        {btnCodeType === 'html' && (
                          <pre className="leading-relaxed">
{`<!-- EngelsizForum ile Giriş Yap - Logolu Resmi Buton -->
<a href="https://engelsizforum.com/api/oauth/authorize?client_id=${btnAppClientId || 'YOUR_CLIENT_ID'}&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read&state=xyz"
   style="display:inline-flex;align-items:center;gap:10px;background:${btnTheme === 'green' ? '#00875a' : btnTheme === 'blue' ? '#185886' : btnTheme === 'dark' ? '#0f172a' : '#ffffff'};color:${btnTheme === 'white' ? '#0f172a' : '#ffffff'};padding:10px 16px;border-radius:4px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:700;border:1px solid ${btnTheme === 'green' ? '#006644' : btnTheme === 'blue' ? '#12466b' : btnTheme === 'dark' ? '#1e293b' : '#cbd5e1'};box-shadow:0 1px 2px rgba(0,0,0,0.06);"
   onmouseover="this.style.opacity='0.92'"
   onmouseout="this.style.opacity='1'">
  <span style="display:inline-flex;align-items:center;justify-content:center;background:#185886;width:28px;height:28px;border-radius:3px;border:1px solid rgba(255,255,255,0.25);">
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
      <path d="M6 8h14v3.5H10v3.5h7v3.5h-7V23h10V26H6V8z" fill="#FFFFFF"/>
      <circle cx="24" cy="9.5" r="2.5" fill="#38BDF8"/>
      <path d="M21 14h6v3h-3.5v9H21V14z" fill="#7DD3FC"/>
    </svg>
  </span>
  <span>EngelsizForum <span style="font-weight:400;opacity:0.9;">ile Giriş Yap</span></span>
</a>`}
                          </pre>
                        )}

                        {btnCodeType === 'react' && (
                          <pre className="leading-relaxed">
{`// React / Next.js Bileşeni
import React from 'react';

export function LoginWithEngelsizForum() {
  const authUrl = "https://engelsizforum.com/api/oauth/authorize?client_id=${btnAppClientId || 'YOUR_CLIENT_ID'}&redirect_uri=" + 
    encodeURIComponent(window.location.origin + "/api/auth/callback/engelsizforum") + 
    "&response_type=code&scope=read&state=ef_state";

  return (
    <a
      href={authUrl}
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded bg-[${btnTheme === 'green' ? '#00875a' : btnTheme === 'blue' ? '#185886' : btnTheme === 'dark' ? '#0f172a' : '#ffffff'}] text-white font-bold text-sm shadow-xs transition-all"
    >
      <div className="w-7 h-7 rounded bg-[#185886] flex items-center justify-center border border-white/20">
        <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
          <path d="M6 8h14v3.5H10v3.5h7v3.5h-7V23h10V26H6V8z" fill="#FFFFFF" />
          <circle cx="24" cy="9.5" r="2.5" fill="#38BDF8" />
          <path d="M21 14h6v3h-3.5v9H21V14z" fill="#7DD3FC" />
        </svg>
      </div>
      <span>EngelsizForum <span className="font-normal opacity-90">ile Giriş Yap</span></span>
    </a>
  );
}`}
                          </pre>
                        )}

                        {btnCodeType === 'svg' && (
                          <pre className="leading-relaxed">
{`<!-- Hosted Dinamik SVG Buton (Tek Satır, Her Yerde Çalışır) -->
<a href="https://engelsizforum.com/api/oauth/authorize?client_id=${btnAppClientId || 'YOUR_CLIENT_ID'}&redirect_uri=YOUR_REDIRECT_URI&response_type=code">
  <img src="https://engelsizforum.com/api/brand/button?theme=${btnTheme}&text=full" alt="EngelsizForum ile Giriş Yap" width="250" height="44" />
</a>`}
                          </pre>
                        )}

                        {btnCodeType === 'logo' && (
                          <pre className="leading-relaxed">
{`<!-- EngelsizForum Resmi Logo Wordmark (2. Görseldeki Orijinal Vektör) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 36" width="196" height="36">
  <rect width="196" height="36" rx="3" fill="#185886"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
    <text x="12" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">ENGELS</text>
    <text x="100.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900">I</text>
    <circle cx="104.5" cy="10.5" r="2.5" fill="#38BDF8"/>
    <text x="110.5" y="25.5" fill="#FFFFFF" font-size="21" font-weight="900" letter-spacing="-0.3px">Z</text>
    <text x="126" y="25.5" fill="#7DD3FC" font-size="21" font-weight="300" letter-spacing="0.4px">FORUM</text>
  </g>
</svg>`}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marka Varlıkları İndirme / CDN Bölümü */}
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Doğrudan İndirilebilir Varlıklar &amp; CDN Linkleri
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EngelsizForumLogo size="sm" showBackground={true} />
                        <div>
                          <div className="text-xs font-bold text-slate-800">Resmi Logo (Image 2)</div>
                          <div className="text-[10px] text-slate-500">196x36 SVG Vektör</div>
                        </div>
                      </div>
                      <a
                        href="/brand/engelsizforum-logo.svg"
                        download="engelsizforum-logo.svg"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-[10px] font-bold"
                      >
                        İndir
                      </a>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#00875a] rounded-xs flex items-center justify-center text-white text-[10px] font-bold">
                          SVG
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Yeşil Logolu Buton</div>
                          <div className="text-[10px] text-slate-500">250x44 SVG Vektör</div>
                        </div>
                      </div>
                      <a
                        href="/brand/btn-login-green.svg"
                        download="btn-login-green.svg"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-[10px] font-bold"
                      >
                        İndir
                      </a>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#185886] rounded-xs flex items-center justify-center text-white text-[10px] font-bold">
                          SVG
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Lacivert Logolu Buton</div>
                          <div className="text-[10px] text-slate-500">260x44 SVG Vektör</div>
                        </div>
                      </div>
                      <a
                        href="/brand/btn-login-blue.svg"
                        download="btn-login-blue.svg"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-[10px] font-bold"
                      >
                        İndir
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACCESSIBILITY WIDGET & WAPPALYZER INTEGRATION */}
        {activeTab === 'widget' && (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] text-white font-bold uppercase text-[12px] tracking-wider py-2.5 px-4 flex items-center justify-between border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <Accessibility size={16} className="text-indigo-400" />
                  <span>ENGELSİZ ERİŞİLEBİLİRLİK WIDGET&apos;I (EMBED SDK) &amp; WAPPALYZER TESPİTİ</span>
                </div>
                <span className="text-[11px] font-normal text-indigo-300 bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-800/40">
                  WCAG 2.1 AAA • Wappalyzer Kategori 89
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-slate-300 bg-[#111B2E]">
                <p className="leading-relaxed">
                  Her web sitesine tek bir satır kod ile tam donanımlı, yerli ve açık kaynaklı <strong>WCAG 2.1 AAA</strong> erişilebilirlik paneli entegre edin. Bu widget harici sitelerde çalışırken <strong>Wappalyzer</strong>, <strong>BuiltWith</strong> ve web tarayıcıları tarafından otomatik olarak tespit edilebilen küresel imzalara sahiptir.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 bg-[#18243A] border border-[#1E293B] rounded-md">
                    <div className="text-[10px] font-black uppercase text-indigo-400">Görme Desteği</div>
                    <div className="text-xs font-bold text-white mt-0.5">Yüksek Kontrast &amp; Büyüteç</div>
                  </div>
                  <div className="p-2.5 bg-[#18243A] border border-[#1E293B] rounded-md">
                    <div className="text-[10px] font-black uppercase text-emerald-400">Nöroçeşitlilik</div>
                    <div className="text-xs font-bold text-white mt-0.5">OpenDyslexic &amp; Bionic Okuma</div>
                  </div>
                  <div className="p-2.5 bg-[#18243A] border border-[#1E293B] rounded-md">
                    <div className="text-[10px] font-black uppercase text-amber-400">Sesli Rehber</div>
                    <div className="text-xs font-bold text-white mt-0.5">Ekran Okuyucu (TTS Speech)</div>
                  </div>
                  <div className="p-2.5 bg-[#18243A] border border-[#1E293B] rounded-md">
                    <div className="text-[10px] font-black uppercase text-purple-400">Wappalyzer</div>
                    <div className="text-xs font-bold text-white mt-0.5">Global İmza &amp; DOM Tespiti</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget Yapılandırıcı & Kod Üreteci */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Sol Sütun: Yapılandırma */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
                  <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders size={13} className="text-indigo-400" />
                      <span>Widget Ayarlarını Kişiselleştir</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    {/* Pozisyon */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-300 uppercase text-[10px]">
                        Buton Ekran Konumu:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'bottom-right', label: 'Sağ Alt (Varsayılan)' },
                          { id: 'bottom-left', label: 'Sol Alt' },
                          { id: 'top-right', label: 'Sağ Üst' },
                          { id: 'top-left', label: 'Sol Üst' }
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setWidgetPosition(pos.id as any)}
                            className={`p-2.5 rounded-md border text-left font-bold text-xs transition-colors cursor-pointer ${
                              widgetPosition === pos.id
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-[#18243A] border-[#1E293B] hover:bg-[#1E293B] text-slate-300'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ana Tema Rengi */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-300 uppercase text-[10px]">
                        Tema Rengi:
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { color: '#4F46E5', name: 'İndigo' },
                          { color: '#185886', name: 'Engelsiz Mavisi' },
                          { color: '#00875a', name: 'Zümrüt Yeşili' },
                          { color: '#f2930d', name: 'Turuncu' },
                          { color: '#7c3aed', name: 'Mor' }
                        ].map((t) => (
                          <button
                            key={t.color}
                            type="button"
                            onClick={() => setWidgetColor(t.color)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                              widgetColor === t.color ? 'scale-110 border-white shadow-sm' : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                          >
                            {widgetColor === t.color && <Check size={13} className="text-white drop-shadow-sm" />}
                          </button>
                        ))}
                        <input
                          type="text"
                          value={widgetColor}
                          onChange={(e) => setWidgetColor(e.target.value)}
                          placeholder="#4F46E5"
                          className="w-24 px-2.5 py-1 text-xs border border-[#1E293B] rounded-md font-mono bg-[#18243A] text-white"
                        />
                      </div>
                    </div>

                    {/* Dil */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400 uppercase text-[10px]">
                        Arayüz Dili:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWidgetLang('tr')}
                          className={`p-2 rounded-md border font-bold text-xs text-center cursor-pointer transition-colors ${
                            widgetLang === 'tr'
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-[#18243A] border-[#1E293B] text-slate-300 hover:text-white'
                          }`}
                        >
                          Türkçe (tr)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWidgetLang('en')}
                          className={`p-2 rounded-md border font-bold text-xs text-center cursor-pointer transition-colors ${
                            widgetLang === 'en'
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-[#18243A] border-[#1E293B] text-slate-300 hover:text-white'
                          }`}
                        >
                          English (en)
                        </button>
                      </div>
                    </div>

                    {/* Canlı Test Butonları */}
                    <div className="pt-2 border-t border-[#1E293B] space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">
                        Sayfada Canlı Test Et:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if ((window as any).EngelsizAccessibility) {
                              (window as any).EngelsizAccessibility.open();
                            } else {
                              runSignatureCheck();
                              setTimeout(() => (window as any).EngelsizAccessibility?.open(), 500);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                        >
                          <Accessibility size={13} />
                          <span>Widget&apos;ı Aç</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if ((window as any).EngelsizAccessibility) {
                              (window as any).EngelsizAccessibility.toggleDyslexicFont();
                            } else {
                              runSignatureCheck();
                            }
                          }}
                          className="px-2.5 py-1.5 bg-[#18243A] hover:bg-[#1E293B] text-slate-200 rounded-md font-bold text-xs cursor-pointer border border-[#1E293B] transition-colors"
                        >
                          Disleksi Fontu
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if ((window as any).EngelsizAccessibility) {
                              (window as any).EngelsizAccessibility.toggleReadingRuler();
                            } else {
                              runSignatureCheck();
                            }
                          }}
                          className="px-2.5 py-1.5 bg-[#18243A] hover:bg-[#1E293B] text-slate-200 rounded-md font-bold text-xs cursor-pointer border border-[#1E293B] transition-colors"
                        >
                          Okuma Cetveli
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Sütun: Kod Üretici & Entegrasyon */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
                  <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Code2 size={13} className="text-indigo-400" />
                      <span>Hazır Entegrasyon Kodları (Kopyala &amp; Yapıştır)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {(['html', 'react', 'api', 'wappalyzer'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setWidgetCodeTab(tab)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            widgetCodeTab === tab
                              ? 'bg-indigo-600 text-white'
                              : 'bg-[#18243A] border border-[#1E293B] text-slate-300 hover:text-white'
                          }`}
                        >
                          {tab === 'html' && 'HTML / Web'}
                          {tab === 'react' && 'React / Next.js'}
                          {tab === 'api' && 'JS API'}
                          {tab === 'wappalyzer' && 'Wappalyzer JSON'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 text-xs">
                    {/* HTML TAB */}
                    {widgetCodeTab === 'html' && (
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          Sitenizin <code className="bg-[#18243A] px-1.5 py-0.5 rounded text-indigo-300 font-mono">&lt;body&gt;</code> kapanış etiketinden hemen önce aşağıdaki tek satır scripti eklemeniz yeterlidir:
                        </p>
                        <div className="relative">
                          <pre className="bg-[#0B1220] text-indigo-200 p-3.5 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto select-all border border-[#1E293B]">
{`<!-- EngelsizForum WCAG 2.1 AAA Erişilebilirlik Widget'ı -->
<script
  src="https://engelsizforum.com/widget/engelsiz-accessibility.js"
  data-position="${widgetPosition}"
  data-color="${widgetColor}"
  data-lang="${widgetLang}"
  async
  defer>
</script>`}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(`<!-- EngelsizForum WCAG 2.1 AAA Erişilebilirlik Widget'ı -->\n<script\n  src="https://engelsizforum.com/widget/engelsiz-accessibility.js"\n  data-position="${widgetPosition}"\n  data-color="${widgetColor}"\n  data-lang="${widgetLang}"\n  async\n  defer>\n</script>`, 'html-widget')}
                            className="absolute top-2 right-2 px-2.5 py-1 bg-[#18243A] hover:bg-[#1E293B] text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#1E293B]"
                          >
                            {copiedKey === 'html-widget' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>Kopyala</span>
                          </button>
                        </div>
                        <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 text-slate-300 rounded-md text-[11px] flex items-center gap-2">
                          <Info size={14} className="shrink-0 text-indigo-400" />
                          <span>WordPress, Shopify, Wix veya özel e-ticaret sitelerinin tüm tema dosyalarıyla %100 uyumludur. Sıfır dış kütüphane gerektirir.</span>
                        </div>
                      </div>
                    )}

                    {/* REACT / NEXT.JS TAB */}
                    {widgetCodeTab === 'react' && (
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          Next.js App Router veya React uygulamalarında <code className="bg-[#18243A] px-1.5 py-0.5 rounded text-indigo-300 font-mono">app/layout.tsx</code> dosyanıza ekleyin:
                        </p>
                        <div className="relative">
                          <pre className="bg-[#0B1220] text-indigo-200 p-3.5 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto select-all border border-[#1E293B]">
{`import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${widgetLang}">
      <body>
        {children}
        <Script
          src="https://engelsizforum.com/widget/engelsiz-accessibility.js"
          data-position="${widgetPosition}"
          data-color="${widgetColor}"
          data-lang="${widgetLang}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(`import Script from 'next/script';\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="${widgetLang}">\n      <body>\n        {children}\n        <Script\n          src="https://engelsizforum.com/widget/engelsiz-accessibility.js"\n          data-position="${widgetPosition}"\n          data-color="${widgetColor}"\n          data-lang="${widgetLang}"\n          strategy="lazyOnload"\n        />\n      </body>\n    </html>\n  );\n}`, 'react-widget')}
                            className="absolute top-2 right-2 px-2.5 py-1 bg-[#18243A] hover:bg-[#1E293B] text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#1E293B]"
                          >
                            {copiedKey === 'react-widget' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>Kopyala</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* JAVASCRIPT API TAB */}
                    {widgetCodeTab === 'api' && (
                      <div className="space-y-2">
                        <p className="text-slate-300">
                          Widget yüklendikten sonra <code className="bg-[#18243A] px-1.5 py-0.5 rounded font-mono font-bold text-indigo-400">window.EngelsizAccessibility</code> küresel nesnesi üzerinden kodla yönetebilirsiniz:
                        </p>
                        <div className="relative">
                          <pre className="bg-[#0B1220] text-indigo-200 p-3.5 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto select-all border border-[#1E293B]">
{`// Menüyü programatik aç / kapat
window.EngelsizAccessibility.open();
window.EngelsizAccessibility.close();
window.EngelsizAccessibility.toggle();

// Yazı boyutunu değiştir (-1: 90%, 0: 100%, 1: 110%, 2: 125%, 3: 140%)
window.EngelsizAccessibility.setFontSize(2);

// Kontrast modunu değiştir ('normal', 'high-contrast', 'yellow-black', 'dark')
window.EngelsizAccessibility.setContrast('high-contrast');

// Disleksi fontu veya Okuma Cetvelini tetikle
window.EngelsizAccessibility.toggleDyslexicFont();
window.EngelsizAccessibility.toggleReadingRuler();

// Sesli Ekran Okuyucu ile metin seslendir (Web Speech API)
window.EngelsizAccessibility.speak('Önemli duyuru metni...');
window.EngelsizAccessibility.stopSpeech();

// Kullanıcının aktif tercihlerini oku
const state = window.EngelsizAccessibility.getState();`}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(`window.EngelsizAccessibility.open();\nwindow.EngelsizAccessibility.setFontSize(2);\nwindow.EngelsizAccessibility.setContrast('high-contrast');\nwindow.EngelsizAccessibility.toggleDyslexicFont();\nwindow.EngelsizAccessibility.speak('EngelsizForum Erişilebilirlik');`, 'api-widget')}
                            className="absolute top-2 right-2 px-2.5 py-1 bg-[#18243A] hover:bg-[#1E293B] text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#1E293B]"
                          >
                            {copiedKey === 'api-widget' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>Kopyala</span>
                          </button>
                        </div>
                      </div>
                    )}

                     {/* WAPPALYZER JSON TAB */}
                    {widgetCodeTab === 'wappalyzer' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-300">
                            Wappalyzer resmi tanım parçası (<code className="bg-[#18243A] px-1.5 py-0.5 rounded font-mono text-[10px] text-indigo-300">src/technologies/e.json</code> içine eklenir):
                          </p>
                          <a
                            href="/widget/wappalyzer-engelsiz-accessibility.json"
                            download="engelsiz-accessibility.json"
                            className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <Download size={12} />
                            <span>JSON İndir</span>
                          </a>
                        </div>
                        <div className="relative">
                          <pre className="bg-[#0B1220] text-indigo-200 p-3.5 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto select-all border border-[#1E293B]">
{`"Engelsiz Erişilebilirlik": {
  "cats": [68],
  "description": "EngelsizForum open-source universal WCAG 2.1 AAA web accessibility widget for visually impaired, neurodivergent, and motor-disabled users.",
  "icon": "default.svg",
  "pricing": ["open-source"],
  "website": "https://engelsizforum.com",
  "js": {
    "EngelsizAccessibility": "",
    "EngelsizAccessibility.version": "(.*)\\\\;version:\\\\1",
    "__ENGELSIZ_WIDGET_VERSION__": "(.*)\\\\;version:\\\\1"
  },
  "dom": {
    "#engelsiz-accessibility-widget": {
      "attributes": { "data-engelsiz-version": "(.*)\\\\;version:\\\\1" }
    },
    "meta[name='engelsiz-accessibility']": {
      "attributes": { "content": "active" }
    }
  },
  "scripts": "(?:/widget/|/api/widget/)engelsiz-accessibility(?:\\\\.min)?\\\\.js"
}`}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(`"Engelsiz Erişilebilirlik": {\n  "cats": [68],\n  "description": "EngelsizForum open-source universal WCAG 2.1 AAA web accessibility widget for visually impaired, neurodivergent, and motor-disabled users.",\n  "icon": "default.svg",\n  "pricing": ["open-source"],\n  "website": "https://engelsizforum.com",\n  "js": {\n    "EngelsizAccessibility": "",\n    "EngelsizAccessibility.version": "(.*)\\\\;version:\\\\1",\n    "__ENGELSIZ_WIDGET_VERSION__": "(.*)\\\\;version:\\\\1"\n  },\n  "dom": {\n    "#engelsiz-accessibility-widget": {\n      "attributes": { "data-engelsiz-version": "(.*)\\\\;version:\\\\1" }\n    },\n    "meta[name='engelsiz-accessibility']": {\n      "attributes": { "content": "active" }\n    }\n  },\n  "scripts": "(?:/widget/|/api/widget/)engelsiz-accessibility(?:\\\\.min)?\\\\.js"\n}`, 'wapp-json')}
                            className="absolute top-2 right-2 px-2.5 py-1 bg-[#18243A] hover:bg-[#1E293B] text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#1E293B]"
                          >
                            {copiedKey === 'wapp-json' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>Kopyala</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* WAPPALYZER VE TEKNOLOJİ TESPİTİ DERİNLEMESİNE İNCELEME */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-indigo-400" />
                  <span>Wappalyzer &amp; Web Tarayıcı Teknoloji Tespiti Nasıl Çalışır?</span>
                </div>
                <button
                  onClick={runSignatureCheck}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={12} className={widgetSignatureCheck.checked ? '' : 'animate-spin'} />
                  <span>Tarayıcımda İmzaları Denetle</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-300 bg-[#111B2E]">
                <p className="leading-relaxed">
                  <strong>Wappalyzer</strong>, <strong>BuiltWith</strong>, <strong>WhatRuns</strong> gibi tarayıcı eklentileri sitenizdeki yazılımları 4 farklı katmanda tespit eder. EngelsizForum Widget&apos;ı bu 4 katmanın tamamında doğrulanabilir iz bırakır:
                </p>

                {/* 4 Katman Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Katman 1 */}
                  <div className="p-3 border border-[#1E293B] rounded-md bg-[#18243A]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">1. JS Global Nesnesi</span>
                      {widgetSignatureCheck.hasWindowGlobal ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-800/40">
                          <Check size={10} /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-[#18243A] px-1.5 py-0.5 rounded border border-[#1E293B]">Hazır</span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] font-bold text-indigo-300 bg-[#0B1220] p-1.5 rounded-md border border-[#1E293B] select-all">
                      window.EngelsizAccessibility
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Wappalyzer&apos;ın <code className="font-mono text-[10px] text-indigo-300">js</code> anahtarı bunu tarar ve sürümü okur (<code className="font-mono text-[10px]">v{widgetSignatureCheck.version}</code>).
                    </p>
                  </div>

                  {/* Katman 2 */}
                  <div className="p-3 border border-[#1E293B] rounded-md bg-[#18243A]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">2. DOM Kök Elemanı</span>
                      {widgetSignatureCheck.hasDomElement ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-800/40">
                          <Check size={10} /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-[#18243A] px-1.5 py-0.5 rounded border border-[#1E293B]">Hazır</span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] font-bold text-indigo-300 bg-[#0B1220] p-1.5 rounded-md border border-[#1E293B] select-all">
                      #engelsiz-accessibility-widget
                    </div>
                    <p className="text-[11px] text-slate-400">
                      DOM ağacında <code className="font-mono text-[10px] text-indigo-300">data-engelsiz-version</code> özniteliği ile tespit edilir.
                    </p>
                  </div>

                  {/* Katman 3 */}
                  <div className="p-3 border border-[#1E293B] rounded-md bg-[#18243A]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">3. HTML Meta Etiketi</span>
                      {widgetSignatureCheck.hasMetaTag ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-800/40">
                          <Check size={10} /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-[#18243A] px-1.5 py-0.5 rounded border border-[#1E293B]">Hazır</span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] font-bold text-indigo-300 bg-[#0B1220] p-1.5 rounded-md border border-[#1E293B] select-all truncate">
                      &lt;meta name=&quot;engelsiz-accessibility&quot;&gt;
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sayfa başlığında otomatik enjekte edilir. Arama motorları ve botlar tarafından indekslenir.
                    </p>
                  </div>

                  {/* Katman 4 */}
                  <div className="p-3 border border-[#1E293B] rounded-md bg-[#18243A]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">4. Script URL Regex</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-800/40">
                        <Check size={10} /> CDN
                      </span>
                    </div>
                    <div className="font-mono text-[10px] font-bold text-indigo-300 bg-[#0B1220] p-1.5 rounded-md border border-[#1E293B] select-all truncate">
                      /widget/engelsiz-accessibility.js
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Wappalyzer <code className="font-mono text-[10px] text-indigo-300">scripts</code> regex kuralı ile dosya yolunu anında eşleştirir.
                    </p>
                  </div>
                </div>

                {/* Wappalyzer Pull Request Rehberi */}
                <div className="p-4 bg-[#18243A]/50 border border-[#1E293B] rounded-md space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                      <Terminal size={14} className="text-indigo-400" />
                      <span>Wappalyzer Resmi Deposu için 1-Tıkla PR (Pull Request) Adımları:</span>
                    </div>
                    <a
                      href="https://github.com/enthec/webappanalyzer/edit/main/src/technologies/e.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-indigo-500 flex items-center gap-1 transition-colors"
                    >
                      <span>Doğrudan GitHub&apos;da e.json Düzenle</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Wappalyzer teknolojileri harf dosyaları halinde saklar. E harfiyle başlayan teknolojiler doğrudan <code className="bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B] text-[11px] font-mono font-bold text-indigo-300">src/technologies/e.json</code> dosyasında yer alır (Kategori: <strong>68 - Accessibility</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* WCAG 2.1 AAA ve TEKNOFEST 2027 UYUM TABLOSU */}
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E] shadow-sm">
              <div className="bg-[#18243A] border-b border-[#1E293B] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Sağlanan WCAG 2.1 AAA Standartları ve Erişilebilirlik Özellikleri</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#18243A]/80 border-b border-[#1E293B] text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3">WCAG Kriteri</th>
                      <th className="p-3">Özellik Adı</th>
                      <th className="p-3">Hedef Kitle</th>
                      <th className="p-3">Teknik İşleyiş</th>
                      <th className="p-3">Uyumluluk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-slate-300">
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">1.4.3 / 1.4.6</td>
                      <td className="p-3 font-bold text-white">Yüksek Kontrast Modları</td>
                      <td className="p-3">Az Görenler / Yaşlılar</td>
                      <td className="p-3 text-slate-400">Derin siyah/beyaz ve sarı/siyah yüksek kontrast filtreleri</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">1.4.4</td>
                      <td className="p-3 font-bold text-white">Yazı Boyutu Ölçekleme</td>
                      <td className="p-3">Miyop / Hipermetrop</td>
                      <td className="p-3 text-slate-400">Düzeni bozmadan %90 - %140 font ölçekleme</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">Cognitive AAA</td>
                      <td className="p-3 font-bold text-white">OpenDyslexic &amp; Bionic Okuma</td>
                      <td className="p-3">Disleksi / DEHB / Nöroçeşitlilik</td>
                      <td className="p-3 text-slate-400">Özel harf taban ağırlıkları ve kelime başlangıç hece vurguları</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">1.4.8</td>
                      <td className="p-3 font-bold text-white">Okuma Cetveli (Focus Guide)</td>
                      <td className="p-3">Konsantrasyon / DEHB</td>
                      <td className="p-3 text-slate-400">Fare hareketini takip eden yatay görsel odaklama barı</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">1.4.1</td>
                      <td className="p-3 font-bold text-white">Renk Körlüğü Filtreleri</td>
                      <td className="p-3">Protanopi, Döteranopi, Tritanopi</td>
                      <td className="p-3 text-slate-400">feColorMatrix tabanlı gerçek zamanlı SVG renk matris dönüşümü</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">3.1.2</td>
                      <td className="p-3 font-bold text-white">Sesli Ekran Okuyucu (TTS)</td>
                      <td className="p-3">Görme Engelliler</td>
                      <td className="p-3 text-slate-400">Web Speech Synthesis API ile paragrafları ve seçilen metni Türkçe seslendirme</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                    <tr className="hover:bg-[#18243A]/30">
                      <td className="p-3 font-mono font-bold text-indigo-300">2.1.1</td>
                      <td className="p-3 font-bold text-white">Klavye Erişilebilirliği</td>
                      <td className="p-3">Ortopedik / Motor Engeli</td>
                      <td className="p-3 text-slate-400">Alt+A / Alt+E kısayolları, Escape ile kapatma ve odak kapanı (focus trap)</td>
                      <td className="p-3"><span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[10px] font-bold">AAA Uyumlu</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REST API DOCUMENTATION */}
        {activeTab === 'rest' && (
          <div className="space-y-4">
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E]">
              <div className="bg-[#18243A] text-white border-b border-[#1E293B] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-between">
                <span>EngelsizForum REST API Başvuru Kılavuzu</span>
                <span className="text-[11px] font-mono text-slate-400">JSON / UTF-8</span>
              </div>

              <div className="divide-y divide-[#1E293B]">
                {/* Endpoint 1 */}
                <div className="p-4 sm:p-5 space-y-2.5 hover:bg-[#18243A]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono font-semibold rounded-md text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-white">/api/oauth/userinfo</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Bearer token ile doğrulanan kullanıcının takma ad, e-posta, erişilebilirlik profil tercihleri ve rollerini döner.
                  </p>
                  <div className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-md font-mono text-[11px] text-indigo-300">
                    Authorization: Bearer &lt;ACCESS_TOKEN&gt;
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-4 sm:p-5 space-y-2.5 hover:bg-[#18243A]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 font-mono font-semibold rounded-md text-[11px]">POST</span>
                    <span className="font-mono text-xs font-bold text-white">/api/oauth/token</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Yetkilendirme kodu (Authorization Code) ile kalıcı Bearer Access Token üretir.
                  </p>
                  <div className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-md font-mono text-[11px] text-indigo-300 leading-relaxed break-all">
                    Content-Type: application/x-www-form-urlencoded<br />
                    grant_type=authorization_code&amp;client_id=...&amp;client_secret=...&amp;code=...&amp;redirect_uri=...
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="p-4 sm:p-5 space-y-2.5 hover:bg-[#18243A]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono font-semibold rounded-md text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-white">/api/discussions</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Forumdaki herkese açık güncel konuları, kategorileri ve yanıt sayılarını sayfalanmış JSON formatında listeler.
                  </p>
                </div>

                {/* Endpoint 4 */}
                <div className="p-4 sm:p-5 space-y-2.5 hover:bg-[#18243A]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono font-semibold rounded-md text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-white">/api/webmcp/manifest</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Yapay zeka asistanları (Cursor, Claude, Gemini) için canlı Model Context Protocol (MCP) manifest dosyasını döner.
                  </p>
                </div>

                {/* Endpoint 5: Balthazard */}
                <div className="p-4 sm:p-5 space-y-2.5 hover:bg-[#18243A]/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 font-mono font-semibold rounded-md text-[11px]">POST</span>
                    <span className="font-mono text-xs font-bold text-white">/api/v1/calculate/balthazard</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Birden çok engel oranını Resmi Gazete Balthazard formülü standardına göre birleştirir ve yasal hak eşiklerini (ÖTV muafiyeti, erken emeklilik, vergi indirimi derecesi) anında döner.
                  </p>
                  <div className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-md font-mono text-[11px] text-indigo-300">
                    Örnek Gövde: {`{ "rates": [40, 20, 10] }`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE API TEST CONSOLE */}
        {activeTab === 'console' && (
          <div className="space-y-4">
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E]">
              <div className="bg-[#18243A] text-white border-b border-[#1E293B] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play size={13} className="text-emerald-400" />
                  <span>Canlı API Test Konsolu &amp; Geliştirici Sandbox</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Canlı İstek &amp; Yanıt</span>
              </div>

              <div className="p-4 sm:p-5 space-y-5 text-xs text-slate-300">
                <p className="leading-relaxed text-slate-300">
                  EngelsizForum açık API ve OAuth endpoint&apos;lerini tarayıcı içerisinden canlı test edebilir, parametreleri anlık değiştirebilir ve yanıt sürelerini analiz edebilirsiniz.
                </p>

                {/* Preset Endpoint Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hızlı Endpoint Seçimi:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectEndpoint('balthazard')}
                      className={`px-3 py-2 rounded-md font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        consoleEndpoint === 'balthazard'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#18243A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-700/50">POST</span>
                      <span>Balthazard Hesapla</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectEndpoint('discussions')}
                      className={`px-3 py-2 rounded-md font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        consoleEndpoint === 'discussions'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#18243A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700/50">GET</span>
                      <span>Tartışmalar Beslemesi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectEndpoint('userinfo')}
                      className={`px-3 py-2 rounded-md font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        consoleEndpoint === 'userinfo'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#18243A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700/50">GET</span>
                      <span>OAuth UserInfo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectEndpoint('openid')}
                      className={`px-3 py-2 rounded-md font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        consoleEndpoint === 'openid'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#18243A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700/50">GET</span>
                      <span>OIDC Discovery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectEndpoint('webmcp')}
                      className={`px-3 py-2 rounded-md font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        consoleEndpoint === 'webmcp'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-[#18243A] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700/50">GET</span>
                      <span>WebMCP JSON</span>
                    </button>
                  </div>
                </div>

                {/* Request Config Box */}
                <div className="p-4 bg-[#18243A]/40 border border-[#1E293B] rounded-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Method */}
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Metot</label>
                      <select
                        value={consoleMethod}
                        onChange={(e) => setConsoleMethod(e.target.value as any)}
                        className="w-full border border-[#1E293B] rounded-md px-3 py-2.5 bg-[#0B1220] text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>

                    {/* URL */}
                    <div className="md:col-span-9">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Endpoint URL</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={consoleUrl}
                          onChange={(e) => setConsoleUrl(e.target.value)}
                          className="flex-1 border border-[#1E293B] rounded-md px-3 py-2.5 font-mono text-xs bg-[#0B1220] text-indigo-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleExecuteConsoleRequest}
                          disabled={consoleLoading}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shrink-0 min-h-[44px]"
                        >
                          {consoleLoading ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          <span>İsteği Gönder</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auth Header (Optional) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      Authorization Header (İsteğe Bağlı Bearer Token):
                    </label>
                    <input
                      type="text"
                      placeholder="ef_at_... (Örn: OAuth erişim belirteci)"
                      value={consoleToken}
                      onChange={(e) => setConsoleToken(e.target.value)}
                      className="w-full border border-[#1E293B] rounded-md px-3 py-2 font-mono text-xs bg-[#0B1220] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Request Body (For POST) */}
                  {consoleMethod === 'POST' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-slate-300">
                          JSON İstek Gövdesi (Body):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              setConsoleBody(JSON.stringify(JSON.parse(consoleBody), null, 2));
                            } catch {}
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-semibold"
                        >
                          JSON Biçimlendir
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={consoleBody}
                        onChange={(e) => setConsoleBody(e.target.value)}
                        className="w-full border border-[#1E293B] rounded-md p-3 font-mono text-xs bg-[#0B1220] text-emerald-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Response Section */}
                {consoleResponse !== null && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-xs text-white">Sunucu Yanıtı:</span>
                        {consoleStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                              consoleStatus >= 200 && consoleStatus < 300
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                                : consoleStatus >= 400 && consoleStatus < 500
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                            }`}
                          >
                            HTTP {consoleStatus}
                          </span>
                        )}
                        {consoleLatency !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums">
                            <Clock size={11} />
                            {consoleLatency} ms
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(JSON.stringify(consoleResponse, null, 2), 'resp-json')}
                          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                        >
                          {copiedKey === 'resp-json' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>JSON Kopyala</span>
                        </button>
                        <span className="text-slate-600">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            const curlCmd = `curl -X ${consoleMethod} "${window.location.origin}${consoleUrl}" ${
                              consoleToken ? `-H "Authorization: Bearer ${consoleToken}" ` : ''
                            }${consoleMethod === 'POST' ? `-H "Content-Type: application/json" -d '${consoleBody.replace(/\n/g, '')}'` : ''}`;
                            copyToClipboard(curlCmd, 'curl-cmd');
                          }}
                          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                        >
                          {copiedKey === 'curl-cmd' ? <Check size={12} className="text-emerald-400" /> : <Terminal size={12} />}
                          <span>cURL Kopyala</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto bg-[#0B1220] text-indigo-200 p-4 rounded-md font-mono text-xs border border-[#1E293B]">
                      <pre className="leading-relaxed select-all whitespace-pre-wrap">
                        {typeof consoleResponse === 'string'
                          ? consoleResponse
                          : JSON.stringify(consoleResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEBMCP INTEGRATION */}
        {activeTab === 'webmcp' && (
          <div className="space-y-4">
            <div className="border border-[#1E293B] rounded-md overflow-hidden bg-[#111B2E]">
              <div className="bg-[#18243A] text-white border-b border-[#1E293B] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-between">
                <span>WebMCP (Model Context Protocol) ile Canlı Bilgi Akışı</span>
                <span className="text-[11px] font-mono text-slate-400">Yapay Zeka Ajanları</span>
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-300">
                <p className="leading-relaxed">
                  EngelsizForum, Türkiye&apos;de engelli mevzuatı ve Balthazard hesaplama algoritmalarını harici yapay zeka ajanlarına açan ilk forumdur. Claude Desktop, Cursor veya özel Python ajanlarınız doğrudan platformumuzun araçlarını çağırabilir.
                </p>

                <div className="p-4 bg-[#18243A]/40 border border-[#1E293B] rounded-md space-y-2.5">
                  <div className="font-semibold text-indigo-400 uppercase text-xs tracking-wider">Canlı MCP Manifest URL:</div>
                  <div className="flex items-center justify-between gap-2 bg-[#0B1220] border border-[#1E293B] p-3 rounded-md font-mono text-xs text-indigo-200">
                    <span className="select-all break-all">https://engelsizforum.com/webmcp/mcp.json</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://engelsizforum.com/webmcp/mcp.json', 'mcp-url')}
                      className="text-slate-400 hover:text-indigo-400 font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'mcp-url' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Claude Desktop / Cursor Entegrasyon Yapılandırması:</h3>
                  <div className="p-4 bg-[#0B1220] text-indigo-200 font-mono text-xs rounded-md border border-[#1E293B] overflow-x-auto">
{`{
  "mcpServers": {
    "engelsizforum": {
      "command": "npx",
      "args": ["-y", "engelsizforum-mcp"],
      "env": {
        "ENGELSIZFORUM_URL": "https://engelsizforum.com"
      }
    }
  }
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE APP MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-[#111B2E] border border-[#1E293B] rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#18243A] text-white border-b border-[#1E293B] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-between">
                <span>Yeni OAuth 2.0 İstemcisi Kaydet</span>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateApp} className="p-4 sm:p-5 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-md font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Uygulama Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Engelsiz Mobil Asistan"
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Yönlendirme URI&apos;leri (Redirect URIs) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formRedirectUris}
                    onChange={(e) => setFormRedirectUris(e.target.value)}
                    placeholder="https://uygulamaniz.com/auth/callback (Her satıra bir URI)"
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Kullanıcı izin verdikten sonra yönlendirileceği adres. Birden fazla adres için her satıra bir adet yazın.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Uygulamanızın ne yaptığını kısaca özetleyin"
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Logo URL (İsteğe bağlı)
                  </label>
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    placeholder="https://uygulamaniz.com/logo.png"
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-500 text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-[#18243A] border border-[#1E293B] text-slate-300 rounded-md font-semibold hover:bg-[#1E293B] hover:text-white cursor-pointer transition-colors min-h-[40px]"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[40px] shadow-xs"
                  >
                    {formSubmitting ? 'Kaydediliyor...' : 'Uygulamayı Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT APP MODAL */}
        {isEditModalOpen && editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-[#111B2E] border border-[#1E293B] rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#18243A] text-white border-b border-[#1E293B] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-between">
                <span>Uygulamayı Düzenle: {editingApp.client_name}</span>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateApp} className="p-4 sm:p-5 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-md font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Uygulama Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Yönlendirme URI&apos;leri *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formRedirectUris}
                    onChange={(e) => setFormRedirectUris(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18243A] border border-[#1E293B] rounded-md focus:outline-none focus:border-indigo-500 text-white text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-[#18243A] border border-[#1E293B] text-slate-300 rounded-md font-semibold hover:bg-[#1E293B] hover:text-white cursor-pointer transition-colors min-h-[40px]"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[40px] shadow-xs"
                  >
                    {formSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECRET REVEAL MODAL (SADECE BİR KEZ GÖSTERİLİR) */}
        {secretModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-[#111B2E] border border-amber-500/50 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-amber-600 text-white font-bold uppercase text-xs py-3 px-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>GİZLİ ANAHTARINIZI (CLIENT SECRET) ŞİMDİ KOPYALAYIN</span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/40 text-amber-300 rounded-md leading-relaxed">
                  Güvenliğiniz gereği bu gizli anahtar veri tabanımızda tek yönlü şifrelenmiştir (hash). <strong>Bu pencereyi kapattıktan sonra anahtarı bir daha ASLA görüntüleyemezsiniz!</strong> Lütfen hemen güvenli bir yere kaydedin.
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300 text-xs">Client ID:</label>
                  <div className="flex items-center gap-2 bg-[#0B1220] border border-[#1E293B] p-2.5 rounded-md font-mono text-xs text-white">
                    <span className="flex-1 select-all break-all">{secretModalData.clientId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(secretModalData.clientId, 'modal-cid')}
                      className="px-2.5 py-1.5 bg-[#18243A] border border-[#1E293B] hover:bg-[#1E293B] text-slate-300 hover:text-white rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      {copiedKey === 'modal-cid' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-rose-400 text-xs">Client Secret (Gizli Anahtar):</label>
                  <div className="flex items-center gap-2 bg-[#0B1220] border border-rose-900/50 p-2.5 rounded-md font-mono text-xs text-rose-300">
                    <span className="flex-1 select-all font-bold break-all">{secretModalData.clientSecret}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(secretModalData.clientSecret, 'modal-sec')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition-colors shrink-0"
                    >
                      {copiedKey === 'modal-sec' ? <Check size={12} /> : <Copy size={12} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSecretModalData(null)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold tracking-wide text-xs shadow-xs transition-colors cursor-pointer min-h-[44px]"
                  >
                    Anahtarı Güvenle Kaydettim, Pencereyi Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </SiteLayout>
  );
}
