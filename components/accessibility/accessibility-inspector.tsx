'use client';

import React, { useState, useEffect } from 'react';
import { Bug, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { PageSpeedReport } from '../developer/pagespeed-report';

export function AccessibilityInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  // Simple check for accessibility issues
  useEffect(() => {
    if (!isOpen) return;
    
    const foundIssues: { type: string, message: string, element: Element }[] = [];
    
    // Check for images without alt tags
    const imgs = document.querySelectorAll('img:not([alt])');
    imgs.forEach(img => foundIssues.push({ type: 'error', message: 'Resimde alt metni eksik', element: img }));
    
    // Check for empty buttons
    const buttons = document.querySelectorAll('button:empty');
    buttons.forEach(btn => foundIssues.push({ type: 'warning', message: 'Buton içeriği boş', element: btn }));

    setIssues(foundIssues);
  }, [isOpen]);

  if (process.env.NODE_ENV !== 'development' && typeof window !== 'undefined' && !new URLSearchParams(window.location.search).has('a11y-debug')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-900 text-white rounded-full shadow-lg"
      >
        <Bug size={24} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-white p-4 rounded-xl shadow-2xl border border-slate-200">
          <h3 className="font-bold mb-2">Geliştirici Araçları</h3>
          <PageSpeedReport />
          <h3 className="font-bold mb-2 mt-4">Erişilebilirlik Denetimi</h3>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600"><CheckCircle size={16}/> Sorun bulunamadı.</div>
          ) : (
            <ul className="space-y-2">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {issue.type === 'error' ? <AlertOctagon size={16} className="text-red-500"/> : <AlertTriangle size={16} className="text-amber-500"/>}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
