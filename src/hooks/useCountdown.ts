import { useEffect, useState } from 'react';

/**
 * Returns the remaining milliseconds from now until `deadline`. Re-renders
 * ~every 100ms while the timer is running, then stops firing after expiry.
 * Returns null when `deadline` is null.
 */
export function useCountdown(deadline: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline == null) return;
    // Re-sync immediately when the deadline changes.
    setNow(Date.now());
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (deadline == null) return null;
  return Math.max(0, deadline - now);
}
