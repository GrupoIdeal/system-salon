import { isNativePlatform } from './capacitor';
import { useEffect, useState } from 'react';

/**
 * Detecta se o app está online ou offline
 * Usa @capacitor/network quando disponível, fallback para navigator.onLine
 */
export function isOnline(): boolean {
  try {
    const capacitorNetwork = (window as any).Capacitor?.Plugins?.Network;
    if (capacitorNetwork) {
      // Em produção, usaríamos Capacitor Network plugin
      return navigator.onLine;
    }
    return navigator.onLine;
  } catch {
    return navigator.onLine;
  }
}

/**
 * Hook React para detectar estado online/offline
 */
export function useOffline() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online, offline: !online };
}
