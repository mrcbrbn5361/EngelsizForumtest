'use client';

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      // Small delay to prioritize LCP and critical rendering
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get or create a persistent device ID for this browser
      let deviceId = null;
      try {
        deviceId = localStorage.getItem('visitor_device_id');
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem('visitor_device_id', deviceId);
        }
      } catch (e) {
        console.warn('Visitor tracking storage access failed', e);
        deviceId = 'anonymous'; // Fallback if storage is blocked
      }

      try {
        await fetch('/api/visitor-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer engelsizforumteknofesttanitim'
          },
          body: JSON.stringify({ device_id: deviceId }),
        });
      } catch (error) {
        // Silently fail to not interrupt user experience
      }
    };

    trackVisitor();
    // Refresh activity every 4 minutes (before the 5-minute timeout)
    const interval = setInterval(trackVisitor, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
