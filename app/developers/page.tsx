'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { SiteLayout } from '@/components/layout/site-layout';
import { createClient } from '@/lib/supabase/client';
import { EngelsizForumLogo, EngelsizForumLoginButton } from '@/components/ui/engelsizforum-brand';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [activeTab, setActiveTab] = useState<'apps' | 'docs' | 'button' | 'rest' | 'console' | 'webmcp'>('apps');
  const [selectedDocLang, setSelectedDocLang] = useState<'nextauth' | 'nodejs' | 'python' | 'php'>('nextauth');

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

  // Kullanıcı ve Uygulama verilerini yükle
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
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
  };

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl mb-1 shadow-xs">
          <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
            <Home size={13} />
            <span>Ana Sayfa</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-extrabold text-slate-950 dark:text-white">Geliştirici Portalı (OAuth 2.0 &amp; REST API)</span>
        </div>

        {/* XenForo Main Header Block */}
        <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
          <div className="xf-block-header bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-black uppercase text-[12px] tracking-wider py-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-white/90" />
              <span>ENGELSİZFORUM GELİŞTİRİCİ PORTALI &amp; OAUTH 2.0</span>
            </div>
            <span className="text-[11px] font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
              OAuth 2.0 RFC 6749 &amp; WebMCP
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                &ldquo;EngelsizForum ile Giriş Yap&rdquo; &amp; Canlı Mevzuat Entegrasyonu
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Kendi web sitenize, mobil uygulamanıza veya AI asistanlarınıza EngelsizForum OAuth 2.0 kimlik doğrulama, topluluk API&apos;leri ve WebMCP canlı mevzuat akışı entegre edin.
              </p>
            </div>

            {user && (
              <button
                onClick={() => {
                  setFormName('');
                  setFormRedirectUris('http://localhost:3000/api/auth/callback/engelsizforum');
                  setFormDescription('');
                  setFormLogoUrl('');
                  setFormError(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-sm bg-[#f2930d] hover:bg-[#d5800a] text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Yeni Uygulama Kaydet</span>
              </button>
            )}
          </div>
        </div>

        {/* XenForo Tabs Navigation */}
        <div className="flex flex-wrap gap-1 border-b border-slate-300 bg-[#eef2f7] p-1 rounded-t-sm">
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'apps'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers size={13} />
            <span>Kayıtlı Uygulamalarım {apps.length > 0 && `(${apps.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Terminal size={13} />
            <span>OAuth 2.0 Entegrasyon Rehberi</span>
          </button>

          <button
            onClick={() => setActiveTab('button')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'button'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LogIn size={13} className="text-[#00875a]" />
            <span>Logolu Giriş Butonu &amp; Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('rest')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'rest'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Server size={13} />
            <span>REST API Dokümantasyonu</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'console'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Play size={13} className="text-emerald-600" />
            <span>Canlı API Konsolu (Test)</span>
          </button>

          <button
            onClick={() => setActiveTab('webmcp')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-t-sm flex items-center gap-1.5 ${
              activeTab === 'webmcp'
                ? 'bg-white text-[#185886] border-t-2 border-t-[#185886] border-x border-slate-300 -mb-1 pb-2.5 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Cpu size={13} />
            <span>WebMCP Ajan Entegrasyonu</span>
          </button>
        </div>

        {/* TAB 1: APPS LIST */}
        {activeTab === 'apps' && (
          <div className="space-y-4">
            {!user ? (
              <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
                <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-bold text-xs uppercase py-2 px-3 flex items-center gap-2">
                  <Lock size={13} />
                  <span>Giriş Yapılması Gerekiyor</span>
                </div>
                <div className="p-6 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600 font-normal">
                    Kendi OAuth 2.0 istemci uygulamanızı (Client ID &amp; Secret) oluşturmak ve yönetmek için lütfen foruma giriş yapın.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[#185886] hover:bg-[#12466b] text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <LogIn size={13} />
                    <span>Giriş Yap / Üye Ol</span>
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="xf-block border border-slate-200 rounded-sm p-8 text-center text-xs text-slate-500 bg-white">
                Uygulama listesi yükleniyor...
              </div>
            ) : loadError ? (
              <div className="xf-block border border-amber-300 rounded-sm overflow-hidden bg-amber-50/40 shadow-xs">
                <div className="bg-amber-100/80 border-b border-amber-200 text-amber-900 font-bold text-xs uppercase py-2 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-700" />
                    <span>Veritabanı / Şema Uyarısı</span>
                  </div>
                  <button
                    onClick={() => loadData()}
                    className="text-[11px] font-bold text-[#185886] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Tekrar Dene</span>
                  </button>
                </div>
                <div className="p-5 space-y-3 text-xs text-slate-700">
                  <div className="font-semibold text-amber-950 flex items-center gap-2">
                    <span>{loadError.message}</span>
                  </div>
                  {loadError.details && (
                    <div className="p-2.5 bg-slate-900 text-amber-300 rounded-sm font-mono text-[11px] break-all border border-slate-800">
                      Hata Detayı: {loadError.details}
                    </div>
                  )}
                  <p className="text-slate-600 leading-relaxed">
                    {loadError.hint || 'Supabase projenizde `oauth_clients` tablosu eksik veya gerekli izinler tanımlanmamış. Lütfen aşağıdaki güncel SQL şemasını Supabase SQL Editöründe çalıştırarak veritabanınızı güncelleyin.'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => loadData()}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-[#185886] hover:bg-[#12466b] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Bağlantıyı Yeniden Kontrol Et</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('docs');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Code2 size={12} />
                      <span>Dokümantasyon &amp; Kurulum</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : apps.length === 0 ? (
              <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
                <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-bold text-xs uppercase py-2 px-3">
                  Kayıtlı Uygulama Bulunamadı
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-sm bg-[#eef2f7] text-[#185886] border border-slate-300 flex items-center justify-center mx-auto">
                    <Key size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">Henüz Kayıtlı Bir Uygulamanız Yok</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
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
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[#185886] hover:bg-[#12466b] text-white px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>İlk Uygulamanızı Oluşturun</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
                <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-bold text-xs uppercase py-2 px-3 flex items-center justify-between">
                  <span>Kayıtlı OAuth 2.0 İstemcileri ({apps.length})</span>
                  <span className="text-slate-500 text-[10px] font-normal">İstemci Kimlikleri ve Yönlendirme Adresleri</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Uygulama Adı</th>
                        <th className="p-3">Client ID</th>
                        <th className="p-3">Yönlendirme URI (Callback)</th>
                        <th className="p-3">Kayıt Tarihi</th>
                        <th className="p-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {apps.map((app) => (
                        <tr key={app.client_id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="p-3 align-top font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>{app.client_name}</span>
                            </div>
                            {app.description && (
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5 pl-4">
                                {app.description}
                              </p>
                            )}
                          </td>
                          <td className="p-3 align-top font-mono text-[11px] text-slate-700">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm w-fit">
                              <span className="truncate max-w-[160px]">{app.client_id}</span>
                              <button
                                onClick={() => copyToClipboard(app.client_id, `cid-${app.client_id}`)}
                                title="Client ID'yi kopyala"
                                className="text-slate-500 hover:text-[#185886] cursor-pointer"
                              >
                                {copiedKey === `cid-${app.client_id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="space-y-1">
                              {app.redirect_uris.map((uri, idx) => (
                                <div key={idx} className="font-mono text-[11px] text-slate-600 truncate max-w-xs">
                                  {uri}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 align-top text-slate-500 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-3 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getSampleAuthUrl(app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="OAuth Giriş Ekranını Test Et"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-[#eef2f7] hover:bg-slate-200 text-[#185886] border border-slate-300 text-[11px] font-bold"
                              >
                                <ExternalLink size={11} />
                                <span>Test Et</span>
                              </a>
                              <button
                                onClick={() => openEditModal(app)}
                                title="Uygulamayı Düzenle"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-bold cursor-pointer"
                              >
                                <Edit3 size={11} />
                                <span>Düzenle</span>
                              </button>
                              <button
                                onClick={() => handleRotateSecret(app)}
                                title="Client Secret'i Yenile"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-bold cursor-pointer"
                              >
                                <RefreshCw size={11} />
                                <span>Secret Yenile</span>
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app)}
                                title="Uygulamayı Sil"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-bold cursor-pointer"
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
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#00875a] flex items-center justify-center text-white shrink-0 font-bold shadow-2xs">
                  <LogIn size={15} />
                </div>
                <div>
                  <div className="font-bold text-emerald-950">Resmi &ldquo;EngelsizForum ile Giriş Yap&rdquo; Butonunu Kullanın</div>
                  <div className="text-emerald-800 text-[11px]">Standart yeşil stil ve 2. görseldeki resmi kurumsal logomuz ile hazır buton kodunu hemen kopyalayabilirsiniz.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('button')}
                className="px-3 py-1.5 bg-[#00875a] hover:bg-[#00744e] text-white font-bold rounded-xs text-xs whitespace-nowrap cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
              >
                Logolu Buton Kılavuzu &rarr;
              </button>
            </div>

            {/* Endpoints Table */}
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 text-[#185886] font-bold text-xs uppercase py-2 px-3">
                OAuth 2.0 Standart Uç Noktaları (Endpoints)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="p-3">Protokol Adımı</th>
                      <th className="p-3">Metot</th>
                      <th className="p-3">Uç Nokta (URL)</th>
                      <th className="p-3">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Yetkilendirme (Authorize)</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">GET</td>
                      <td className="p-3 font-mono text-slate-700 select-all">https://engelsizforum.com/api/oauth/authorize</td>
                      <td className="p-3 text-slate-600">Kullanıcının izin onayını verdiği web consent sayfası.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Erişim Jetonu (Token)</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">POST</td>
                      <td className="p-3 font-mono text-slate-700 select-all">https://engelsizforum.com/api/oauth/token</td>
                      <td className="p-3 text-slate-600">Yetkilendirme kodu (code) ile Bearer Access Token takası.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Kullanıcı Bilgileri (Userinfo)</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">GET</td>
                      <td className="p-3 font-mono text-slate-700 select-all">https://engelsizforum.com/api/oauth/userinfo</td>
                      <td className="p-3 text-slate-600">Bearer token ile kullanıcının ID, isim, e-posta ve rollerini alma.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Jeton İptali (Revoke)</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">POST</td>
                      <td className="p-3 font-mono text-slate-700 select-all">https://engelsizforum.com/api/oauth/revoke</td>
                      <td className="p-3 text-slate-600">Kullanıcı oturumu kapattığında token&apos;ı sunucuda geçersiz kılma.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples */}
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-3 flex items-center justify-between">
                <span>Entegrasyon Kod Örnekleri</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {(['nextauth', 'nodejs', 'python', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedDocLang(lang)}
                      className={`px-2 py-0.5 rounded-sm font-bold uppercase cursor-pointer transition-colors ${
                        selectedDocLang === lang
                          ? 'bg-white text-[#185886]'
                          : 'text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {lang === 'nextauth' ? 'NextAuth.js' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#1e293b] text-slate-100 font-mono text-xs overflow-x-auto relative">
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
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogIn size={14} className="text-emerald-300" />
                  <span>Resmi &ldquo;EngelsizForum ile Giriş Yap&rdquo; Logolu Buton Kılavuzu</span>
                </div>
                <span className="text-[11px] font-normal text-white/80 bg-white/10 px-2 py-0.5 rounded-sm border border-white/20">
                  Marka &amp; UI Standartları
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#f8fafc] border border-slate-200 rounded-sm">
                  <div className="space-y-1 max-w-2xl text-xs sm:text-sm text-slate-700">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500 shrink-0" />
                      <span>Logosuz Düz Butondan &rarr; Resmi Kurumsal Logolu Giriş Butonuna Geçiş</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Standart jenerik dünya ikonu yerine, EngelsizForum&apos;un tescilli resmi logosunu (lacivert zemin, kalın beyaz yazı ve camgöbeği noktalı <strong>İ</strong>) taşıyan butonları kullanarak kullanıcılarınızda güven oluşturun.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 p-2 bg-white rounded-sm border border-slate-200 shadow-2xs">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Önceki (Jenerik)</span>
                      <div className="bg-[#00875a] text-white px-2.5 py-1 text-[11px] font-semibold rounded-xs flex items-center gap-1 opacity-70">
                        <Globe size={11} />
                        <span>Giriş Yap</span>
                      </div>
                    </div>
                    <span className="text-slate-300 font-bold">&rarr;</span>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Yeni (Resmi Logolu)</span>
                      <div className="bg-[#00875a] text-white px-2.5 py-1 text-[11px] font-bold rounded-xs flex items-center gap-1.5 shadow-xs">
                        <div className="w-3.5 h-3.5 rounded-xs bg-[#185886] flex items-center justify-center text-[9px] font-black leading-none">
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
                  <div className="lg:col-span-5 space-y-4 bg-slate-50/70 p-4 border border-slate-200 rounded-sm">
                    <h3 className="text-xs font-black text-[#185886] uppercase tracking-wide border-b border-slate-200 pb-2">
                      1. Buton Tasarımını Özelleştirin
                    </h3>

                    {/* Tema Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Tema &amp; Renk Paleti:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBtnTheme('green')}
                          className={`p-2 rounded-sm border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'green'
                              ? 'border-[#00875a] bg-emerald-50 text-emerald-950 font-bold ring-1 ring-[#00875a]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#00875a] shrink-0"></span>
                          <span className="text-xs">Yeşil (Kullanıcı Stili)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('blue')}
                          className={`p-2 rounded-sm border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'blue'
                              ? 'border-[#185886] bg-sky-50 text-sky-950 font-bold ring-1 ring-[#185886]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#185886] shrink-0"></span>
                          <span className="text-xs">Klasik Lacivert</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('dark')}
                          className={`p-2 rounded-sm border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'dark'
                              ? 'border-slate-800 bg-slate-100 text-slate-950 font-bold ring-1 ring-slate-800'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0f172a] shrink-0"></span>
                          <span className="text-xs">Gece Modu (Koyu)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnTheme('white')}
                          className={`p-2 rounded-sm border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            btnTheme === 'white'
                              ? 'border-slate-400 bg-white text-slate-950 font-bold ring-1 ring-slate-400'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shrink-0"></span>
                          <span className="text-xs">Beyaz (Açık Çerçeveli)</span>
                        </button>
                      </div>
                    </div>

                    {/* Boyut Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Buton Boyutu:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setBtnSize(sz)}
                            className={`py-1.5 px-2 rounded-sm border text-center text-xs cursor-pointer transition-all ${
                              btnSize === sz
                                ? 'border-[#185886] bg-white text-[#185886] font-bold ring-1 ring-[#185886]'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sz === 'sm' ? 'Küçük (36px)' : sz === 'md' ? 'Standart (44px)' : 'Büyük (52px)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Düzeni */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Logo Düzeni:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBtnLayout('split')}
                          className={`p-2 rounded-sm border text-left text-xs cursor-pointer transition-all ${
                            btnLayout === 'split'
                              ? 'border-[#185886] bg-white text-[#185886] font-bold ring-1 ring-[#185886]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block font-bold">Logo Rozeti + Metin</span>
                          <span className="text-[10px] text-slate-500 font-normal">Kompakt kurumsal rozet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBtnLayout('badge')}
                          className={`p-2 rounded-sm border text-left text-xs cursor-pointer transition-all ${
                            btnLayout === 'badge'
                              ? 'border-[#185886] bg-white text-[#185886] font-bold ring-1 ring-[#185886]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block font-bold">Tam Wordmark Logo</span>
                          <span className="text-[10px] text-slate-500 font-normal">2. Görseldeki tam logo</span>
                        </button>
                      </div>
                    </div>

                    {/* Kayıtlı Uygulama Seçimi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Yetkilendirilecek Uygulamanız:</label>
                      {apps.length > 0 ? (
                        <select
                          value={btnAppClientId}
                          onChange={(e) => setBtnAppClientId(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-[#185886]"
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
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-sm font-mono focus:outline-none focus:border-[#185886]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Sağ Sütun: Canlı Önizleme & Kod Kopyalama */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Canlı Önizleme Kartı */}
                    <div className="p-6 bg-[#fcf8fb] border border-slate-200 rounded-sm flex flex-col items-center justify-center gap-4 text-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
                          className="inline-flex items-center gap-1.5 text-xs text-[#185886] hover:underline font-bold"
                        >
                          <ExternalLink size={13} />
                          <span>Onay Ekranını Test Et (Canlı Logo Önizleme)</span>
                        </a>
                      </div>
                    </div>

                    {/* Kod Kopyalama Sekmeleri */}
                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                      <div className="bg-[#1e293b] text-white p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setBtnCodeType('html')}
                            className={`px-2.5 py-1 rounded-sm font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'html' ? 'bg-[#00875a] text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            HTML &amp; CSS
                          </button>
                          <button
                            onClick={() => setBtnCodeType('react')}
                            className={`px-2.5 py-1 rounded-sm font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'react' ? 'bg-[#00875a] text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            React / Next.js
                          </button>
                          <button
                            onClick={() => setBtnCodeType('svg')}
                            className={`px-2.5 py-1 rounded-sm font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'svg' ? 'bg-[#00875a] text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Doğrudan İmaj (SVG Link)
                          </button>
                          <button
                            onClick={() => setBtnCodeType('logo')}
                            className={`px-2.5 py-1 rounded-sm font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                              btnCodeType === 'logo' ? 'bg-[#00875a] text-white' : 'text-slate-300 hover:bg-slate-700'
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

        {/* TAB 3: REST API DOCUMENTATION */}
        {activeTab === 'rest' && (
          <div className="space-y-4">
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-3 flex items-center justify-between">
                <span>EngelsizForum REST API Başvuru Kılavuzu</span>
                <span className="text-[11px] font-normal text-white/80">JSON / UTF-8</span>
              </div>

              <div className="divide-y divide-slate-200">
                {/* Endpoint 1 */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-sm text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-slate-800">/api/oauth/userinfo</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Bearer token ile doğrulanan kullanıcının takma ad, e-posta, erişilebilirlik profil tercihleri ve rollerini döner.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm font-mono text-[11px] text-slate-700">
                    Authorization: Bearer &lt;ACCESS_TOKEN&gt;
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-sm text-[11px]">POST</span>
                    <span className="font-mono text-xs font-bold text-slate-800">/api/oauth/token</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Yetkilendirme kodu (Authorization Code) ile kalıcı Bearer Access Token üretir.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm font-mono text-[11px] text-slate-700">
                    Content-Type: application/x-www-form-urlencoded<br />
                    grant_type=authorization_code&amp;client_id=...&amp;client_secret=...&amp;code=...&amp;redirect_uri=...
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-sm text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-slate-800">/api/discussions</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Forumdaki herkese açık güncel konuları, kategorileri ve yanıt sayılarını sayfalanmış JSON formatında listeler.
                  </p>
                </div>

                {/* Endpoint 4 */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-sm text-[11px]">GET</span>
                    <span className="font-mono text-xs font-bold text-slate-800">/api/webmcp/manifest</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Yapay zeka asistanları (Cursor, Claude, Gemini) için canlı Model Context Protocol (MCP) manifest dosyasını döner.
                  </p>
                </div>

                {/* Endpoint 5: Balthazard */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-sm text-[11px]">POST</span>
                    <span className="font-mono text-xs font-bold text-slate-800">/api/v1/calculate/balthazard</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Birden çok engel oranını Resmi Gazete Balthazard formülü standardına göre birleştirir ve yasal hak eşiklerini (ÖTV muafiyeti, erken emeklilik, vergi indirimi derecesi) anında döner.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm font-mono text-[11px] text-slate-700">
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
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play size={13} className="text-emerald-400" />
                  <span>Canlı API Test Konsolu &amp; Geliştirici Sandbox</span>
                </div>
                <span className="text-[11px] font-normal text-white/80">Canlı İstek &amp; Yanıt</span>
              </div>

              <div className="p-4 sm:p-5 space-y-5 text-xs text-slate-700">
                <p className="leading-relaxed text-slate-600">
                  EngelsizForum açık API ve OAuth endpoint&apos;lerini tarayıcı içerisinden canlı test edebilir, parametreleri anlık değiştirebilir ve yanıt sürelerini analiz edebilirsiniz.
                </p>

                {/* Preset Endpoint Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hızlı Endpoint Seçimi:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSelectEndpoint('balthazard')}
                      className={`px-3 py-1.5 rounded-xs font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        consoleEndpoint === 'balthazard'
                          ? 'bg-[#185886] text-white border-[#185886] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1 py-0.2 rounded-xs bg-blue-800 text-white">POST</span>
                      <span>Balthazard Hesapla</span>
                    </button>

                    <button
                      onClick={() => handleSelectEndpoint('discussions')}
                      className={`px-3 py-1.5 rounded-xs font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        consoleEndpoint === 'discussions'
                          ? 'bg-[#185886] text-white border-[#185886] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1 py-0.2 rounded-xs bg-emerald-700 text-white">GET</span>
                      <span>Tartışmalar Beslemesi</span>
                    </button>

                    <button
                      onClick={() => handleSelectEndpoint('userinfo')}
                      className={`px-3 py-1.5 rounded-xs font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        consoleEndpoint === 'userinfo'
                          ? 'bg-[#185886] text-white border-[#185886] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1 py-0.2 rounded-xs bg-emerald-700 text-white">GET</span>
                      <span>OAuth UserInfo</span>
                    </button>

                    <button
                      onClick={() => handleSelectEndpoint('openid')}
                      className={`px-3 py-1.5 rounded-xs font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        consoleEndpoint === 'openid'
                          ? 'bg-[#185886] text-white border-[#185886] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1 py-0.2 rounded-xs bg-emerald-700 text-white">GET</span>
                      <span>OIDC Discovery</span>
                    </button>

                    <button
                      onClick={() => handleSelectEndpoint('webmcp')}
                      className={`px-3 py-1.5 rounded-xs font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        consoleEndpoint === 'webmcp'
                          ? 'bg-[#185886] text-white border-[#185886] shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-[10px] px-1 py-0.2 rounded-xs bg-emerald-700 text-white">GET</span>
                      <span>WebMCP JSON</span>
                    </button>
                  </div>
                </div>

                {/* Request Config Box */}
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Method */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Metot</label>
                      <select
                        value={consoleMethod}
                        onChange={(e) => setConsoleMethod(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-xs px-2 py-1.5 bg-white text-xs font-bold"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>

                    {/* URL */}
                    <div className="md:col-span-10">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Endpoint URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={consoleUrl}
                          onChange={(e) => setConsoleUrl(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-xs px-3 py-1.5 font-mono text-xs bg-white text-slate-900"
                        />
                        <button
                          onClick={handleExecuteConsoleRequest}
                          disabled={consoleLoading}
                          className="px-4 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {consoleLoading ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                          <span>İsteği Gönder</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auth Header (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Authorization Header (İsteğe Bağlı Bearer Token):
                    </label>
                    <input
                      type="text"
                      placeholder="ef_at_... (Örn: OAuth erişim belirteci)"
                      value={consoleToken}
                      onChange={(e) => setConsoleToken(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-3 py-1.5 font-mono text-xs bg-white text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Request Body (For POST) */}
                  {consoleMethod === 'POST' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          JSON İstek Gövdesi (Body):
                        </label>
                        <button
                          onClick={() => {
                            try {
                              setConsoleBody(JSON.stringify(JSON.parse(consoleBody), null, 2));
                            } catch {}
                          }}
                          className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline cursor-pointer font-semibold"
                        >
                          JSON Biçimlendir
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={consoleBody}
                        onChange={(e) => setConsoleBody(e.target.value)}
                        className="w-full border border-slate-300 rounded-xs p-3 font-mono text-xs bg-[#1e293b] text-emerald-400"
                      />
                    </div>
                  )}
                </div>

                {/* Response Section */}
                {consoleResponse !== null && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-700">Sunucu Yanıtı:</span>
                        {consoleStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-xs font-mono text-[11px] font-bold ${
                              consoleStatus >= 200 && consoleStatus < 300
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : consoleStatus >= 400 && consoleStatus < 500
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            HTTP {consoleStatus}
                          </span>
                        )}
                        {consoleLatency !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Clock size={11} />
                            {consoleLatency} ms
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(consoleResponse, null, 2), 'resp-json')}
                          className="text-xs text-slate-600 hover:text-[#185886] flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {copiedKey === 'resp-json' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>JSON Kopyala</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => {
                            const curlCmd = `curl -X ${consoleMethod} "${window.location.origin}${consoleUrl}" ${
                              consoleToken ? `-H "Authorization: Bearer ${consoleToken}" ` : ''
                            }${consoleMethod === 'POST' ? `-H "Content-Type: application/json" -d '${consoleBody.replace(/\n/g, '')}'` : ''}`;
                            copyToClipboard(curlCmd, 'curl-cmd');
                          }}
                          className="text-xs text-slate-600 hover:text-[#185886] flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {copiedKey === 'curl-cmd' ? <Check size={12} className="text-emerald-600" /> : <Terminal size={12} />}
                          <span>cURL Kopyala</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto bg-[#0b1320] text-sky-200 p-4 rounded-sm font-mono text-xs border border-slate-300">
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
            <div className="xf-block border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-3 flex items-center justify-between">
                <span>WebMCP (Model Context Protocol) ile Canlı Bilgi Akışı</span>
                <span className="text-[11px] font-normal text-white/80">Yapay Zeka Ajanları</span>
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                  EngelsizForum, Türkiye&apos;de engelli mevzuatı ve Balthazard hesaplama algoritmalarını harici yapay zeka ajanlarına açan ilk forumdur. Claude Desktop, Cursor veya özel Python ajanlarınız doğrudan platformumuzun araçlarını çağırabilir.
                </p>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-sm space-y-2">
                  <div className="font-bold text-sky-700 dark:text-sky-400 uppercase text-xs">Canlı MCP Manifest URL:</div>
                  <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 p-2 rounded-sm font-mono text-xs">
                    <span className="select-all">https://engelsizforum.com/webmcp/mcp.json</span>
                    <button
                      onClick={() => copyToClipboard('https://engelsizforum.com/webmcp/mcp.json', 'mcp-url')}
                      className="text-slate-600 hover:text-sky-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'mcp-url' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase">Claude Desktop / Cursor Entegrasyon Yapılandırması:</h3>
                  <div className="p-3 bg-[#1e293b] text-slate-100 font-mono text-xs rounded-sm overflow-x-auto">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-slate-300 rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                <span>Yeni OAuth 2.0 İstemcisi Kaydet</span>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-white/80 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateApp} className="p-4 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Uygulama Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Engelsiz Mobil Asistan"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-sky-600 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Yönlendirme URI&apos;leri (Redirect URIs) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formRedirectUris}
                    onChange={(e) => setFormRedirectUris(e.target.value)}
                    placeholder="https://uygulamaniz.com/auth/callback (Her satıra bir URI)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-sky-600 text-slate-800 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Kullanıcı izin verdikten sonra yönlendirileceği adres. Birden fazla adres için her satıra bir adet yazın.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Uygulamanızın ne yaptığını kısaca özetleyin"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-sky-600 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Logo URL (İsteğe bağlı)
                  </label>
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    placeholder="https://uygulamaniz.com/logo.png"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-sky-600 text-slate-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-sm font-bold uppercase hover:bg-slate-50 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-1.5 bg-[#185886] hover:bg-[#12466b] text-white rounded-sm font-bold uppercase shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-slate-300 rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-b from-[#185886] to-[#12466b] text-white font-bold text-xs uppercase py-2.5 px-4 flex items-center justify-between">
                <span>Uygulamayı Düzenle: {editingApp.client_name}</span>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white/80 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateApp} className="p-4 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Uygulama Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-[#185886] text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Yönlendirme URI&apos;leri *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formRedirectUris}
                    onChange={(e) => setFormRedirectUris(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-[#185886] text-slate-800 font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[11px]">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-[#185886] text-slate-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-sm font-bold uppercase hover:bg-slate-50 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-1.5 bg-[#185886] hover:bg-[#12466b] text-white rounded-sm font-bold uppercase shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border-2 border-amber-500 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-b from-amber-600 to-amber-700 text-white font-black uppercase text-xs py-2.5 px-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>GİZLİ ANAHTARINIZI (CLIENT SECRET) ŞİMDİ KOPYALAYIN!</span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-sm font-medium leading-relaxed">
                  Güvenliğiniz gereği bu gizli anahtar veri tabanımızda tek yönlü şifrelenmiştir (hash). <strong>Bu pencereyi kapattıktan sonra anahtarı bir daha ASLA görüntüleyemezsiniz!</strong> Lütfen hemen güvenli bir yere kaydedin.
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase text-[10px]">Client ID:</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-2 rounded-sm font-mono text-[11px] text-slate-800">
                    <span className="flex-1 select-all">{secretModalData.clientId}</span>
                    <button
                      onClick={() => copyToClipboard(secretModalData.clientId, 'modal-cid')}
                      className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-sm font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'modal-cid' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-rose-700 uppercase text-[10px]">Client Secret (Gizli Anahtar):</label>
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 p-2 rounded-sm font-mono text-[11px] text-rose-900">
                    <span className="flex-1 select-all font-bold">{secretModalData.clientSecret}</span>
                    <button
                      onClick={() => copyToClipboard(secretModalData.clientSecret, 'modal-sec')}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-sm font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      {copiedKey === 'modal-sec' ? <Check size={11} /> : <Copy size={11} />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSecretModalData(null)}
                    className="w-full py-2 bg-[#185886] hover:bg-[#12466b] text-white rounded-sm font-black uppercase tracking-wider text-xs shadow-xs transition-colors cursor-pointer"
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
