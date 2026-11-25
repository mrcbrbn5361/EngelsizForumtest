'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Shield, Cookie, Accessibility, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { SwitchRow } from '@/components/ui/switch-row';
import { getPreferencesAction, updatePreferencesAction } from '@/app/actions';
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  NOTIFICATION_LABELS,
  NOTIFICATION_TYPES,
  type NotificationPrefs,
  type NotificationType,
  type PrivacyPrefs,
  type ProfileVisibility,
} from '@/lib/preferences';
import { COOKIE_CONSENT_CHANGED_EVENT, readCookieConsent, saveCookieConsent } from '@/lib/cookie-consent';

type Status = { type: 'saving' | 'saved' | 'error'; text: string } | null;

const VISIBILITY_OPTIONS: { id: ProfileVisibility; label: string; desc: string }[] = [
  { id: 'everyone', label: 'Herkes', desc: 'Giriş yapmamış ziyaretçiler dahil herkes profilinizi görebilir.' },
  { id: 'members', label: 'Yalnızca üyeler', desc: 'Ziyaretçiler yalnızca kullanıcı adınızı görür; biyografi, istatistikler ve konularınız gizlenir.' },
];

/**
 * Card wrapper with a heading for one group of preferences.
 */
function Section({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="bg-surface-raised border border-line rounded-md p-5 sm:p-6 space-y-4">
      <h2 id={id} className="flex items-center gap-2.5 text-base font-bold text-fg font-heading">
        <span className="text-indigo-400 light:text-indigo-700" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * /tercihler — notification, privacy and cookie preferences in one place.
 * Every change is saved immediately and announced to screen readers.
 */
export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const { showReadingPresence, updateSettings } = useAccessibility();
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [privacy, setPrivacy] = useState<PrivacyPrefs>(DEFAULT_PRIVACY_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [cookies, setCookies] = useState({ analytics: false, marketing: false });
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const sync = () => {
      const saved = readCookieConsent();
      setCookies({ analytics: saved?.analytics ?? false, marketing: saved?.marketing ?? false });
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!user) return;
    getPreferencesAction().then((res) => {
      if (res.success) {
        setNotifications(res.notifications);
        setPrivacy(res.privacy);
      }
      setLoaded(true);
    });
  }, [user]);

  const persist = async (input: { notifications?: NotificationPrefs; privacy?: PrivacyPrefs }, rollback: () => void) => {
    setStatus({ type: 'saving', text: 'Kaydediliyor...' });
    const res = await updatePreferencesAction(input);
    if (res.success) {
      setStatus({ type: 'saved', text: 'Tercihiniz kaydedildi.' });
    } else {
      rollback();
      setStatus({ type: 'error', text: res.error || 'Tercih kaydedilemedi.' });
    }
  };

  const toggleNotification = (type: NotificationType, value: boolean) => {
    const before = notifications;
    const next = { types: { ...notifications.types, [type]: value } };
    setNotifications(next);
    persist({ notifications: next }, () => setNotifications(before));
  };

  const chooseVisibility = (profileVisibility: ProfileVisibility) => {
    if (profileVisibility === privacy.profileVisibility) return;
    const before = privacy;
    const next = { ...privacy, profileVisibility };
    setPrivacy(next);
    persist({ privacy: next }, () => setPrivacy(before));
  };

  const setCookie = (key: 'analytics' | 'marketing', value: boolean) => {
    const next = { ...cookies, [key]: value };
    setCookies(next);
    saveCookieConsent(next.analytics, next.marketing);
    setStatus({ type: 'saved', text: 'Çerez tercihiniz kaydedildi.' });
  };

  const accountReady = Boolean(user) && loaded;

  return (
    <div className="max-w-3xl mx-auto w-full py-6 sm:py-10 px-1 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-fg font-heading">Tercihler</h1>
        <p className="text-sm text-fg-3">
          Bildirimlerinizi, gizliliğinizi ve çerezleri buradan yönetin. Değişiklikler hemen kaydedilir.
          {user && <> Kullanıcı adı, biyografi ve fotoğraf için <Link href="/profile" className="font-semibold text-indigo-400 light:text-indigo-700 underline">Profil</Link> sayfasına gidin.</>}
        </p>
      </header>

      <p
        role={status?.type === 'error' ? 'alert' : 'status'}
        className={`text-sm font-bold min-h-[1.25rem] ${status?.type === 'error' ? 'text-rose-400 light:text-rose-700' : 'text-emerald-400 light:text-emerald-700'}`}
      >
        {status?.text}
      </p>

      {!authLoading && !user && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-md border border-line bg-surface-raised text-sm text-fg-3">
          <span>Bildirim ve gizlilik tercihleri için giriş yapın. Çerez tercihlerinizi aşağıdan girişsiz değiştirebilirsiniz.</span>
          <Link href="/login?redirect=/tercihler" className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
            <LogIn size={15} aria-hidden="true" /> Giriş yap
          </Link>
        </div>
      )}

      {user && (
        <Section id="pref-notifications" icon={<Bell size={18} />} title="Bildirimler">
          <p className="text-xs text-fg-4">Hangi durumlarda bildirim zilinize bildirim gelsin?</p>
          {!accountReady ? (
            <Loader2 className="animate-spin text-fg-4" size={18} aria-label="Yükleniyor" />
          ) : (
            <div className="space-y-2">
              {NOTIFICATION_TYPES.map((type) => (
                <SwitchRow
                  key={type}
                  title={NOTIFICATION_LABELS[type].title}
                  description={NOTIFICATION_LABELS[type].desc}
                  checked={notifications.types[type]}
                  onChange={(v) => toggleNotification(type, v)}
                  disabled={status?.type === 'saving'}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {user && (
        <Section id="pref-privacy" icon={<Shield size={18} />} title="Gizlilik">
          <div className="space-y-2">
            <span id="profile-visibility-label" className="block text-sm font-bold text-fg">Profilimi kimler görebilir?</span>
            <div role="radiogroup" aria-labelledby="profile-visibility-label" className="grid gap-2 sm:grid-cols-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={privacy.profileVisibility === opt.id}
                  disabled={!accountReady || status?.type === 'saving'}
                  onClick={() => chooseVisibility(opt.id)}
                  className={`text-left p-4 rounded-md border min-h-[44px] cursor-pointer disabled:cursor-not-allowed ${
                    privacy.profileVisibility === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <span className="block text-sm font-bold text-fg">{opt.label}</span>
                  <span className="block text-xs text-fg-4 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <SwitchRow
            title="Okuduğum konularda adımı göster"
            description="Kapalıysa konuların altındaki 'okuyanlar' listesinde adınız yerine 'gizli üye' yazar."
            checked={showReadingPresence}
            onChange={(v) => {
              updateSettings({ showReadingPresence: v });
              setStatus({ type: 'saved', text: 'Tercihiniz kaydedildi.' });
            }}
          />
        </Section>
      )}

      <Section id="pref-cookies" icon={<Cookie size={18} />} title="Çerezler">
        <p className="text-xs text-fg-4">
          Çerez tercihiniz yalnızca bu tarayıcıda saklanır. Ayrıntılar için <Link href="/privacy" className="underline">Gizlilik Politikası</Link>.
        </p>
        <div className="space-y-2">
          <SwitchRow title="Zorunlu çerezler" description="Oturum açma ve güvenlik için gereklidir; kapatılamaz." checked onChange={() => {}} disabled />
          <SwitchRow title="Analitik çerezler" description="Hangi sayfaların kullanıldığını anonim olarak ölçmemize yardım eder (Google Analytics)." checked={cookies.analytics} onChange={(v) => setCookie('analytics', v)} />
          <SwitchRow title="Reklam çerezleri" description="Kişiselleştirilmiş reklamlar için kullanılır (Google)." checked={cookies.marketing} onChange={(v) => setCookie('marketing', v)} />
        </div>
      </Section>

      <Section id="pref-accessibility" icon={<Accessibility size={18} />} title="Erişilebilirlik ve görünüm">
        <p className="text-sm text-fg-3">
          Tema (gece, gündüz, göz yormama), yazı boyutu, okuma fontu ve kontrast ayarları üst menüdeki <strong>Erişilebilirlik</strong> düğmesinde.
          Giriş yaptıysanız bu ayarlar da hesabınıza kaydedilir.
        </p>
        <Link href="/accessibility-settings" className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md border border-line bg-surface-hover hover:bg-surface-active text-fg text-xs font-bold">
          Tüm erişilebilirlik ayarları
        </Link>
      </Section>
    </div>
  );
}
