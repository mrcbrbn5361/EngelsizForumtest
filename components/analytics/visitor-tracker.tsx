'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

export function VisitorTracker() {
  const { user } = useAuth();
  const trackedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate or retrieve a unique visitor session ID
    let visitorId = localStorage.getItem('visitor_session_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('visitor_session_id', visitorId);
    }
    
    const trackVisitor = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            visitorId,
            userId: user?.id || null
          })
        });
      } catch (err) {
        console.error('Failed to track visitor:', err);
      }
    };

    // Track on initial load
    if (!trackedRef.current) {
      trackVisitor();
      trackedRef.current = true;
      lastUserIdRef.current = user?.id || null;
    } else if (user?.id !== lastUserIdRef.current) {
      // If user logs in or changes, track immediately
      trackVisitor();
      lastUserIdRef.current = user?.id || null;
    }
    
    // Ping every 2 minutes to keep "active" status alive (reduced frequency for performance)
    const interval = setInterval(trackVisitor, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  return null;
}
