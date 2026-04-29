'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopicEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TopicEditor({ value, onChange, placeholder }: TopicEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="w-full border border-border rounded-2xl bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex bg-muted rounded-lg p-1">
          <button type="button" onClick={() => setIsPreview(false)} className={`px-3 py-1 rounded-md text-xs font-bold ${!isPreview ? 'bg-card shadow-sm' : ''}`}>Düzenle</button>
          <button type="button" onClick={() => setIsPreview(true)} className={`px-3 py-1 rounded-md text-xs font-bold ${isPreview ? 'bg-card shadow-sm' : ''}`}>Önizle</button>
        </div>
      </div>
      <div className="p-6 min-h-[300px]">
        {!isPreview ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'İçerik...'}
            className="w-full h-full min-h-[250px] outline-none bg-transparent"
          />
        ) : (
          <div className="prose">
            {value ? value.split('\n').map((l, i) => <p key={i}>{l}</p>) : 'Önizleme boş.'}
          </div>
        )}
      </div>
    </div>
  );
}
