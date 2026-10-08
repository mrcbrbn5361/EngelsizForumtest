'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Target,
  ExternalLink,
  Home,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';
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

  // If not signed in and loading finishes, handled gracefully below without bounce loop

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
        fullName: fullName.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        accessibilityPrefs: accessPrefs,
        notificationPrefs: {
          email: emailNotifications,
          browser: browserNotifications,
        }
      });

      if (!result.success) {
        setFormError(result.error || 'Profil güncellenirken bir hata oluştu.');
        toast.error(result.error || 'Profil güncellenemedi.');
      } else {
        setFormSuccess('Profiliniz ve tercihleriniz başarıyla güncellendi.');
        setHasUnsavedChanges(false);
        toast.success('Profil değişiklikleriniz kaydedildi.');
        await refreshProfile();
      }
    } catch (err: any) {
      setFormError(err.message || 'Beklenmeyen bir hata oluştu.');
      toast.error('İşlem başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="animate-spin text-sky-600 size-10 mb-3" aria-hidden="true" />
        <p className="text-xs text-slate-500 font-medium">Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4 mx-auto shadow-xs">
          <User size={32} />
        </div>
        <h1 className="text-xl font-black text-slate-950 dark:text-white mb-2">Profil ve Tercih Yönetimi</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
          Profil bilgilerinizi, erişilebilirlik ayarlarınızı ve bildirim tercihlerinizi düzenleyebilmek için lütfen oturum açın.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-md"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="hover:text-sky-600 font-semibold">Hesabım</span>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Profil &amp; Tercih Ayarları</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Content Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header summary banner */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={avatarUrl || profile?.avatar_url}
                  username={username || profile?.username}
                  name={fullName || profile?.full_name}
                  size="xl"
                  className="ring-4 ring-slate-100 dark:ring-slate-800 rounded-2xl shadow-sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight truncate">
                      {fullName || profile?.full_name || username || 'Kullanıcı Profili'}
                    </h1>
                    <UserRoleBadge role={profile?.role} size="xs" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">@{username || profile?.username}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {user?.id && (
                  <Link href={`/profile/${user.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 font-bold">
                      <ExternalLink size={14} />
                      <span>Herkese Açık Profil</span>
                    </Button>
                  </Link>
                )}
                <Link href="/messages">
                  <Button variant="primary" size="sm" className="gap-1.5 font-bold">
                    <MessageSquare size={14} />
                    <span>Özel Mesajlar (DM)</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Status Announcements */}
          {formError && (
            <div 
              id={alertId}
              role="alert"
              className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 text-destructive border-2 border-destructive/20 font-bold text-xs leading-relaxed"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div 
              role="status"
              className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 font-bold text-xs leading-relaxed"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Profile Settings Form */}
          <form onSubmit={handleSave} className="space-y-6" noValidate>
            
            {/* Card 1: Temel Bilgiler */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <User size={16} />
                <span>Temel Profil Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={usernameId} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kullanıcı Adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={usernameId}
                    type="text"
                    required
                    value={username}
                    onChange={(e) => handleFieldChange(setUsername, e.target.value)}
                    className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 transition-colors"
                    placeholder="ornek_kullanici"
                    maxLength={30}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={fullNameId} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Ad Soyad
                  </label>
                  <input
                    id={fullNameId}
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFieldChange(setFullName, e.target.value)}
                    className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 transition-colors"
                    placeholder="Adınız Soyadınız"
                    maxLength={70}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor={avatarId} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Profil Resmi / Avatar URL
                  </label>
                  <input
                    id={avatarId}
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => handleFieldChange(setAvatarUrl, e.target.value)}
                    className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 transition-colors"
                    placeholder="https://... (boş bırakırsanız otomatik oluşturulur)"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor={bioId} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Biyografi &bull; Kendinizden Bahsedin
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">{bio.length}/300</span>
                  </div>
                  <textarea
                    id={bioId}
                    rows={3}
                    value={bio}
                    onChange={(e) => handleFieldChange(setBio, e.target.value)}
                    className="w-full p-3 text-xs font-medium rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 transition-colors resize-none"
                    placeholder="Deneyimleriniz, ilgi duyduğunuz mevzuatlar veya engelsiz yaşam tecrübeleriniz..."
                    maxLength={300}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Erişilebilirlik Tercihleri */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Accessibility size={16} />
                <span>Kişisel Erişilebilirlik Ayarları</span>
              </div>

              <div className="space-y-3">
                {/* Font Size */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Yazı Büyüklüğü (Font Size)</p>
                    <p className="text-[11px] text-slate-500">Platform genelindeki varsayılan metin boyutu</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 sm:w-64">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          updateSettings({ fontSize: size });
                          setHasUnsavedChanges(true);
                        }}
                        className={cn(
                          "py-1.5 text-xs font-bold uppercase rounded-lg border-2 transition-colors cursor-pointer",
                          fontSize === size 
                            ? "bg-sky-700 text-white border-sky-700 font-black" 
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
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
                    desc="Zıtlığı artırır (WCAG AAA)"
                    active={highContrast}
                    onToggle={() => {
                      updateSettings({ highContrast: !highContrast });
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <PreferenceToggle
                    icon={<Type size={14} />}
                    title="Disleksi Uyumlu Font"
                    desc="Okumayı kolaylaştıran özel font"
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
            </div>

            {/* Card 3: Bildirim Tercihleri */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Bell size={16} />
                <span>Bildirim Tercihleri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PreferenceToggle
                  icon={<Bell size={14} />}
                  title="E-posta Bildirimleri"
                  desc="Mesaj ve konu yanıtlarında e-posta al"
                  active={emailNotifications}
                  onToggle={() => handleFieldChange(setEmailNotifications, !emailNotifications)}
                />
                <PreferenceToggle
                  icon={<Eye size={14} />}
                  title="Tarayıcı Bildirimleri"
                  desc="Anlık web bildirimleri al"
                  active={browserNotifications}
                  onToggle={() => handleFieldChange(setBrowserNotifications, !browserNotifications)}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (profile) {
                    setUsername(profile.username || '');
                    setFullName(profile.full_name || '');
                    setBio(profile.bio || '');
                    setAvatarUrl(profile.avatar_url || '');
                    setHasUnsavedChanges(false);
                    setFormError(null);
                    setFormSuccess(null);
                  }
                }}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw size={14} /> 
                <span>Vazgeç</span>
              </button>

              <Button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                variant="primary"
                size="default"
                className="gap-2 font-bold"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                <span>{isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </Button>
            </div>
          </form>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>

      </div>
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
        "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left w-full outline-none cursor-pointer",
        active 
          ? "bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-800 text-sky-900 dark:text-sky-200" 
          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
      )}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2.5 pr-2">
        <div className={cn("p-2 rounded-lg shrink-0", active ? "bg-sky-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
        </div>
      </div>
      <div className={cn(
        "h-4 w-7 rounded-full border relative transition-colors shrink-0",
        active ? "bg-sky-600 border-sky-600" : "bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-3" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}
