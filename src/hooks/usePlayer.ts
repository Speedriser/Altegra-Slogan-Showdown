import { useEffect, useState } from 'react';
import { ensureAuth } from '../firebase';
import { loadSession, type LocalSession } from '../lib/storage';

export interface PlayerState {
  uid: string | null;
  loading: boolean;
  session: LocalSession | null;
}

/**
 * Resolves the local player's auth uid and any stored session (room code,
 * display name) from a previous visit. The session is *hinted* reconnect
 * data — components decide whether to actually rejoin the room.
 */
export function usePlayer(): PlayerState {
  const [uid, setUid] = useState<string | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stored = loadSession();
    if (stored) setSession(stored);

    ensureAuth()
      .then((user) => {
        if (!cancelled) setUid(user.uid);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Anonymous auth failed', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { uid, loading, session };
}
