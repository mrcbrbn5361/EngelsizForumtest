'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Edit3, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { BionicMarkdown } from '@/components/ui/bionic-markdown';

const VoiceInput = dynamic(
  () => import('@/components/ui/voice-input').then(mod => mod.VoiceInput),
  { ssr: false }
);

interface TopicEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TopicEditor({ value, onChange, placeholder }: TopicEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuth();

  const handleVoiceTranscript = (text: string) => {
    if (text) {
      onChange(value ? `${value} ${text}` : text);
    }
  };

  const processFileAndUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    setIsUploading(true);
    const useLocalFallback = !isSupabaseConfigured;

    try {
      let imageUrl = '';
      
      if (!useLocalFallback) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `${user?.id || 'anonymous'}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);
            
          imageUrl = publicUrl;
        } catch (supabaseErr: any) {
          console.warn('Supabase upload failed, falling back to local base64:', supabaseErr);
        }
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fullBase64 = reader.result as string;
        const base64Data = fullBase64.split(',')[1];
        
        const finalImgUrl = imageUrl || fullBase64;
        
        try {
          const res = await fetch('/api/generate-alt-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, mimeType: file.type }),
          });
          const data = await res.json();
          const altText = data.altText || 'Görsel betimlemesi';

          const markdownImage = `\n![${altText}](${finalImgUrl})\n`;
          onChange(value + markdownImage);
          toast.success(`Görsel başarıyla yüklendi.\nAI Alt-Metni: "${altText.substring(0, 60)}..."`);
        } catch (err) {
          console.error('Alt-text generation failed:', err);
          const markdownImage = `\n![Görsel](${finalImgUrl})\n`;
          onChange(value + markdownImage);
          toast.success('Görsel yüklendi.');
        } finally {
          setIsUploading(false);
        }
      };
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error('Yükleme hatası: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileAndUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPreview) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX >= rect.right ||
      clientY < rect.top ||
      clientY >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isPreview) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFileAndUpload(file);
    }
  };

  return (
    <div 
      className="w-full border border-white/[0.08] rounded-xl bg-slate-900/90 overflow-hidden transition-all shadow-sm focus-within:border-sky-500/40 relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-sky-950/80 border-2 border-dashed border-sky-400 z-50 flex flex-col items-center justify-center backdrop-blur-xs pointer-events-none"
          >
            <div className="bg-slate-900 border border-sky-500/30 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-sm mx-4">
              <div className="size-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                <ImageIcon size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Görseli Bırakın</h3>
              <p className="text-xs text-slate-400">
                Ekran okuyucu kullanıcıları için otomatik AI betimlemesi oluşturulacaktır.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-slate-950/60 gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-900 rounded-lg p-1 gap-1 flex-1 sm:flex-none border border-white/[0.06]">
            <button 
              type="button" 
              onClick={() => setIsPreview(false)} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isPreview ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Düzenleme Modu"
              aria-pressed={!isPreview}
            >
              <Edit3 size={13} /> Düzenle
            </button>
            <button 
              type="button" 
              onClick={() => setIsPreview(true)} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isPreview ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Önizleme Modu"
              aria-pressed={isPreview}
            >
              <Eye size={13} /> Önizle
            </button>
          </div>

          {!isPreview && (
            <label className="cursor-pointer size-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all border border-white/[0.06] hover:border-sky-500/30">
              {isUploading ? <Loader2 size={15} className="animate-spin text-sky-400" /> : <ImageIcon size={15} />}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={isUploading} 
                aria-label="Görsel Yükle (Erişilebilirlik için otomatik AI açıklama üretilir)"
              />
            </label>
          )}
        </div>
        <div className="text-[10px] text-slate-500 text-center font-normal">
          Sürükle-bırak görsel &amp; Markdown desteklenir
        </div>
      </div>
      
      {!isPreview && (
        <div className="px-3 py-1.5 bg-slate-950/40 border-b border-white/[0.06]">
          <VoiceInput onTranscript={handleVoiceTranscript} label="Konuyu Sesle Yaz" />
        </div>
      )}

      <div className="p-0 min-h-[220px] md:min-h-[280px] relative">
        <AnimatePresence mode="wait">
          {!isPreview ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Konu detaylarını buraya yazın... (Görselleri doğrudan buraya sürükleyip bırakabilirsiniz)'}
                className="w-full min-h-[220px] md:min-h-[280px] p-4 outline-none bg-transparent resize-y text-slate-200 text-xs sm:text-sm font-normal leading-relaxed placeholder:text-slate-500"
                aria-label="Tartışma İçeriği"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-4 bg-slate-950/20"
            >
              <div className="markdown-body prose prose-invert prose-sm max-w-none break-words overflow-hidden min-h-[220px] md:min-h-[280px] text-slate-200 text-xs sm:text-sm">
                {value ? (
                  <BionicMarkdown content={value} />
                ) : (
                  <p className="text-slate-500 italic text-xs">Henüz bir şey yazmadınız. Önizleme alanı boş.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
