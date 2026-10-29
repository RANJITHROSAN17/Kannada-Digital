import { useEffect, useState } from 'react';

/**
 * Live network status from the browser. The app is offline-first, but live
 * translation and the voice bridge need the network — when the connection
 * drops mid-demo, the shell shows an honest banner instead of letting the
 * learner wonder why the bridge stopped answering.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return online;
}
