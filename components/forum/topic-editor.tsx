'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Eye, Edit3 } from 'lucide-react';

interface TopicEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TopicEditor({ value, onChange, placeholder }: TopicEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="w-full border border-border rounded-2xl bg-card overflow-hidden transition-all shadow-sm focus-within:shadow-md">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <div className="flex bg-muted/60 rounded-xl p-1 gap-1">
          <button 
            type="button" 
            onClick={() => setIsPreview(false)} 
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              !isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 size={14} /> Düzenle
          </button>
          <button 
            type="button" 
            onClick={() => setIsPreview(true)} 
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye size={14} /> Önizle
          </button>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
          Markdown Desteklenir
        </div>
      </div>
      <div className="p-0 min-h-[350px] relative">
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
                placeholder={placeholder || 'Buraya yazın... (Markdown kullanabilirsiniz)'}
                className="w-full min-h-[350px] p-6 outline-none bg-transparent resize-y font-medium leading-relaxed"
                aria-label="Tartışma İçeriği"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-6 bg-muted/5"
            >
              <div className="markdown-body prose prose-slate max-w-none dark:prose-invert">
                {value ? (
                  <ReactMarkdown>{value}</ReactMarkdown>
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
