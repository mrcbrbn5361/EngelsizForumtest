'use client';

import { useEffect, useRef } from 'react';

export function VisitorTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Generate or retrieve a unique visitor session ID
    let visitorId = localStorage.getItem('visitor_session_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('visitor_session_id', visitorId);
    }
    
    const trackVisitor = async () => {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId })
        });
        
        if (!response.ok) {
          console.error('Visitor tracking failed with status:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
        }
      } catch (err) {
        console.error('Failed to track visitor (network error):', err);
      }
    };

    // Track on initial load
    if (!trackedRef.current) {
      trackVisitor();
      trackedRef.current = true;
    }
    
    // Ping every 1 minute to keep "active" status alive
    const interval = setInterval(trackVisitor, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
