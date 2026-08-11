'use client';

import dynamic from 'next/dynamic';

const BionicPreview = dynamic(() => import('./bionic-preview').then(m => m.BionicPreview), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-muted rounded-[32px] my-16" />
});

export function BionicPreviewWrapper() {
  return <BionicPreview />;
}
