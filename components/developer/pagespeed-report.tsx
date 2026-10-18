'use client';

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export function PageSpeedReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPageSpeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pagespeed');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch PageSpeed data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
      <button 
        onClick={fetchPageSpeed}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        <Zap size={16} /> {loading ? 'Analiz ediliyor...' : 'PageSpeed Analizi Yap'}
      </button>
      
      {data && data.lighthouseResult && (
        <div className="mt-2 text-xs text-slate-600">
          <p>LCP: {data.lighthouseResult.audits['largest-contentful-paint']?.displayValue}</p>
          <p>TBT: {data.lighthouseResult.audits['total-blocking-time']?.displayValue}</p>
        </div>
      )}
    </div>
  );
}
