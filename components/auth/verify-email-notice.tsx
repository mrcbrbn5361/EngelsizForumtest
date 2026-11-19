'use client';

import React, { useEffect, useState } from 'react';
import { MailCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatAuthError } from '@/lib/auth-utils';

/** Supabase allows one confirmation email per address per minute. */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Tells the visitor to confirm their email address and lets them request a new confirmation email.
 * Shown after sign-up and when someone tries to log in before confirming.
 */
export function VerifyEmailNotice({ email, startWithCooldown = true }: { email: string; startWithCooldown?: boolean }) {
  const [cooldown, setCooldown] = useState(startWithCooldown ? RESEND_COOLDOWN_SECONDS : 0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/discussions` },
      });
      if (error) throw error;
      setStatus({ type: 'success', text: 'Yeni doğrulama e-postası gönderildi.' });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setStatus({ type: 'error', text: formatAuthError(err, 'E-posta gönderilemedi. Lütfen biraz sonra tekrar deneyin.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="verify-email-title" className="space-y-4 text-sm text-fg-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-emerald-500/15 text-emerald-400 light:text-emerald-700 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <MailCheck size={20} aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 id="verify-email-title" className="text-base font-bold text-fg font-heading">E-posta adresini doğrula</h2>
          <p>
            <strong className="text-fg break-all">{email}</strong> adresine bir doğrulama bağlantısı gönderdik.
            Hesabını etkinleştirmek için e-postadaki <strong className="text-fg">Hesabı Doğrula</strong> butonuna tıkla.
          </p>
        </div>
      </div>
      <ul className="list-disc pl-5 space-y-1 text-xs text-fg-4">
        <li>E-posta birkaç dakika içinde gelmezse <strong>gereksiz / spam</strong> klasörüne bak.</li>
        <li>Bağlantıyı telefonda ya da başka bir cihazda açabilirsin.</li>
      </ul>
      {status && (
        <p role={status.type === 'error' ? 'alert' : 'status'} className={`text-xs font-bold ${status.type === 'error' ? 'text-rose-400 light:text-rose-700' : 'text-emerald-400 light:text-emerald-700'}`}>
          {status.text}
        </p>
      )}
      <button
        type="button"
        onClick={resend}
        disabled={busy || cooldown > 0}
        className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-md border border-line bg-surface-hover hover:bg-surface-active text-fg text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {busy && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {cooldown > 0 ? `Tekrar göndermek için ${cooldown} sn bekle` : 'Doğrulama e-postasını tekrar gönder'}
      </button>
    </section>
  );
}
