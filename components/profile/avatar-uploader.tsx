'use client';

import React, { useId, useRef, useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { AVATAR_ACCEPTED_TYPES, AVATAR_BUCKET, avatarObjectPath, validateAvatarFile } from '@/lib/avatar';
import { processAvatarImage } from '@/lib/avatar-image';
import { updateAvatarAction } from '@/app/actions';

interface AvatarUploaderProps {
  userId: string;
  avatarUrl: string | null;
  name?: string | null;
  username?: string | null;
  onChanged: () => Promise<void> | void;
}

type Status = { type: 'progress' | 'success' | 'error'; text: string } | null;

/**
 * Lets the user upload, replace or remove their profile picture. The photo is cropped,
 * resized and stripped of metadata in the browser, then stored in the "avatars" bucket.
 */
export function AvatarUploader({ userId, avatarUrl, name, username, onChanged }: AvatarUploaderProps) {
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const busy = status?.type === 'progress';

  const save = async (url: string | null, success: string) => {
    const result = await updateAvatarAction(url);
    if (!result.success) throw new Error(result.error);
    await onChanged();
    setStatus({ type: 'success', text: success });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = validateAvatarFile(file);
    if (problem) return setStatus({ type: 'error', text: problem });

    try {
      setStatus({ type: 'progress', text: 'Fotoğraf hazırlanıyor...' });
      const { blob, extension } = await processAvatarImage(file);
      setStatus({ type: 'progress', text: 'Fotoğraf yükleniyor...' });
      const path = avatarObjectPath(userId, extension);
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, {
        contentType: blob.type,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw new Error('Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      await save(data.publicUrl, 'Profil resminiz güncellendi.');
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Fotoğraf yüklenemedi.' });
    }
  };

  const handleRemove = async () => {
    try {
      setStatus({ type: 'progress', text: 'Profil resmi kaldırılıyor...' });
      await save(null, 'Profil resminiz kaldırıldı.');
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Profil resmi kaldırılamadı.' });
    }
  };

  const buttonClass =
    'inline-flex items-center gap-2 min-h-[44px] px-4 rounded-md text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="sm:col-span-2 space-y-3">
      <span id={`${inputId}-label`} className="text-xs font-bold text-fg-3 block">Profil Resmi</span>
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar src={avatarUrl} name={name} username={username} size="2xl" />
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(',')}
            onChange={handleFile}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-describedby={`${inputId}-hint ${statusId}`}
            className={`${buttonClass} bg-indigo-600 hover:bg-indigo-500 text-white`}
          >
            {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Camera size={15} aria-hidden="true" />}
            {avatarUrl ? 'Fotoğrafı değiştir' : 'Fotoğraf yükle'}
          </button>
          {avatarUrl && (
            <button type="button" onClick={handleRemove} disabled={busy} className={`${buttonClass} border border-line bg-surface-hover hover:bg-surface-active text-fg`}>
              <Trash2 size={15} aria-hidden="true" />
              Kaldır
            </button>
          )}
        </div>
      </div>
      <p id={`${inputId}-hint`} className="text-[11px] text-fg-4">
        JPG, PNG veya WebP, en fazla 10 MB. Fotoğraf kare olarak kırpılır; konum gibi gizli bilgiler silinir.
        Resim yüklemezseniz adınızın baş harfleri gösterilir.
      </p>
      <p
        id={statusId}
        role={status?.type === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        className={`text-xs font-bold min-h-[1rem] ${
          status?.type === 'error' ? 'text-rose-400 light:text-rose-700' : status?.type === 'success' ? 'text-emerald-400 light:text-emerald-700' : 'text-fg-3'
        }`}
      >
        {status?.text}
      </p>
    </div>
  );
}
