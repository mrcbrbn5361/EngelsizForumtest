'use client';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { 
  User, Mail, Shield, Settings, ChevronRight, LogIn, Loader2, Save, X,
  Award, Sparkles, Zap, Check, Eye, Type, Volume2, HelpCircle,
  BookOpen, MessageSquare, Flame, Star, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAccessibility } from '@/components/providers/accessibility-provider';

interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: React.ReactNode;
  color: string;
  unlockedAtXp: number;
}

export default function ProfilePage() {
  const { user, profile: globalProfile } = useAuth();
  const { 
    fontSize, highContrast, dyslexicFont, reducedMotion, bionicReading, focusMode,
    updateSettings, resetSettings 
  } = useAccessibility();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<{ 
    username: string, 
    full_name: string | null, 
    avatar_url: string | null, 
    role: string, 
    level: number, 
    xp: number 
  } | null>(null);
  const [editMode, setEditMode] = useState(false);

  const initialLoadDone = React.useRef(false);

  useEffect(() => {
    if (globalProfile && !initialLoadDone.current) {
      setProfile({
        username: globalProfile.username,
        full_name: globalProfile.full_name,
        avatar_url: globalProfile.avatar_url,
        role: globalProfile.role,
        level: globalProfile.level || 1,
        xp: globalProfile.xp || 0
      });
      setLoading(false);
      initialLoadDone.current = true;
    } else if (!globalProfile && initialLoadDone.current === false) {
      // Set default empty profile values if not loaded from the database yet
      setProfile({
        username: user?.email?.split('@')[0] || 'engelsiz_uye',
        full_name: 'Engelsiz Kullanıcı',
        avatar_url: null,
        role: 'user',
        level: 1,
        xp: 0
      });
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [globalProfile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setEditMode(false);
      toast.success('Profil başarıyla güncellendi!');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Hata: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const userXp = profile?.xp || 0;
  const userLevel = profile?.level || 1;
  const xpInCurrentLevel = userXp % 200;
  const xpNeededForNextLevel = 200;
  const xpProgressPercentage = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // Visual Badges Setup
  const badgesList = useMemo<Badge[]>(() => [
    {
      id: 'welcome',
      name: 'İlk Adım',
      description: 'EngelsizForum topluluğuna katıldınız.',
      requirement: 'Hesap oluşturun',
      icon: <Sparkles className="size-6" />,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      unlockedAtXp: 0
    },
    {
      id: 'active_member',
      name: 'Aktif Katılımcı',
      description: 'Topluluk tartışmalarına katılarak fikirlerinizi paylaştınız.',
      requirement: '100 XP Barajı',
      icon: <Flame className="size-6" />,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      unlockedAtXp: 100
    },
    {
      id: 'a11y_champion',
      name: 'Erişilebilirlik Elçisi',
      description: 'Disleksi font, biyonik okuma ve yüksek kontrast özellikleri kullandınız.',
      requirement: '300 XP Barajı',
      icon: <Award className="size-6" />,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      unlockedAtXp: 300
    },
    {
      id: 'inclusive_leader',
      name: 'Kapsayıcı Lider',
      description: 'Sistemdeki diğer kullanıcılara çözüm sunup en iyi cevap işaretlendiniz.',
      requirement: '500 XP Barajı',
      icon: <Star className="size-6" />,
      color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
      unlockedAtXp: 500
    }
  ], []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="w-full py-6 sm:py-8 md:py-12 min-w-0">
        <h1 className="sr-only">Profilim ve Hesap Yönetimi</h1>

        {/* Outer Grid Wrapper */}
        <div className="flex flex-col xl:flex-row gap-6 w-full min-w-0">
          
          {/* LEFT PANEL: General Profile & Accessibility settings */}
          <div className="space-y-6 sm:space-y-8 min-w-0 w-full overflow-hidden flex-1">
            
            {/* Visual Header Banner Card */}
            <header className="vibe-card p-0 relative overflow-hidden shadow-2xl border-2 border-border rounded-[2.5rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
              <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
                
                {/* Avatar area */}
                <div className="size-24 sm:size-32 rounded-[2rem] bg-primary/10 flex items-center justify-center border-4 border-primary/20 shrink-0 relative overflow-hidden shadow-xl">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'Profile'} 
                      className="object-cover w-full h-full" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="size-12 text-primary" />
                  )}
                </div>

                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl">
                      {profile?.role.toUpperCase() || 'ÜYE'}
                    </span>
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1">
                      <Zap size={10} className="fill-current" /> SEVİYE {userLevel}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground truncate max-w-full">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </h2>
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                    @{profile?.username || user.email?.split('@')[0]}
                  </p>
                </div>

                {/* Edit Button */}
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="vibe-badge border border-primary/20 text-primary hover:bg-primary/5 transition-all flex items-center gap-2 h-11 px-6 font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer self-center"
                  aria-expanded={editMode}
                  aria-controls="profile-form-container"
                >
                  {editMode ? <><X size={14} className="stroke-[3]" /> İPTAL</> : <><Settings size={14} className="stroke-[3]" /> DÜZENLE</>}
                </button>
              </div>
            </header>

            {/* Profile Edit form container */}
            <div id="profile-form-container">
              <AnimatePresence mode="wait">
                {editMode && (
                  <motion.section 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="vibe-card p-6 sm:p-10 border-2 border-primary/30 shadow-xl"
                  >
                    <h3 className="text-xl font-black uppercase tracking-widest text-foreground mb-8 flex items-center gap-3">
                      <Settings className="text-primary" /> Profili Düzenle
                    </h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="vibe-label" htmlFor="avatarUrl">Profil Resmi (URL)</label>
                          <input 
                            id="avatarUrl"
                            type="url"
                            className="vibe-input text-xs font-black uppercase tracking-widest h-14"
                            value={profile?.avatar_url || ''}
                            onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, avatar_url: v} : null); }}
                            placeholder="https://images.com/example.jpg"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="vibe-label" htmlFor="usernameInput">Kullanıcı Adı</label>
                          <input 
                            id="usernameInput"
                            type="text"
                            className="vibe-input text-xs font-black uppercase tracking-widest h-14"
                            value={profile?.username || ''}
                            onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, username: v} : null); }}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="vibe-label" htmlFor="fullNameInput">Tam İsim</label>
                        <input 
                          id="fullNameInput"
                          type="text"
                          className="vibe-input text-xs font-black uppercase tracking-widest h-14"
                          value={profile?.full_name || ''}
                          onChange={(e) => { const v = e.target.value; setProfile(prev => prev ? {...prev, full_name: v} : null); }}
                          required
                        />
                      </div>

                      <button 
                        disabled={updating}
                        type="submit"
                        className="vibe-button-primary w-full h-14 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                      >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="stroke-[3]" />}
                        {updating ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                      </button>
                    </form>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Info Details List */}
            {!editMode && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Profil Bilgileri">
                <ProfileItem icon={<Mail size={20} />} label="E-posta" value={user.email || ''} />
                <ProfileItem icon={<User size={20} />} label="Tam İsim" value={profile?.full_name || 'Tanımlanmamış'} />
                <ProfileItem icon={<Settings size={20} />} label="Kullanıcı Adı" value={`@${profile?.username || user.email?.split('@')[0]}`} />
                <ProfileItem 
                  icon={<Shield size={20} />} 
                  label="Üyelik Statüsü" 
                  value={(profile?.role || 'user').toUpperCase()} 
                  badge={profile?.role === 'admin' || profile?.role === 'moderator' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                />
              </section>
            )}

            {/* Premium Accessibility Panel */}
            <section className="vibe-card p-6 sm:p-10 border-2 border-border" aria-label="Erişilebilirlik Panelim">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                    <Eye className="text-primary" /> ERİŞİLEBİLİRLİK SİSTEMİ
                  </h3>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mt-2">
                    Kişisel engelsiz arayüz tercihlerinizi yönetin. Bulut yedeklemesi otomatiktir.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (confirm('Tüm erişilebilirlik ayarlarınız sıfırlanacak. Emin misiniz?')) {
                      resetSettings();
                      toast.success('Ayarlar başarıyla varsayılana döndürüldü.');
                    }
                  }}
                  className="px-4 h-10 border-2 border-border hover:border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all shrink-0"
                >
                  Varsayılana Dön
                </button>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Font Size control */}
                <div className="vibe-card p-5 border border-border bg-muted/20 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-1 flex items-center gap-2">
                      <Type size={16} className="text-primary" /> YAZI BOYUTU
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                      Platform genelindeki başlık ve metin okuma boyutunu ölçeklendirin.
                    </p>
                  </div>
                  
                  {/* Segmented control for font size */}
                  <div className="grid grid-cols-4 gap-1.5 mt-6 bg-background p-1 rounded-xl border border-border">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => updateSettings({ fontSize: sz })}
                        className={`py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all outline-none ${
                          fontSize === sz 
                            ? 'bg-primary text-white shadow-md' 
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                        aria-label={`Yazı boyutu ${sz.toUpperCase()}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast */}
                <AccessibilityToggleCard
                  icon={<Eye className="size-5" />}
                  title="YÜKSEK KONTRAST"
                  description="Görsel ögeleri belirginleştirir, renk zıtlığını maksimuma taşır."
                  checked={highContrast}
                  onChange={(checked) => updateSettings({ highContrast: checked })}
                />

                {/* Dyslexic Font */}
                <AccessibilityToggleCard
                  icon={<BookOpen className="size-5" />}
                  title="DİSLEKSİ DOSTU FONT"
                  description="Harflerin ağırlık merkezini aşağıya kaydırarak okumayı kolaylaştırır."
                  checked={dyslexicFont}
                  onChange={(checked) => updateSettings({ dyslexicFont: checked })}
                />

                {/* Bionic Reading */}
                <AccessibilityToggleCard
                  icon={<Compass className="size-5" />}
                  title="BİYONİK OKUMA"
                  description="Kelimelerin ilk harflerini kalınlaştırarak göz takip hızını artırır."
                  checked={bionicReading}
                  onChange={(checked) => updateSettings({ bionicReading: checked })}
                />

                {/* Reduced Motion */}
                <AccessibilityToggleCard
                  icon={<Sparkles className="size-5" />}
                  title="KISIŞTIRILMIŞ HAREKET"
                  description="Geçiş efektlerini ve görsel animasyon sarsıntılarını durdurur."
                  checked={reducedMotion}
                  onChange={(checked) => updateSettings({ reducedMotion: checked })}
                />

                {/* Focus Mode */}
                <AccessibilityToggleCard
                  icon={<Settings className="size-5" />}
                  title="ODAKLANMA MODU"
                  description="Kenar panellerini ve dikkat dağıtıcı bileşenleri gizleyerek içeriğe odaklanmanızı sağlar."
                  checked={focusMode}
                  onChange={(checked) => updateSettings({ focusMode: checked })}
                />

              </div>
            </section>

          </div>

          {/* RIGHT PANEL: Gamification (XP, Levels, Badges) */}
          <aside className="w-full xl:w-[320px] shrink-0 space-y-8">
            
            {/* XP progress circle / card */}
            <section className="vibe-card p-4 sm:p-6 border-2 border-border text-center relative overflow-hidden w-full max-w-full" aria-label="XP Durumu">
              <h3 className="vibe-label ml-0 mb-6">SEVİYE VE TECRÜBE</h3>
              
              <div className="relative size-36 mx-auto mb-6 flex items-center justify-center">
                
                {/* SVG Progress Circle */}
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-muted" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-primary transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * xpProgressPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="text-center z-10">
                  <span className="text-4xl font-black text-foreground">{userLevel}</span>
                  <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">SEVİYE</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>{xpNeededForNextLevel} XP</span>
                </div>
                
                {/* Progress Bar background */}
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${xpProgressPercentage}%` }} 
                  />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest pt-2">
                  Sonraki seviyeye {xpNeededForNextLevel - xpInCurrentLevel} XP kaldı!
                </p>
              </div>
            </section>

            {/* Badges Bento Card */}
            <section className="vibe-card p-4 sm:p-6 border-2 border-border w-full max-w-full" aria-label="Rozetlerim">
              <h3 className="vibe-label ml-0 mb-6 flex items-center gap-3">
                <Award size={20} className="text-primary" /> KAZANILAN ROZETLER
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {badgesList.map((badge) => {
                  const isUnlocked = userXp >= badge.unlockedAtXp;
                  return (
                    <div 
                      key={badge.id}
                      className={`p-4 border rounded-2xl flex gap-4 transition-all ${
                        isUnlocked 
                          ? 'bg-card border-border shadow-sm' 
                          : 'bg-muted/10 border-border/40 opacity-40 select-none'
                      }`}
                    >
                      <div className={`p-3 border rounded-xl flex items-center justify-center shrink-0 self-start ${
                        isUnlocked ? badge.color : 'bg-muted text-muted-foreground/40 border-muted'
                      }`}>
                        {badge.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm text-foreground uppercase tracking-wider">{badge.name}</h4>
                          {isUnlocked ? (
                            <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              <Check size={8} className="mr-0.5 stroke-[4]" /> AÇIK
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground/60 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              KİLİTLİ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide leading-relaxed mt-1">
                          {badge.description}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-wider text-primary mt-2">
                          {badge.requirement}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="vibe-card p-4 sm:p-6 border-2 border-border w-full max-w-full" aria-label="Geçmiş Aktiviteler">
              <h3 className="vibe-label ml-0 mb-6 flex items-center gap-3">
                <MessageSquare size={18} className="text-primary" /> AKTİVİTE GEÇMİŞİ
              </h3>
              <div className="space-y-4">
                <ActivityRow 
                  icon={<MessageSquare size={14} />} 
                  title="Mevzuat konusunda bir başlık açtı" 
                  date="2 gün önce" 
                />
                <ActivityRow 
                  icon={<Check size={14} />} 
                  title="Disleksi font ayarını aktif etti" 
                  date="3 gün önce" 
                />
                <ActivityRow 
                  icon={<User size={14} />} 
                  title="Profil resmini güncelledi" 
                  date="4 gün önce" 
                />
              </div>
            </section>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-destructive/5 text-destructive border-2 border-destructive/10 rounded-2xl font-black text-xs hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3 group active:scale-95 uppercase tracking-[0.2em]"
            >
              <LogIn className="rotate-180 group-hover:-translate-x-1.5 transition-transform" size={18} aria-hidden="true" /> OTURUMU KAPAT
            </button>

          </aside>

        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileItem({ icon, label, value, badge }: { icon: React.ReactNode, label: string, value: string, badge?: string }) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-card rounded-2xl border border-border transition-all group/item hover:border-primary/20 shadow-sm min-w-0 w-full">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="p-3 bg-muted rounded-xl text-primary shrink-0 group-hover/item:scale-105 transition-transform">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="vibe-label mb-0 whitespace-nowrap truncate">{label}</p>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full mt-1">
            <p className="font-black text-sm sm:text-base tracking-tight truncate text-foreground flex-1 min-w-0" title={value}>{value}</p>
            {badge && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${badge}`}>
                {value === 'admin' || value === 'moderator' ? value : 'AKTİF'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function AccessibilityToggleCard({ icon, title, description, checked, onChange }: ToggleProps) {
  const switchId = useMemo(() => `toggle-${title.replace(/\s+/g, '-').toLowerCase()}`, [title]);
  
  return (
    <div className="vibe-card p-5 border border-border bg-muted/20 flex flex-col justify-between transition-all hover:border-primary/20">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            {title}
          </h4>
          
          {/* Switch input */}
          <button
            id={switchId}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 outline-none focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
              checked ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label={title}
          >
            <div 
              className={`size-4 bg-white rounded-full transition-transform duration-300 shadow-md ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-relaxed mt-2">
          {description}
        </p>
      </div>
    </div>
  );
}

function ActivityRow({ icon, title, date }: { icon: React.ReactNode; title: string; date: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
      <div className="p-2 bg-muted rounded-lg text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-foreground font-bold uppercase tracking-wide leading-normal truncate">{title}</p>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1 block">{date}</span>
      </div>
    </div>
  );
}

