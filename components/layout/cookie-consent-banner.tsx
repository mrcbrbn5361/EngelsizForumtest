'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Check, X, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { applyCookieConsent, readCookieConsent, saveCookieConsent } from '@/lib/cookie-consent';


export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<{
    analytics: boolean;
    marketing: boolean;
  }>({
    analytics: false,
    marketing: false,
  });

  // Initialize on mount
  useEffect(() => {
    const saved = readCookieConsent();
    if (saved) {
      applyCookieConsent(saved.analytics, saved.marketing);
      return;
    }
    const timer = setTimeout(() => setIsOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Listen for open requests (e.g. from footer)
  useEffect(() => {
    const handleOpen = () => {
      const saved = readCookieConsent();
      if (saved) setPreferences({ analytics: saved.analytics, marketing: saved.marketing });
      setShowCustomize(true);
      setIsOpen(true);
    };

    window.addEventListener('open-cookie-settings', handleOpen);
    return () => window.removeEventListener('open-cookie-settings', handleOpen);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Close if customization modal is open, or keep banner minimized
        if (showCustomize) {
          setShowCustomize(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCustomize]);

  const savePreferences = (analytics: boolean, marketing: boolean) => {
    saveCookieConsent(analytics, marketing);
    setIsOpen(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    savePreferences(true, true);
  };

  const handleRejectAll = () => {
    savePreferences(false, false);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences.analytics, preferences.marketing);
  };

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Çerez ve Gizlilik Tercihleri"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-surface/95 backdrop-blur-md border-t border-line shadow-2xl text-fg font-sans transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Main Banner Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 light:text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie size={17} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-semibold text-fg flex items-center gap-2 font-heading">
                <span>Çerez ve Gizlilik Tercihleriniz</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 light:bg-emerald-50/60 text-emerald-400 light:text-emerald-700 border border-emerald-800/40">
                  KVKK &amp; Google Consent Mode v2
                </span>
              </h2>
              <p className="text-xs text-fg-3 leading-relaxed font-normal">
                EngelsizForum&apos;da deneyiminizi geliştirmek, erişilebilirlik tercihlerinizi hatırlamak ve anonim site trafiğini analiz etmek için birinci ve üçüncü taraf çerezleri kullanıyoruz. İsteğinize göre ayarları özelleştirebilir veya tümünü kabul edebilirsiniz.{' '}
                <Link
                  href="/privacy"
                  className="text-indigo-400 light:text-indigo-700 hover:text-indigo-300 light:hover:text-indigo-700 hover:underline font-medium inline-flex items-center gap-0.5"
                  target="_blank"
                >
                  <span>Gizlilik Politikası</span>
                  <ExternalLink size={10} />
                </Link>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
              className="px-3 py-2 text-xs font-medium rounded-md border border-line bg-surface-hover hover:bg-line text-fg-3 transition-colors flex items-center gap-1.5 cursor-pointer"
              aria-expanded={showCustomize}
            >
              <SlidersHorizontal size={13} className="text-fg-4" />
              <span>{showCustomize ? 'Kapat' : 'Özelleştir'}</span>
            </button>

            <button
              type="button"
              onClick={handleRejectAll}
              className="px-3.5 py-2 text-xs font-medium rounded-md border border-line bg-surface-hover hover:bg-line text-fg-3 transition-colors cursor-pointer"
            >
              Reddet
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs cursor-pointer"
            >
              Tümünü Kabul Et
            </button>
          </div>
        </div>

        {/* Detailed Customization Panel */}
        {showCustomize && (
          <div className="pt-3 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* 1. Necessary */}
            <div className="p-3 rounded-lg border border-line bg-surface-raised space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400 light:text-emerald-700" />
                  Zorunlu Çerezler
                </span>
                <span className="text-[10px] font-mono text-emerald-400 light:text-emerald-700 uppercase bg-emerald-950/60 light:bg-emerald-50/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                  Daima Aktif
                </span>
              </div>
              <p className="text-[11px] text-fg-4 leading-normal font-normal">
                Oturum güvenliği, CSRF koruması ve temel erişilebilirlik ayarlarının (yüksek kontrast vb.) çalışması için gereklidir.
              </p>
            </div>

            {/* 2. Analytics */}
            <div className="p-3 rounded-lg border border-line bg-surface-raised space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="consent-analytics" className="text-xs font-semibold text-fg flex items-center gap-1.5 cursor-pointer">
                  <span>Analitik ve Performans</span>
                </label>
                <input
                  id="consent-analytics"
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-line text-indigo-600 focus:ring-indigo-500 bg-surface-hover cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-fg-4 leading-normal font-normal">
                Google Analytics ile sayfa görüntülenme, en çok okunan mevzuat başlıkları ve ziyaret istatistiklerini anonim ölçümler.
              </p>
            </div>

            {/* 3. Marketing */}
            <div className="p-3 rounded-lg border border-line bg-surface-raised space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="consent-marketing" className="text-xs font-semibold text-fg flex items-center gap-1.5 cursor-pointer">
                  <span>Pazarlama ve Reklam</span>
                </label>
                <input
                  id="consent-marketing"
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-line text-indigo-600 focus:ring-indigo-500 bg-surface-hover cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-fg-4 leading-normal font-normal">
                Google AdSense reklamlarının kişiselleştirilmesi ve size özel alakalı içeriklerin gösterilmesi için kullanılır.
              </p>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Seçimlerimi Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
