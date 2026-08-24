'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { VoiceInput } from '@/components/accessibility/voice-input';
import { Image as ImageIcon, Send, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostComposerProps {
  topicId: string;
  onSuccess?: () => void;
  placeholder?: string;
}

interface ImageMetadata {
  url: string;
  alt: string;
}

/**
 * Production-ready Post Composer with AAA Accessibility.
 * Enforces image alt text for screen readers.
 */
export function PostComposer({ topicId, onSuccess, placeholder = 'Topluluğa bir yanıt yazın...' }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Mesaj yazmak için giriş yapmalısınız.');
      return;
    }

    if (!content.trim() && images.length === 0) {
      toast.error('Lütfen bir mesaj yazın veya görsel ekleyin.');
      return;
    }

    // Check if all images have alt text
    const missingAlt = images.some(img => !img.alt.trim());
    if (missingAlt) {
      toast.error('Erişilebilirlik için tüm görsellere açıklama (ALT metni) eklemelisiniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalContent = content.trim();
      for (const img of images) {
        finalContent += `\n\n![${img.alt}](${img.url})`;
      }

      const { error: commentErr } = await supabase
        .from('comments')
        .insert({
          topic_id: topicId,
          author_id: user.id,
          content: finalContent,
        });

      if (commentErr) throw commentErr;

      setContent('');
      setImages([]);
      toast.success('Yanıtınız başarıyla gönderildi.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Post submission error:', error);
      toast.error(`Mesaj gönderilemedi: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('forum-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('forum-assets')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, { url: publicUrl, alt: '' }]);
      toast.info('Görsel yüklendi. Lütfen bir açıklama ekleyin.');
    } catch (error: any) {
      toast.error(`Görsel yüklenemedi: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const updateAltText = (index: number, alt: string) => {
    setImages(prev => {
      const next = [...prev];
      next[index].alt = alt;
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="vibe-card p-4 sm:p-6 border-primary/10 shadow-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="post-content" className="vibe-label">
          Yanıtınız
        </label>
        <VoiceInput 
          onTranscript={(text) => setContent(prev => prev + (prev ? ' ' : '') + text)} 
          label="Sesle Yanıtla"
        />
      </div>

      <textarea
        id="post-content"
        className="vibe-input !h-32 pt-4 resize-none"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        aria-required="true"
        aria-invalid={!content.trim() && images.length === 0}
      />

      {/* Image Previews & Alt Text Enforcer */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative p-3 bg-muted rounded-2xl border border-border group">
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-error text-white p-1 rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Görseli kaldır"
              >
                <X size={14} />
              </button>
              <div className="aspect-video rounded-xl overflow-hidden bg-black/5 mb-3 relative">
                <img src={img.url} alt="Yüklenen görsel önizlemesi" className="object-cover w-full h-full" />
              </div>
              <div className="space-y-1">
                <label htmlFor={`alt-${idx}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                  <AlertCircle size={10} /> Görsel Açıklaması (Gereklidir)
                </label>
                <input
                  id={`alt-${idx}`}
                  type="text"
                  className="w-full bg-background border-2 border-border/50 rounded-lg px-3 py-1.5 text-xs font-semibold focus:border-primary outline-none transition-all"
                  placeholder="Örn: Mavi gökyüzü altında koşan bir çocuk"
                  value={img.alt}
                  onChange={(e) => updateAltText(idx, e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
            disabled={isUploading || isSubmitting}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="vibe-button-primary !bg-muted !text-foreground !px-4 hover:!bg-muted/80 !shadow-none !scale-100 flex gap-2"
            disabled={isUploading || isSubmitting}
            aria-label="Görsel Ekle"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-primary" />}
            <span className="hidden sm:inline">Görsel</span>
          </button>
        </div>

        <button
          type="submit"
          className="vibe-button-primary flex gap-2"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Yanıtla</span>
        </button>
      </div>

      <div className="sr-only" aria-live="polite">
        {isSubmitting ? 'Yanıtınız gönderiliyor...' : ''}
        {isUploading ? 'Görsel yükleniyor...' : ''}
      </div>
    </form>
  );
}
