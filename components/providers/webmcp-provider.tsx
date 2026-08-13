'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isWebMCPSupported, registerEngelsizForumWebMCPTools } from '@/lib/webmcp';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { Bot, CheckCircle2, Sparkles, Cpu, Info } from 'lucide-react';
import { toast } from 'sonner';

export function WebMCPProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { updateSettings } = useAccessibility();
  const [supported, setSupported] = useState<boolean>(false);
  const [registered, setRegistered] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  useEffect(() => {
    const isAvailable = isWebMCPSupported();
    setSupported(isAvailable);

    // Register WebMCP tools into Chrome navigator.modelContext
    const success = registerEngelsizForumWebMCPTools({
      onSearch: (query) => {
        toast.info(`🤖 Chrome WebMCP Yapay Zeka Arama İsteyi: "${query}"`);
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

  return (
    <>
      {children}

      {/* WebMCP Status Badge & Information Trigger in Footer/Corner */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowInfoModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Chrome WebMCP Yapay Zeka Entegrasyon Bilgisi"
          title="EngelsizForum Chrome WebMCP Protokolünü Destekler"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>Chrome WebMCP</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            v1.0
          </span>
        </button>
      </div>

      {/* WebMCP Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="webmcp-modal-title"
        >
          <div className="bg-background border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="webmcp-modal-title" className="text-lg font-bold text-foreground">
                    Google Chrome WebMCP Desteği
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Web Model Context Protocol (W3C Web ML Standardı)
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

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">EngelsizForum</strong>, Google Chrome ve Microsoft iş birliğiyle geliştirilen <strong className="text-blue-600 dark:text-blue-400">WebMCP (Web Model Context Protocol)</strong> standardını Türkiye&apos;de uygulayan ilk platformdur!
              </p>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    Tarayıcı WebMCP Durumu:
                  </span>
                  {supported || registered ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif & Kayıtlı (`navigator.modelContext`)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      Shim / Polyfill Modu (Chrome 146+ Bekleniyor)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Kayıtlı Ajan Araçları (Exposed Tools):
                </p>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-muted-foreground">
                  <li><strong className="text-foreground">engelsizforum_search:</strong> Yapay zeka ajanlarının forumda mevzuat ve konu araması yapmasını sağlar.</li>
                  <li><strong className="text-foreground">engelsizforum_balthazard_calc:</strong> Ajanın doğrudan Balthazard engel oranını hesaplamasını sağlar.</li>
                  <li><strong className="text-foreground">engelsizforum_accessibility_toggle:</strong> Yüksek kontrast ve disleksi fontu ayarlarını ajan komutlarıyla değiştirir.</li>
                  <li><strong className="text-foreground">engelsizforum_get_categories:</strong> Forum kategori ağacını okur.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
