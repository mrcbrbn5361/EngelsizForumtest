'use client';

import React from 'react';
import { useAccessibility } from '@/components/providers/accessibility-provider';

interface BionicTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

/**
 * BionicText: Bilişsel odaklanmayı artıran okuma desteği.
 * JSX namespace hatasını önlemek için React.ElementType kullanıldı.
 */
export function BionicText({ text, className = '', as: Component = 'span' }: BionicTextProps) {
  const { bionicReading } = useAccessibility();

  if (!bionicReading) {
    return <Component className={className}>{text}</Component>;
  }

  const processText = (input: string) => {
    return input.split(' ').map((word, idx) => {
      if (word.length <= 1) return <span key={idx}>{word} </span>;
      
      const mid = Math.ceil(word.length * 0.4); // İlk %40'ı kalınlaştır
      const start = word.slice(0, mid);
      const end = word.slice(mid);
      
      return (
        <span key={idx} className="inline-block mr-1">
          <strong className="font-extrabold">{start}</strong>
          {end}
        </span>
      );
    });
  };

  return <Component className={className}>{processText(text)}</Component>;
}
