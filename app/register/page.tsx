'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { 
  LogIn, Mail, Lock, AlertCircle, Loader2, Sparkles, 
  HelpCircle, Eye, EyeOff, Check, UserPlus, User,
  ChevronRight, ChevronLeft, Type, BookOpen, Compass, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Premium Step-by-Step Register Page with an Initial Onboarding Accessibility Wizard.
 */
export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    fontSize, highContrast, dyslexicFont, bionicReading, reducedMotion, focusMode,
    updateSettings 
  } = useAccessibility();
  const router = useRouter();

  // Onboarding wizard step: 1 = Accessibility, 2 = Profile, 3 = Account
  const [step, setStep] = useState(1);
  
  // Registration Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto generated IDs for a11y label association
  const usernameId = useId();
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const passwordConfirmId = useId();

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/discussions');
    }
  }, [user, authLoading, router]);

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      // Step 1: Accessibility settings (always valid)
      setStep(2);
    } else if (step === 2) {
      // Step 2: Profile Validation
      if (!username.trim() || username.trim().length < 3) {
        setError('Kullanıcı adı en az 3 karakter olmalıdır.');
        return;
      }
      if (!fullName.trim() || fullName.trim().length < 3) {
        setError('Tam isminiz en az 3 karakter olmalıdır.');
        return;
      }
      // Clean username (alphanumeric and underscores)
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername !== username.trim().toLowerCase()) {
        setError('Kullanıcı adı yalnızca İngilizce harfler, rakamlar ve alt çizgi (_) içerebilir.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final Validations
    if (!email.trim()) {
      setError('E-posta adresi boş bırakılamaz.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Şifreler uyuşmuyor. Lütfen iki şifreyi de aynı giriniz.');
      return;
    }

    setLoading(true);
    try {
      // Save chosen settings as accessibility_prefs metadata too, so server sync handles it on profiles creation
      const accessibilityPrefs = {
        fontSize,
        highContrast,
        dyslexicFont,
        bionicReading,
        reducedMotion,
        focusMode
      };

      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            full_name: fullName.trim(),
            accessibility_prefs: accessibilityPrefs
          }
        }
      });

      if (signUpError) {
        if (signUpError.message?.includes('User already registered')) {
          throw new Error('Bu e-posta adresiyle zaten bir hesap açılmış. Lütfen giriş yapmayı deneyin.');
        }
        throw signUpError;
      }

      toast.success('Kayıt başarılı! E-posta adresinizi doğrulamak için bir mail gönderdik.', {
        duration: 8000
      });
      
      // Navigate to login
      router.push('/login');
    } catch (err: any) {
      console.error("Register Catch Error:", err);
      setError(err.message || 'Kayıt sırasında teknik bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Preview text paragraph generator based on current settings
  const previewText = useMemo(() => {
    if (bionicReading) {
      return (
        <p className="leading-relaxed">
          <strong className="font-extrabold text-foreground">Eng</strong>elsiz<strong className="font-extrabold text-foreground">For</strong>um, 
          her <strong className="font-extrabold text-foreground">biy</strong>ireyin <strong className="font-extrabold text-foreground">bilg</strong>iye 
          <strong className="font-extrabold text-foreground">eng</strong>elsiz <strong className="font-extrabold text-foreground">eri</strong>şebilmesini 
          <strong className="font-extrabold text-foreground">sav</strong>unur. <strong className="font-extrabold text-foreground">Şu</strong> an 
          <strong className="font-extrabold text-foreground">biy</strong>onik <strong className="font-extrabold text-foreground">oku</strong>ma 
          <strong className="font-extrabold text-foreground">mod</strong>u <strong className="font-extrabold text-foreground">akt</strong>if.
        </p>
      );
    }
    return (
      <p className="leading-relaxed">
        EngelsizForum, her bireyin bilgiye engelsiz erişebilmesini savunur. Şu an seçtiğiniz erişilebilirlik ayarlarının önizlemesini bu kart üzerinden görüyorsunuz.
      </p>
    );
  }, [bionicReading]);

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <main className="w-full max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="vibe-card p-8 sm:p-12 border-2 border-border shadow-2xl rounded-[2.5rem] bg-card relative overflow-hidden"
          >
            {/* Ambient Background Details */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -ml-12 -mb-12 -z-10" />

            {/* Steps Progress Indicator */}
            <div className="flex items-center justify-between mb-10 border-b border-border/60 pb-6">
              <StepIndicator num={1} label="Erişilebilirlik" active={step === 1} completed={step > 1} />
              <div className="flex-1 h-0.5 mx-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full bg-primary transition-all duration-300 ${step > 1 ? 'w-full' : 'w-0'}`} />
              </div>
              <StepIndicator num={2} label="Profil" active={step === 2} completed={step > 2} />
              <div className="flex-1 h-0.5 mx-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full bg-primary transition-all duration-300 ${step > 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <StepIndicator num={3} label="Hesap" active={step === 3} completed={false} />
            </div>

            {/* Live feedback for screen readers when step changes */}
            <div className="sr-only" role="status" aria-live="polite">
              Kayıt Sihirbazı: Adım {step} / 3 - {step === 1 ? 'Erişilebilirlik Tercihleri' : step === 2 ? 'Kişisel Profil Bilgileri' : 'Hesap Güvenlik Bilgileri'}
            </div>

            {/* Error Message */}
            {error && (
              <div 
                role="alert" 
                className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-destructive/10 text-destructive border-2 border-destructive/20 font-bold text-xs uppercase tracking-wide leading-relaxed"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Wizard Steps Switch */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Accessibility Onboarding Wizard */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <header className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                      <Sparkles size={10} className="fill-current" /> Adım 1: ERİŞİM SİHİRBAZI
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      Arayüzü Özelleştirin
                    </h2>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                      Sizin için en rahat okuma ve etkileşim ortamını oluşturun. Ayarlar anında uygulanır.
                    </p>
                  </header>

                  <div className="space-y-4">
                    
                    {/* Font Size Selector */}
                    <div className="vibe-card p-5 border border-border bg-muted/15">
                      <div className="flex items-center gap-2 mb-3">
                        <Type size={16} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Yazı Boyutu</h3>
                      </div>
                      <div className="grid grid-cols-4 gap-2 bg-background p-1 rounded-xl border border-border">
                        {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateSettings({ fontSize: sz })}
                            className={`py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all outline-none ${
                              fontSize === sz 
                                ? 'bg-primary text-white shadow-md' 
                                : 'hover:bg-muted text-muted-foreground'
                            }`}
                            aria-label={`Yazı Boyutu ${sz.toUpperCase()}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Dyslexic font toggle */}
                      <AccessibilityToggle
                        icon={<BookOpen size={16} />}
                        title="DİSLEKSİ FONTU"
                        checked={dyslexicFont}
                        onChange={(val) => updateSettings({ dyslexicFont: val })}
                      />

                      {/* High Contrast toggle */}
                      <AccessibilityToggle
                        icon={<Award size={16} />}
                        title="YÜKSEK KONTRAST"
                        checked={highContrast}
                        onChange={(val) => updateSettings({ highContrast: val })}
                      />

                      {/* Bionic reading toggle */}
                      <AccessibilityToggle
                        icon={<Compass size={16} />}
                        title="BİYONİK OKUMA"
                        checked={bionicReading}
                        onChange={(val) => updateSettings({ bionicReading: val })}
                      />

                      {/* Reduced motion toggle */}
                      <AccessibilityToggle
                        icon={<Sparkles size={16} />}
                        title="HAREKETLERİ KIS"
                        checked={reducedMotion}
                        onChange={(val) => updateSettings({ reducedMotion: val })}
                      />

                    </div>

                    {/* Instant Dynamic Preview Card */}
                    <div className="p-5 border-2 border-dashed border-primary/20 rounded-2xl bg-muted/5 mt-6">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 block mb-2">ANLIK ERİŞİLEBİLİRLİK ÖNİZLEMESİ</span>
                      <div className="text-sm text-foreground/90 font-medium">
                        {previewText}
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full vibe-button-primary h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-8"
                  >
                    DEVAM ET <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Profile Details */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <header className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                      <Sparkles size={10} className="fill-current" /> Adım 2: KİŞİSEL PROFİL
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      Kendinizi Tanıtın
                    </h2>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                      Platformda görünecek isminizi ve kullanıcı adınızı belirleyin.
                    </p>
                  </header>

                  <div className="space-y-5">
                    
                    {/* User name input */}
                    <div className="space-y-2">
                      <label htmlFor={usernameId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Kullanıcı Adı <span className="text-destructive" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                        <input
                          id={usernameId}
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="vibe-input pl-12 pr-4 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                          placeholder="ornek_kullanici"
                          autoComplete="username"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 block">
                        Yalnızca İngilizce harfler, rakamlar ve alt çizgi (_) kullanılabilir.
                      </span>
                    </div>

                    {/* Full Name input */}
                    <div className="space-y-2">
                      <label htmlFor={fullNameId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Adınız Soyadınız <span className="text-destructive" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                        <input
                          id={fullNameId}
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="vibe-input pl-12 pr-4 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                          placeholder="Ahmet Yılmaz"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 h-14 border-2 border-border hover:border-primary/30 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ChevronLeft size={14} className="stroke-[3]" /> GERİ
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-[2] vibe-button-primary h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      İLERLE <ChevronRight size={14} className="stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Credentials Details */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <header className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                      <Sparkles size={10} className="fill-current" /> Adım 3: HESAP BİLGİLERİ
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      Güvenliğinizi Sağlayın
                    </h2>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                      Giriş yaparken kullanacağınız e-posta adresi ve şifrenizi belirleyin.
                    </p>
                  </header>

                  <form onSubmit={handleRegister} className="space-y-5">
                    
                    {/* E-mail Input */}
                    <div className="space-y-2">
                      <label htmlFor={emailId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        E-posta Adresi <span className="text-destructive" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                        <input
                          id={emailId}
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="vibe-input pl-12 pr-4 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                          placeholder="ornek@adresiniz.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label htmlFor={passwordId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Şifre <span className="text-destructive" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                        <input
                          id={passwordId}
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="vibe-input pl-12 pr-12 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                          placeholder="En az 6 karakter"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded p-1"
                          aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Confirm Input */}
                    <div className="space-y-2">
                      <label htmlFor={passwordConfirmId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Şifre Tekrarı <span className="text-destructive" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                        <input
                          id={passwordConfirmId}
                          type={showPassword ? "text" : "password"}
                          required
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className="vibe-input pl-12 pr-4 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                          placeholder="Şifrenizi tekrar girin"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 h-14 border-2 border-border hover:border-primary/30 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <ChevronLeft size={14} className="stroke-[3]" /> GERİ
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] vibe-button-primary h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <UserPlus size={16} className="stroke-[3]" />
                        )}
                        {loading ? 'KAYDEDİLİYOR...' : 'KAYDI TAMAMLA'}
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Login Link Promoters */}
            <footer className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">
                Zaten bir hesabınız var mı?
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border hover:border-primary/25 text-muted-foreground hover:text-primary font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
              >
                <LogIn size={14} className="stroke-[3]" /> Giriş Yap
              </Link>
            </footer>

          </motion.div>
        </main>
      </div>
    </SiteLayout>
  );
}

/**
 * Clean accessibility-compliant Step Indicator component.
 */
function StepIndicator({ num, label, active, completed }: { num: number, label: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0 select-none">
      <div 
        className={`size-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
          completed 
            ? 'bg-primary text-white' 
            : active 
              ? 'bg-primary/20 text-primary border-2 border-primary shadow-sm' 
              : 'bg-muted text-muted-foreground border border-border/80'
        }`}
        aria-hidden="true"
      >
        {completed ? <Check size={14} className="stroke-[4]" /> : num}
      </div>
      <span 
        className={`hidden sm:inline text-[10px] font-black uppercase tracking-wider transition-colors ${
          active ? 'text-primary' : completed ? 'text-foreground' : 'text-muted-foreground/60'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Accessibility Toggle Component.
 */
interface ToggleProps {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function AccessibilityToggle({ icon, title, checked, onChange }: ToggleProps) {
  const toggleId = useMemo(() => `toggle-${title.replace(/\s+/g, '-').toLowerCase()}`, [title]);

  return (
    <div className="vibe-card p-4 border border-border bg-background flex items-center justify-between transition-all hover:border-primary/20">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-primary shrink-0">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground truncate">{title}</span>
      </div>

      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shrink-0 cursor-pointer ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
        aria-label={title}
      >
        <div 
          className={`size-4.5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
            checked ? 'translate-x-4.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
