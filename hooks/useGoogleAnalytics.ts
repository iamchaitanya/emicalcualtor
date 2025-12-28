
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Custom hook to track page views in GA4 for React SPAs.
 * Specifically handles the HashRouter navigation style.
 */
export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const GA_ID = (process.env as any).GA_TRACKING_ID;
    
    if (window.gtag && GA_ID && GA_ID !== "") {
      // Manual page view event
      window.gtag('config', GA_ID, {
        page_path: location.pathname + location.search + location.hash,
        page_location: window.location.href,
      });
      
      console.debug(`[GA4] Tracked view: ${location.pathname}`);
    }
  }, [location]);
};
