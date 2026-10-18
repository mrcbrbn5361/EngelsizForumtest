'use client';
import dynamic from 'next/dynamic';

const VisitorTracker = dynamic(() => import('@/components/layout/visitor-tracker'), { ssr: false });

export default VisitorTracker;
