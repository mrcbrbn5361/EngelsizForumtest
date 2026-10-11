import React from 'react';
import type { Metadata } from 'next';
import { ForumIndex } from '@/components/forum/forum-index';
import HomeSeoKnowledgeBase from '@/components/forum/home-seo-knowledge-base';
import { SponsorSection } from '@/components/layout/sponsor-section';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Engelsiz Forum | Engelli Hakları, Balthazard, ÖTV & Topluluk Platformu',
  description: 'Türkiye\'nin ilk tam erişilebilir (WCAG AAA) engelli forum ve bilgi platformu. 2026 ÖTV muafiyeti, Balthazard formülü, SGK engelli erken emeklilik ve topluluk tartışmaları.',
  alternates: {
    canonical: 'https://engelsizforum.com',
  },
};

export default function HomePage() {
  return (
    <div className="w-full space-y-12">
      {/* 1. Official Sponsors Banner */}
      <SponsorSection />

      {/* 2. Forum Directory & Discussions */}
      <ForumIndex />

      {/* 3. Legislation & SEO Knowledge Base */}
      <HomeSeoKnowledgeBase />
    </div>
  );
}
