'use client';

import React from 'react';

interface BionicTextProps {
  text: string;
  className?: string;
  enabled?: boolean;
}

/**
 * Bionic Reading component (Bionic Reading™ style)
 * Highlights the first half of words to improve fixation and reading speed.
 * WCAG 2.2 AAA support for Cognitive / Neurodivergent users.
 */
export function BionicText({ text, className = '', enabled = true }: BionicTextProps) {
  if (!enabled) return <span className={className}>{text}</span>;

  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIdx) => {
        if (!word) return null;
        
        // Calculate fixation point (roughly first 40-60% of the word)
        const fixationLength = Math.ceil(word.length * 0.5);
        const boldPart = word.substring(0, fixationLength);
        const lightPart = word.substring(fixationLength);

        return (
          <span key={wordIdx} className="inline-block mr-[0.25em]">
            <strong className="font-black opacity-100">{boldPart}</strong>
            <span className="font-normal opacity-80">{lightPart}</span>
          </span>
        );
      })}
    </span>
  );
}
