'use client';

import React, { useId, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { KeyRound, Loader2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatAuthError, PASSWORD_MIN_LENGTH, validatePasswordStrength } from '@/lib/auth-utils';

type Status = { type: 'success' | 'error'; text: string } | null;

/**
 * True when the account can sign in with an email + password (as opposed to Google only).
 */
function hasPasswordLogin(user: User): boolean {
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider];
  return providers.includes('email') || Boolean(user.identities?.some((i) => i.provider === 'email'));
}

/**
 * One line of the live password checklist.
 */
function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? 'text-emerald-400 light:text-emerald-700' : 'text-fg-4'}`}>
      {ok ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
      <span>{children}</span>
      <span className="sr-only">{ok ? '(sağlandı)' : '(henüz sağlanmadı)'}</span>
    </li>
  );
}

/**
 * Profile card for changing the password (re-checks the current password first) or,
 * for Google-only accounts, emailing a link to set one.
 */
export function ChangePasswordCard({ user }: { user: User }) {
  const ids = { current: useId(), next: useId(), confirm: useId(), rules: useId() };
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const { hasLength, hasNumberOrSpecial, isValid } = validatePasswordStrength(next);
  const isMatching = next.length > 0 && next === confirm;
  const passwordLogin = hasPasswordLogin(user);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!current) return setStatus({ type: 'error', text: 'Lütfen mevcut şifrenizi girin.' });
    if (!isValid) return setStatus({ type: 'error', text: validatePasswordStrength(next).errors.join(' ') });
    if (!isMatching) return setStatus({ type: 'error', text: 'Yeni şifreler birbiriyle eşleşmiyor.' });
    if (next === current) return setStatus({ type: 'error', text: 'Yeni şifre mevcut şifrenizle aynı olamaz.' });

    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email!, password: current });
      if (verifyError) {
        setStatus({ type: 'error', text: 'Mevcut şifreniz doğru değil.' });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      await supabase.auth.signOut({ scope: 'others' });
      setCurrent('');
      setNext('');
      setConfirm('');
      setStatus({ type: 'success', text: 'Şifreniz değiştirildi. Diğer cihazlardaki oturumlarınız kapatıldı.' });
    } catch (err) {
      setStatus({ type: 'error', text: formatAuthError(err, 'Şifre değiştirilemedi. Lütfen tekrar deneyin.') });
    } finally {
      setBusy(false);
    }
  };

  const handleSendSetupLink = async () => {
    setStatus(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setStatus({ type: 'success', text: `Şifre belirleme bağlantısı ${user.email} adresine gönderildi.` });
    } catch (err) {
      setStatus({ type: 'error', text: formatAuthError(err, 'Bağlantı gönderilemedi. Lütfen biraz sonra tekrar deneyin.') });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full h-11 px-3.5 text-sm bg-surface-hover border border-line rounded-md text-fg focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700';

  return (
    <section aria-labelledby={`${ids.current}-title`} className="bg-surface-raised border border-line rounded-md p-6 sm:p-8 shadow-xs space-y-6">
      <h2 id={`${ids.current}-title`} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 light:text-indigo-700 border-b border-line pb-4">
        <KeyRound size={16} aria-hidden="true" />
        Şifre Değiştir
      </h2>

      {status && (
        <div
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-3 p-4 rounded-md text-xs font-bold border ${
            status.type === 'error'
              ? 'bg-rose-500/10 text-rose-400 light:text-rose-700 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 light:text-emerald-700 border-emerald-500/20'
          }`}
        >
          {status.type === 'error' ? <AlertCircle size={16} className="shrink-0" aria-hidden="true" /> : <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />}
          <span>{status.text}</span>
        </div>
      )}

      {passwordLogin ? (
        <form onSubmit={handleChange} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor={ids.current} className="text-xs font-bold text-fg-3">Mevcut şifre</label>
            <input id={ids.current} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor={ids.next} className="text-xs font-bold text-fg-3">Yeni şifre</label>
              <input id={ids.next} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} aria-describedby={ids.rules} required />
            </div>
            <div className="space-y-2">
              <label htmlFor={ids.confirm} className="text-xs font-bold text-fg-3">Yeni şifre (tekrar)</label>
              <input id={ids.confirm} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} aria-invalid={confirm.length > 0 && !isMatching} required />
            </div>
          </div>
          <ul id={ids.rules} className="space-y-1.5 text-xs">
            <Rule ok={hasLength}>En az {PASSWORD_MIN_LENGTH} karakter</Rule>
            <Rule ok={hasNumberOrSpecial}>En az bir rakam veya özel karakter</Rule>
            <Rule ok={isMatching}>İki şifre aynı</Rule>
          </ul>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
          >
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {busy ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-sm text-fg-3">
          <p>Hesabınıza Google ile giriş yapıyorsunuz, bu yüzden değiştirilecek bir şifreniz yok. İsterseniz e-posta ile de giriş yapabilmek için bir şifre belirleyebilirsiniz.</p>
          <button
            type="button"
            onClick={handleSendSetupLink}
            disabled={busy}
            className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
          >
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            Şifre belirleme bağlantısı gönder
          </button>
        </div>
      )}
    </section>
  );
}
