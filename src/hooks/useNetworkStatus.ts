/**
 * useNetworkStatus hook — tracks network connectivity.
 */
import { useEffect, useState } from 'react';
import { networkMonitor } from '../services/mobile';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    networkMonitor.start();
    const unsubscribe = networkMonitor.onChange(setIsConnected);

    return () => {
      unsubscribe();
      networkMonitor.stop();
    };
  }, []);

  return isConnected;
}
