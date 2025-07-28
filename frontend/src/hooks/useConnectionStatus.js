// React hook for connection status
// File: frontend/src/hooks/useConnectionStatus.js

import { useState, useEffect } from 'react';

const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

export const useConnectionStatus = () => {
  const [connected, setConnected] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        setConnected(response.ok);
        setLastCheck(new Date());
      } catch {
        setConnected(false);
        setLastCheck(new Date());
      }
    };

    // Initial check
    checkConnection();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, CONNECTION_CHECK_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return { connected, lastCheck };
};

export default useConnectionStatus;
