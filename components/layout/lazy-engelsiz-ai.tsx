'use client';
import dynamic from 'next/dynamic';

const EngelsizAI = dynamic(() => import('@/components/layout/engelsiz-ai').then(mod => mod.EngelsizAI), { ssr: false });

export default EngelsizAI;
