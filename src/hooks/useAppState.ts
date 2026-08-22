/**
 * useAppState hook — tracks foreground/background state.
 */
import { useEffect, useState } from 'react';
import { appStateManager } from '../services/mobile';

export function useAppState() {
  const [state, setState] = useState<'active' | 'background'>('active');

  useEffect(() => {
    appStateManager.start();
    const unsubscribe = appStateManager.onChange(setState);

    return () => {
      unsubscribe();
      appStateManager.stop();
    };
  }, []);

  return state;
}
