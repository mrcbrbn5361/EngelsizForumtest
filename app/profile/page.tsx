'use client';

export const dynamic = 'force-dynamic';

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
  ShieldCheck,
  Check
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
        <Loader2 className="animate-spin text-indigo-500 size-10 mb-3" aria-hidden="true" />
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto min-h-[400px]">
        <div className="w-20 h-20 rounded-3xl bg-[#111B2E] border border-[#1E293B] text-indigo-400 flex items-center justify-center mb-6 mx-auto shadow-sm">
          <User size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Profil ve Tercih Yönetimi</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Profil bilgilerinizi, erişilebilirlik ayarlarınızı ve bildirim tercihlerinizi düzenleyebilmek için lütfen oturum açın.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="px-8 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md min-h-[44px] flex items-center justify-center"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Breadcrumbs */}
      <nav className="bg-[#111B2E] px-5 py-3 flex items-center gap-2.5 text-xs text-slate-400 border border-[#1E293B] rounded-md shadow-xs" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-indigo-400 flex items-center gap-1.5 transition-colors font-medium">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">Profil & Ayarlar</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header summary banner */}
          <div className="bg-[#111B2E] border border-[#1E293B] rounded-md p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <UserAvatar
                    src={avatarUrl || profile?.avatar_url}
                    username={username || profile?.username}
                    name={fullName || profile?.full_name}
                    size="xl"
                    className="ring-2 ring-indigo-500/20 rounded-md shadow-sm transition-all group-hover:ring-indigo-500/40"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-white tracking-tight truncate">
                      {fullName || profile?.full_name || username || 'Kullanıcı Profili'}
                    </h1>
                    <UserRoleBadge role={profile?.role} size="xs" />
                  </div>
                  <p className="text-xs text-indigo-400 font-mono mt-1 font-semibold">@{username || profile?.username}</p>
                  <p className="text-[11px] text-slate-500 mt-1 truncate max-w-xs sm:max-w-md">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {user?.id && (
                  <Link href={`/profile/${user.id}`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" className="w-full gap-2 font-bold text-[11px] uppercase tracking-wider border-[#1E293B] hover:bg-[#18243A]">
                      <ExternalLink size={14} />
                      <span>Herkese Açık Profil</span>
                    </Button>
                  </Link>
                )}
                <Link href="/messages" className="flex-1 sm:flex-none">
                  <Button variant="primary" size="sm" className="w-full gap-2 font-bold text-[11px] uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500">
                    <MessageSquare size={14} />
                    <span>Özel Mesajlar</span>
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
              className="flex items-start gap-3 p-5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs leading-relaxed animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div 
              role="status"
              className="flex items-start gap-3 p-5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs leading-relaxed animate-in fade-in slide-in-from-top-1"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Profile Settings Form */}
          <form onSubmit={handleSave} className="space-y-8" noValidate>
            
            {/* Card 1: Temel Bilgiler */}
            <div className="bg-[#111B2E] border border-[#1E293B] rounded-md p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border-b border-[#1E293B] pb-4">
                <User size={16} />
                <span>Temel Profil Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor={usernameId} className="text-xs font-bold text-slate-300">
                    Kullanıcı Adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={usernameId}
                    type="text"
                    required
                    value={username}
                    onChange={(e) => handleFieldChange(setUsername, e.target.value)}
                    className="w-full h-11 px-4 text-xs font-medium rounded-md border border-[#1E293B] bg-[#0B1220] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="ornek_kullanici"
                    maxLength={30}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={fullNameId} className="text-xs font-bold text-slate-300">
                    Ad Soyad
                  </label>
                  <input
                    id={fullNameId}
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFieldChange(setFullName, e.target.value)}
                    className="w-full h-11 px-4 text-xs font-medium rounded-md border border-[#1E293B] bg-[#0B1220] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Adınız Soyadınız"
                    maxLength={70}
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label htmlFor={avatarId} className="text-xs font-bold text-slate-300">
                    Profil Resmi / Avatar URL
                  </label>
                  <input
                    id={avatarId}
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => handleFieldChange(setAvatarUrl, e.target.value)}
                    className="w-full h-11 px-4 text-xs font-medium rounded-md border border-[#1E293B] bg-[#0B1220] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="https://... (boş bırakırsanız otomatik oluşturulur)"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor={bioId} className="text-xs font-bold text-slate-300">
                      Biyografi &bull; Kendinizden Bahsedin
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">{bio.length}/300</span>
                  </div>
                  <textarea
                    id={bioId}
                    rows={4}
                    value={bio}
                    onChange={(e) => handleFieldChange(setBio, e.target.value)}
                    className="w-full p-4 text-xs font-medium rounded-md border border-[#1E293B] bg-[#0B1220] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                    placeholder="Deneyimleriniz, ilgi duyduğunuz mevzuatlar veya engelsiz yaşam tecrübeleriniz..."
                    maxLength={300}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Erişilebilirlik Tercihleri */}
            <div className="bg-[#111B2E] border border-[#1E293B] rounded-md p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border-b border-[#1E293B] pb-4">
                <Accessibility size={16} />
                <span>Erişilebilirlik Ayarları</span>
              </div>

              <div className="space-y-4">
                {/* Font Size */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-md bg-[#18243A]/50 border border-[#1E293B]">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Yazı Büyüklüğü</p>
                    <p className="text-[11px] text-slate-400">Platform genelindeki varsayılan metin boyutu</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 w-full md:w-72">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          updateSettings({ fontSize: size });
                          setHasUnsavedChanges(true);
                        }}
                        className={cn(
                          "h-10 text-[10px] font-bold uppercase rounded-md border transition-all cursor-pointer flex items-center justify-center",
                          fontSize === size 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                            : "bg-[#0B1220] text-slate-400 border-[#1E293B] hover:border-slate-500"
                        )}
                        aria-pressed={fontSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="bg-[#111B2E] border border-[#1E293B] rounded-md p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border-b border-[#1E293B] pb-4">
                <Bell size={16} />
                <span>Bildirim Tercihleri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PreferenceToggle
                  icon={<Bell size={14} />}
                  title="E-posta Bildirimleri"
                  desc="Yanıt ve mentionlarda e-posta al"
                  active={emailNotifications}
                  onToggle={() => handleFieldChange(setEmailNotifications, !emailNotifications)}
                />
                <PreferenceToggle
                  icon={<Eye size={14} />}
                  title="Anlık Bildirimler"
                  desc="Web üzerinden anlık bildirim al"
                  active={browserNotifications}
                  onToggle={() => handleFieldChange(setBrowserNotifications, !browserNotifications)}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-4 pt-4">
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-[#1E293B] bg-[#18243A] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer min-h-[44px]"
              >
                <RotateCcw size={16} /> 
                <span>Vazgeç</span>
              </button>

              <Button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                variant="primary"
                size="default"
                className="gap-2 font-bold px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md min-h-[44px]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
        "flex items-center justify-between p-4 rounded-md border transition-all text-left w-full outline-none cursor-pointer group",
        active 
          ? "bg-indigo-950/20 border-indigo-500/40 text-white" 
          : "bg-[#0B1220] border-[#1E293B] text-slate-400 hover:border-slate-700"
      )}
      aria-pressed={active}
    >
      <div className="flex items-center gap-3.5 pr-2">
        <div className={cn(
          "p-2.5 rounded-md shrink-0 transition-colors", 
          active ? "bg-indigo-600 text-white" : "bg-[#18243A] text-slate-500 group-hover:text-slate-300"
        )}>
          {icon}
        </div>
        <div>
          <p className={cn("text-[11px] font-bold uppercase tracking-wider", active ? "text-white" : "text-slate-300")}>{title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</p>
        </div>
      </div>
      <div className={cn(
        "h-4 w-7 rounded-full border relative transition-colors shrink-0",
        active ? "bg-indigo-600 border-indigo-600" : "bg-slate-800 border-slate-700"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform",
          active ? "translate-x-3" : "translate-x-0"
        )} />
      </div>
    </button>
  );
}
