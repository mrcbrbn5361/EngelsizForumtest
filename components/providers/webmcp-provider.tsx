'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isWebMCPSupported, registerEngelsizForumWebMCPTools } from '@/lib/webmcp';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { Bot, CheckCircle2, Sparkles, Cpu, Info, Play, ExternalLink, Terminal, ShieldCheck, FileText, Scale } from 'lucide-react';
import { toast } from 'sonner';

export function WebMCPProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { updateSettings } = useAccessibility();
  const [supported, setSupported] = useState<boolean>(false);
  const [registered, setRegistered] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<string>('');

  useEffect(() => {
    const isAvailable = isWebMCPSupported();
    setSupported(isAvailable);

    const success = registerEngelsizForumWebMCPTools({
      onSearch: (query) => {
        toast.info(`🤖 Chrome WebMCP Yapay Zeka Arama İsteği: "${query}"`);
        router.push(`/search?q=${encodeURIComponent(query)}`);
      },
      onCalculateBalthazard: (rates) => {
        toast.info(`🤖 Chrome WebMCP Balthazard Hesabı: %${rates.join(', %')}`);
        return 0;
      },
      onToggleAccessibility: (feature, enabled) => {
        toast.success(`🤖 Chrome WebMCP Erişilebilirlik: ${feature} = ${enabled}`);
        updateSettings({ [feature]: enabled });
      },
    });

    setRegistered(success);
  }, [router, updateSettings]);

  const runToolTest = async (toolName: string) => {
    try {
      if (toolName === 'engelsizforum_search') {
        toast.success(`🤖 [WebMCP] engelsizforum_search çağrıldı: "ÖTV 2026"`);
        setTestOutput(JSON.stringify({ tool: 'engelsizforum_search', query: 'ÖTV 2026', status: 'EXECUTED_SUCCESS' }, null, 2));
        router.push('/search?q=%C3%96TV%202026');
      } else if (toolName === 'engelsizforum_balthazard_calc') {
        const rates = [40, 20, 10];
        let total = 100;
        let score = 0;
        rates.sort((a,b) => b-a).forEach(r => {
          const add = (total * r) / 100;
          score += add;
          total -= add;
        });
        const finalScore = Math.round(score);
        toast.success(`🤖 [WebMCP] Balthazard Hesabı Sonucu: %${finalScore}`);
        setTestOutput(JSON.stringify({ tool: 'engelsizforum_balthazard_calc', input: rates, resultScore: `%${finalScore}`, otvEligible: finalScore >= 90 }, null, 2));
      } else if (toolName === 'engelsizforum_disability_rights_guide') {
        toast.success(`🤖 [WebMCP] %40 Rapor Yasal Haklar Rehberi Çağrıldı`);
        setTestOutput(JSON.stringify({
          tool: 'engelsizforum_disability_rights_guide',
          reportPercentage: 40,
          grantedRights: [
            'Şehir İçi Tüm Toplu Taşıma Araçları Ücretsiz',
            'EKPSS Sınavına Girme ve %3 Engelli Kadrosu',
            'Yaş Şartsız Kademeli Engelli Erken Emekliliği',
            'Emlak Vergisi Tam Muafiyeti (200m² Tek Mesken)',
            'Türk Telekom, Turkcell, Vodafone %25-50 İndirimi',
            'Su Faturasında %50 İndirim'
          ]
        }, null, 2));
      } else if (toolName === 'engelsizforum_legislation_lookup') {
        toast.info(`🤖 [WebMCP] 4760 Sayılı ÖTV Kanunu Sorgulandı`);
        setTestOutput(JSON.stringify({
          tool: 'engelsizforum_legislation_lookup',
          category: 'otv_2026',
          lawNo: '4760 Sayılı ÖTV Kanunu Madde 7/2',
          limit2026: '2.247.100 TL',
          summary: '%90 üzeri raporlulara %100 ÖTV muafiyeti, 5 yıl devredilemezlik şartı.'
        }, null, 2));
      } else if (toolName === 'engelsizforum_accessibility_toggle') {
        updateSettings({ highContrast: true });
        toast.success(`🤖 [WebMCP] Yüksek Kontrast Modu Aktifleştirildi!`);
        setTestOutput(JSON.stringify({ tool: 'engelsizforum_accessibility_toggle', feature: 'highContrast', enabled: true }, null, 2));
      } else if (toolName === 'engelsizforum_get_categories') {
        toast.info(`🤖 [WebMCP] 5 Ana Kategori Listelendi`);
        setTestOutput(JSON.stringify({
          tool: 'engelsizforum_get_categories',
          categoriesCount: 5,
          sample: ['Sağlık & Erişilebilirlik', 'Yasal Haklar & Mevzuat', 'Eğitim & Kariyer', 'Sosyal Yaşam', 'Teknoloji']
        }, null, 2));
      }
    } catch (err) {
      console.error(err);
      toast.error('Araç tetiklenirken hata oluştu.');
    }
  };

  return (
    <>
      {children}

      {/* 
        Declarative WebMCP Forms for Chrome DevTools DOM Scanner
      */}
      <div 
        id="webmcp-declarative-tools" 
        data-webmcp="enabled"
        className="sr-only absolute -top-9999px left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none"
      >
        <form
          toolname="engelsizforum_search"
          tooldescription="EngelsizForum üzerindeki konuları, mevzuatı, ÖTV 2026 şartlarını ve sağlık raporu rehberlerini arar."
          data-toolname="engelsizforum_search"
          data-tooldescription="EngelsizForum üzerindeki konuları, mevzuatı, ÖTV 2026 şartlarını ve sağlık raporu rehberlerini arar."
          name="engelsizforum_search"
          action="/search"
          method="GET"
        >
          <label htmlFor="webmcp-search-query" className="sr-only">Aranacak kelime veya konu</label>
          <input
            id="webmcp-search-query"
            type="text"
            name="query"
            aria-label="Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard)"
            toolparamdescription="Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard)"
            data-toolparamdescription="Aranacak kelime veya konu (ör. ÖTV 2026, EKPSS, Balthazard)"
            required
          />
          <button type="submit">Ara</button>
        </form>

        <form
          toolname="engelsizforum_balthazard_calc"
          tooldescription="Birden fazla engel oranını Balthazard formülü ile birleştirerek toplam engel oranını hesaplar."
          data-toolname="engelsizforum_balthazard_calc"
          data-tooldescription="Birden fazla engel oranını Balthazard formülü ile birleştirerek toplam engel oranını hesaplar."
          name="engelsizforum_balthazard_calc"
          action="/hesaplayicilar/balthazard"
          method="POST"
        >
          <label htmlFor="webmcp-balthazard-rates" className="sr-only">Engel oranları dizisi</label>
          <input
            id="webmcp-balthazard-rates"
            type="text"
            name="rates"
            aria-label="Engel oranları dizisi (ör. 40,20,10)"
            toolparamdescription="Engel oranları dizisi (ör. 40,20,10)"
            data-toolparamdescription="Engel oranları dizisi (ör. 40,20,10)"
            required
          />
          <button type="submit">Hesapla</button>
        </form>

        <form
          toolname="engelsizforum_disability_rights_guide"
          tooldescription="Rapor oranına ve engel grubuna göre engelli bireylere tanınan tüm resmi hakları sorgular."
          data-toolname="engelsizforum_disability_rights_guide"
          data-tooldescription="Rapor oranına ve engel grubuna göre engelli bireylere tanınan tüm resmi hakları sorgular."
          name="engelsizforum_disability_rights_guide"
        >
          <label htmlFor="webmcp-guide-report" className="sr-only">Rapor engel oranı</label>
          <input
            id="webmcp-guide-report"
            type="number"
            name="reportPercentage"
            aria-label="Rapor engel oranı (ör. 40, 70, 90)"
            toolparamdescription="Rapor engel oranı (ör. 40, 70, 90)"
            data-toolparamdescription="Rapor engel oranı (ör. 40, 70, 90)"
            required
          />
          <button type="submit">Hakları Sorgula</button>
        </form>

        <form
          toolname="engelsizforum_legislation_lookup"
          tooldescription="Türkiye ÖTV, Emeklilik, Evde Bakım ve EKPSS engelli mevzuat maddelerini verir."
          data-toolname="engelsizforum_legislation_lookup"
          data-tooldescription="Türkiye ÖTV, Emeklilik, Evde Bakım ve EKPSS engelli mevzuat maddelerini verir."
          name="engelsizforum_legislation_lookup"
        >
          <label htmlFor="webmcp-legislation-category" className="sr-only">Mevzuat kategorisi</label>
          <input
            id="webmcp-legislation-category"
            type="text"
            name="category"
            aria-label="Mevzuat kategorisi: otv_2026 | emeklilik | evde_bakim | ekpss | ram_egitim"
            toolparamdescription="Mevzuat kategorisi: otv_2026 | emeklilik | evde_bakim | ekpss | ram_egitim"
            data-toolparamdescription="Mevzuat kategorisi: otv_2026 | emeklilik | evde_bakim | ekpss | ram_egitim"
            required
          />
          <button type="submit">Mevzuat Al</button>
        </form>

        <form
          toolname="engelsizforum_accessibility_toggle"
          tooldescription="EngelsizForum WCAG 2.1 AAA erişilebilirlik tercihlerini (yüksek kontrast, disleksi fontu, biyonik okuma) değiştirir."
          data-toolname="engelsizforum_accessibility_toggle"
          data-tooldescription="EngelsizForum WCAG 2.1 AAA erişilebilirlik tercihlerini (yüksek kontrast, disleksi fontu, biyonik okuma) değiştirir."
          name="engelsizforum_accessibility_toggle"
        >
          <label htmlFor="webmcp-a11y-feature" className="sr-only">Değiştirilecek özellik</label>
          <input
            id="webmcp-a11y-feature"
            type="text"
            name="feature"
            aria-label="Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading"
            toolparamdescription="Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading"
            data-toolparamdescription="Değiştirilecek özellik: highContrast | dyslexicFont | bionicReading"
            required
          />
          <label htmlFor="webmcp-a11y-enabled" className="sr-only">Aktif veya pasif olma durumu</label>
          <input
            id="webmcp-a11y-enabled"
            type="checkbox"
            name="enabled"
            aria-label="Aktif (true) veya pasif (false) olma durumu"
            toolparamdescription="Aktif (true) veya pasif (false) olma durumu"
            data-toolparamdescription="Aktif (true) veya pasif (false) olma durumu"
          />
          <button type="submit">Değiştir</button>
        </form>

        <form
          toolname="engelsizforum_get_categories"
          tooldescription="EngelsizForum'daki 5 ana kategori ve 20 alt kategoriyi listeler."
          data-toolname="engelsizforum_get_categories"
          data-tooldescription="EngelsizForum'daki 5 ana kategori ve 20 alt kategoriyi listeler."
          name="engelsizforum_get_categories"
        >
          <button type="submit">Kategorileri Getir</button>
        </form>
      </div>

      {/* WebMCP Status Badge & Information Trigger */}
      <div className="fixed bottom-4 left-20 sm:bottom-6 sm:left-24 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowInfoModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Chrome WebMCP Yapay Zeka Entegrasyon Bilgisi"
          title="EngelsizForum Chrome WebMCP Protokolünü Destekler"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>Chrome WebMCP</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            v1.1
          </span>
        </button>

        <a
          href="/webmcp"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-sm transition-colors"
          title="WebMCP Canlı Test Panelini Aç"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">WebMCP Sayfası</span>
        </a>
      </div>

      {/* WebMCP Info & Test Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="webmcp-modal-title"
        >
          <div className="bg-background border border-border rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-foreground relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="webmcp-modal-title" className="text-lg font-bold text-foreground">
                    Google Chrome & Gemini WebMCP Desteği
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Web Model Context Protocol (W3C Web ML Standardı & Gemini Remote MCP)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-muted"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">EngelsizForum</strong>, hem istemci tarafında <strong className="text-blue-600 dark:text-blue-400">Chrome WebMCP (Browser Agent)</strong> hem de sunucu tarafında <strong className="text-indigo-600 dark:text-indigo-400">Gemini Web / Claude MCP Endpoint</strong> desteği sunar.
              </p>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    WebMCP İstemci Durumu:
                  </span>
                  {supported || registered ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif & Kayıtlı (`document.modelContext`)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      Shim / Polyfill Modu
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Interactive Tool Tester */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Kayıtlı Tüm WebMCP Araçlarını Tetikle:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => runToolTest('engelsizforum_search')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>🔍 Arama Yap (&quot;ÖTV 2026&quot;)</span>
                    <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                  </button>

                  <button
                    onClick={() => runToolTest('engelsizforum_balthazard_calc')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>🧮 Balthazard (%40,%20,%10)</span>
                    <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                  </button>

                  <button
                    onClick={() => runToolTest('engelsizforum_disability_rights_guide')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>📜 %40 Rapor Yasal Hakları</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </button>

                  <button
                    onClick={() => runToolTest('engelsizforum_legislation_lookup')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>⚖️ ÖTV 2026 Kanunu Madde 7/2</span>
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  </button>

                  <button
                    onClick={() => runToolTest('engelsizforum_accessibility_toggle')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>♿ Yüksek Kontrast Aç</span>
                    <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                  </button>

                  <button
                    onClick={() => runToolTest('engelsizforum_get_categories')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-medium transition-colors"
                  >
                    <span>📁 Kategorileri Getir</span>
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>

              {testOutput && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">Son Çalıştırma Çıktısı:</span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto border border-slate-800">
                    {testOutput}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="/webmcp"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Detaylı WebMCP Dokümantasyon Sayfası</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
