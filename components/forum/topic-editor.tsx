'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Edit3, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { BionicMarkdown } from '@/components/ui/bionic-markdown';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
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
        
        // Use local data URL if Supabase was skipped or failed
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
          toast.success('Görsel yüklendi (AI betimlemesi başarısız).');
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
      className="w-full border border-border rounded-xl md:rounded-2xl bg-card overflow-hidden transition-all shadow-sm focus-within:shadow-md relative"
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
            className="absolute inset-0 bg-primary/10 border-4 border-dashed border-primary/40 z-50 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none"
          >
            <div className="bg-background/95 border border-primary/20 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 text-center max-w-sm mx-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                <ImageIcon size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-primary">Görseli Bırakın</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mt-2 leading-relaxed">
                  Yapay zeka ile otomatik erişilebilir alt-metin açıklaması üretilecektir.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-2 md:px-4 md:py-2 border-b bg-muted/40 gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-muted/60 rounded-lg md:rounded-xl p-1 gap-1 flex-1 sm:flex-none">
            <button 
              type="button" 
              onClick={() => setIsPreview(false)} 
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                !isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Düzenleme Modu"
              aria-pressed={!isPreview}
            >
              <Edit3 size={14} /> Düzenle
            </button>
            <button 
              type="button" 
              onClick={() => setIsPreview(true)} 
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Önizleme Modu"
              aria-pressed={isPreview}
            >
              <Eye size={14} /> Önizle
            </button>
          </div>

          {!isPreview && (
            <label className="cursor-pointer size-10 md:size-12 rounded-lg md:rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 relative">
              {isUploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <ImageIcon size={18} />}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={isUploading} 
                aria-label="Görsel Yükle (Erişilebilirlik için otomatik açıklama üretilir)"
              />
            </label>
          )}
        </div>
        <div className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
          Sürükle-Bırak Görsel ve Markdown Desteklenir
        </div>
      </div>
      
      {!isPreview && (
        <div className="px-4 py-2 bg-muted/20 border-b border-border/50">
          <VoiceInput onTranscript={handleVoiceTranscript} label="Konuyu Sesle Yaz" />
        </div>
      )}

      <div className="p-0 min-h-[250px] md:min-h-[350px] relative">
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
                placeholder={placeholder || 'Buraya yazın... (Görselleri doğrudan buraya sürükleyip bırakabilirsiniz)'}
                className="w-full min-h-[250px] md:min-h-[350px] p-4 md:p-6 outline-none bg-transparent resize-y font-medium leading-relaxed text-sm md:text-base"
                aria-label="Tartışma İçeriği"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-4 md:p-6 bg-muted/5"
            >
              <div className="markdown-body prose prose-sm md:prose-base prose-slate max-w-none dark:prose-invert break-words overflow-hidden min-h-[250px] md:min-h-[350px]">
                {value ? (
                  <BionicMarkdown content={value} />
                ) : (
                  <p className="text-muted-foreground italic">Henüz bir şey yazmadınız. Önizleme boş.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
