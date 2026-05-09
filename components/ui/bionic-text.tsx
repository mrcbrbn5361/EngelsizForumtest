'use client';

import React from 'react';
import { useAccessibility } from '@/components/providers/accessibility-provider';

interface BionicTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * BionicText: Enhances reading for cognitive impairments/ADHD.
 * Boldens the fixation points (first 40-60% of each word).
 */
export function BionicText({ text, className = '', as: Component = 'span' }: BionicTextProps) {
  const { bionicReading } = useAccessibility();

  if (!bionicReading) {
    return <Component className={className}>{text}</Component>;
  }

  const processText = (input: string) => {
    return input.split(' ').map((word, idx) => {
      if (word.length <= 1) return <span key={idx}>{word} </span>;
      
      const mid = Math.ceil(word.length * 0.5);
      const start = word.slice(0, mid);
      const end = word.slice(mid);
      
      return (
        <span key={idx} className="inline-block mr-1">
          <strong className="font-black">{start}</strong>
          {end}
        </span>
      );
    });
  };

  return <Component className={className}>{processText(text)}</Component>;
}
