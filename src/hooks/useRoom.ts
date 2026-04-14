import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../firebase';
import type { Room } from '../types';

export interface RoomState {
  room: Room | null;
  loading: boolean;
  missing: boolean;
}

export function useRoom(code: string | null): RoomState {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(!!code);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!code) {
      setRoom(null);
      setLoading(false);
      setMissing(false);
      return;
    }
    setLoading(true);
    setMissing(false);
    const roomRef = ref(db, `rooms/${code}`);
    const unsub = onValue(
      roomRef,
      (snap) => {
        const val = snap.val() as Room | null;
        if (!val) {
          setRoom(null);
          setMissing(true);
        } else {
          setRoom(val);
          setMissing(false);
        }
        setLoading(false);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Room subscription error', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [code]);

  return { room, loading, missing };
}
