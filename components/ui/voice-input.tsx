'use client';

import React from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  label?: string;
}

export function VoiceInput({ onTranscript, label = 'Sesle Yaz' }: VoiceInputProps) {
  // STT has been disabled as requested by the user
  return null;
}
