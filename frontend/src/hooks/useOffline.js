import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);
      
      // Clear the "was offline" flag after a delay
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, wasOffline };
};
