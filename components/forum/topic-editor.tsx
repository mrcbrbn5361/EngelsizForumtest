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
    <div className="w-full border border-border rounded-xl md:rounded-2xl bg-card overflow-hidden transition-all shadow-sm focus-within:shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-2 md:px-4 md:py-2 border-b bg-muted/40 gap-2">
        <div className="flex bg-muted/60 rounded-lg md:rounded-xl p-1 gap-1 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={() => setIsPreview(false)} 
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md md:rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              !isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 size={14} /> Düzenle
          </button>
          <button 
            type="button" 
            onClick={() => setIsPreview(true)} 
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md md:rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isPreview ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye size={14} /> Önizle
          </button>
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
          Markdown Desteklenir
        </div>
      </div>
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
                placeholder={placeholder || 'Buraya yazın... (Markdown kullanabilirsiniz)'}
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
