'use client';
import dynamic from 'next/dynamic';

const AccessibilityInspector = dynamic(() => import('@/components/accessibility/accessibility-inspector').then(mod => mod.AccessibilityInspector), { ssr: false });

export default AccessibilityInspector;
