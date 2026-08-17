'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { updateProfileServerAction } from '@/app/actions';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';
import { 
  User, 
  Settings, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Accessibility, 
  Bell, 
  Shield, 
  Sparkles,
  RotateCcw,
  Eye,
  Type,
  MoveHorizontal,
  Contrast,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfileManagementPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { 
    fontSize, 
    highContrast, 
    dyslexicFont, 
    reducedMotion, 
    bionicReading, 
    focusMode,
    updateSettings 
  } = useAccessibility();
  const router = useRouter();

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification & Accessibility preferences local state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  // Form UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Accessible IDs
  const usernameId = useId();
  const fullNameId = useId();
  const bioId = useId();
  const avatarId = useId();
  const alertId = useId();

  // Populate form from authenticated profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');

      const notifPrefs = (profile as any).notification_prefs || {};
      if (typeof notifPrefs.email === 'boolean') setEmailNotifications(notifPrefs.email);
      if (typeof notifPrefs.browser === 'boolean') setBrowserNotifications(notifPrefs.browser);
      if (typeof notifPrefs.sound === 'boolean') setSoundAlerts(notifPrefs.sound);

      setHasUnsavedChanges(false);
    }
  }, [profile]);

  // Unsaved changes tracker
  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setHasUnsavedChanges(true);
    setFormSuccess(null);
    setFormError(null);
  };

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/profile');
    }
  }, [authLoading, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setFormError(null);
    setFormSuccess(null);

    // Validation
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setFormError('Kullanıcı adı en az 3 karakter olmalı ve yalnızca küçük harf, rakam veya alt çizgi içermelidir.');
      return;
    }
    if (cleanUsername.length > 30) {
      setFormError('Kullanıcı adı en fazla 30 karakter olabilir.');
      return;
    }
    if (fullName.trim().length > 70) {
      setFormError('Ad soyad alanı 70 karakterden uzun olamaz.');
      return;
    }
    if (bio.trim().length > 300) {
      setFormError('Biyografi 300 karakterden uzun olamaz.');
      return;
    }

    setIsSubmitting(true);

    try {
      const accessPrefs = {
        fontSize,
        highContrast,
        dyslexicFont,
        reducedMotion,
        bionicReading,
        focusMode
      };

      const result = await updateProfileServerAction({
        username: cleanUsername,
        fullName: fullName.trim(),
        bio: bio.trim(),
        accessibilityPrefs: accessPrefs
      });

      if (!result.success) {
        throw new Error(result.error || 'Profil güncellenirken bir hata oluştu.');
      }

      await refreshProfile();
      setHasUnsavedChanges(false);
      setFormSuccess('Profiliniz ve tercihleriniz başarıyla güncellendi.');
      toast.success('Profil bilgileri kaydedildi.');
    } catch (err: any) {
      console.error('Profile save error:', err);
      setFormError(err.message || 'Profil kaydedilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      toast.error('Güncelleme başarısız oldu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
        <Navbar />
        <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6" tabIndex={-1}>
          <Loader2 className="animate-spin text-sky-400 size-10 mb-3" aria-hidden="true" />
          <p className="text-xs text-slate-400 font-medium">Profil bilgileri yükleniyor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10" tabIndex={-1}>
        {/* Header summary banner */}
        <div className="bg-[#111726]/90 border border-white/[0.08] rounded-2xl p-5 sm:p-7 backdrop-blur-md mb-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={avatarUrl || profile?.avatar_url}
                username={username || profile?.username}
                name={fullName || profile?.full_name}
                size="lg"
                className="ring-2 ring-sky-500/30 rounded-2xl"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
                    {fullName || profile?.full_name || username || 'Kullanıcı Profili'}
                  </h1>
                  <UserRoleBadge role={profile?.role} size="xs" />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">@{username || profile?.username}</p>
                <p className="text-[11px] text-slate-500 mt-1 truncate max-w-xs sm:max-w-md">{user?.email}</p>
              </div>
            </div>

            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold animate-pulse">
                <Sparkles size={13} /> Kaydedilmemiş değişiklikler var
              </span>
            )}
          </div>
        </div>

        {/* Status Announcements */}
        {formError && (
          <div 
            id={alertId}
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-semibold text-xs leading-relaxed mb-6"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div 
            role="status"
            aria-live="polite"
            className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs leading-relaxed mb-6"
          >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          {/* Card 1: Temel Bilgiler */}
          <section aria-labelledby="basic-info-heading" className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <h2 id="basic-info-heading" className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
              <User size={15} /> Temel Profil Bilgileri
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor={usernameId} className="text-xs font-bold text-slate-300">
                  Kullanıcı Adı <span className="text-rose-400">*</span>
                </label>
                <input
                  id={usernameId}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => handleFieldChange(setUsername, e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
                  placeholder="ornek_kullanici"
                  maxLength={30}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={fullNameId} className="text-xs font-bold text-slate-300">
                  Ad Soyad
                </label>
                <input
                  id={fullNameId}
                  type="text"
                  value={fullName}
                  onChange={(e) => handleFieldChange(setFullName, e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
                  placeholder="Adınız Soyadınız"
                  maxLength={70}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={bioId} className="text-xs font-bold text-slate-300">
                    Biyografi / Hakkımda
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">{bio.length}/300</span>
                </div>
                <textarea
                  id={bioId}
                  rows={3}
                  value={bio}
                  onChange={(e) => handleFieldChange(setBio, e.target.value)}
                  className="w-full p-3 text-xs font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors resize-none"
                  placeholder="Kendinizden, ilgi alanlarınızdan veya deneyimlerinizden kısaca bahsedin..."
                  maxLength={300}
                />
              </div>
            </div>
          </section>

          {/* Card 2: Erişilebilirlik Tercihleri */}
          <section aria-labelledby="accessibility-prefs-heading" className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <h2 id="accessibility-prefs-heading" className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
              <Accessibility size={15} /> Kişiselleştirilmiş Erişilebilirlik
            </h2>

            <div className="space-y-3">
              {/* Font Size */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#0b0f19] border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-slate-200">Metin Okuma Boyutu</p>
                  <p className="text-[11px] text-slate-400">Forum genelindeki yazı büyüklüğü</p>
                </div>
                <div className="grid grid-cols-4 gap-1 sm:w-64">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        updateSettings({ fontSize: size });
                        setHasUnsavedChanges(true);
                      }}
                      className={cn(
                        "py-1.5 text-xs font-bold uppercase rounded-lg border transition-colors",
                        fontSize === size 
                          ? "bg-sky-500 text-slate-950 border-sky-500 font-black" 
                          : "bg-[#111726] text-slate-300 border-white/[0.08] hover:bg-[#161f33]"
                      )}
                      aria-pressed={fontSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PreferenceToggle
                  icon={<Contrast size={14} />}
                  title="Yüksek Kontrast"
                  desc="Metin ve arka plan zıtlığını artırır"
                  active={highContrast}
                  onToggle={() => {
                    updateSettings({ highContrast: !highContrast });
                    setHasUnsavedChanges(true);
                  }}
                />
                <PreferenceToggle
                  icon={<Type size={14} />}
                  title="Disleksi Uyumlu Font"
                  desc="Okumayı kolaylaştıran font ailesi"
                  active={dyslexicFont}
                  onToggle={() => {
                    updateSettings({ dyslexicFont: !dyslexicFont });
                    setHasUnsavedChanges(true);
                  }}
                />
                <PreferenceToggle
                  icon={<Sparkles size={14} />}
                  title="Biyonik Okuma"
                  desc="Kelimelerin baş harflerini vurgular"
                  active={bionicReading}
                  onToggle={() => {
                    updateSettings({ bionicReading: !bionicReading });
                    setHasUnsavedChanges(true);
                  }}
                />
                <PreferenceToggle
                  icon={<MoveHorizontal size={14} />}
                  title="Hareketi Azalt"
                  desc="Arayüz animasyonlarını durdurur"
                  active={reducedMotion}
                  onToggle={() => {
                    updateSettings({ reducedMotion: !reducedMotion });
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </div>
          </section>

          {/* Card 3: Bildirim Tercihleri */}
          <section aria-labelledby="notification-prefs-heading" className="bg-[#111726]/80 border border-white/[0.08] rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <h2 id="notification-prefs-heading" className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
              <Bell size={15} /> Bildirim ve İletişim Tercihleri
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <PreferenceToggle
                icon={<Bell size={14} />}
                title="E-posta Bildirimleri"
                desc="Yanıtlar ve mesajlar e-postanıza gelsin"
                active={emailNotifications}
                onToggle={() => handleFieldChange(setEmailNotifications, !emailNotifications)}
              />
              <PreferenceToggle
                icon={<Eye size={14} />}
                title="Tarayıcı Bildirimleri"
                desc="Gerçek zamanlı web bildirimleri"
                active={browserNotifications}
                onToggle={() => handleFieldChange(setBrowserNotifications, !browserNotifications)}
              />
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (profile) {
                  setUsername(profile.username || '');
                  setFullName(profile.full_name || '');
                  setBio(profile.bio || '');
                  setHasUnsavedChanges(false);
                  setFormError(null);
                  setFormSuccess(null);
                }
              }}
              disabled={!hasUnsavedChanges || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#111726] hover:bg-[#161f33] text-slate-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw size={14} /> Değişiklikleri Sıfırla
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

function PreferenceToggle({
  icon,
  title,
  desc,
  active,
  onToggle
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all text-left w-full outline-none",
        active 
          ? "bg-sky-500/10 border-sky-500/30 text-sky-400" 
          : "bg-[#0b0f19] border-white/[0.06] text-slate-300 hover:bg-[#161f33]"
      )}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2.5 pr-2">
        <div className={cn("p-2 rounded-lg shrink-0", active ? "bg-sky-500 text-slate-950" : "bg-[#161f33] text-slate-400")}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-200">{title}</p>
          <p className="text-[11px] text-slate-400 leading-tight">{desc}</p>
        </div>
      </div>
      <div className={cn(
        "h-4 w-7 rounded-full border relative transition-colors shrink-0",
        active ? "bg-sky-500 border-sky-500" : "bg-slate-800 border-slate-700"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-3" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}


