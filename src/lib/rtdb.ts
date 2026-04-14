import {
  get,
  onDisconnect,
  push,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { db } from '../firebase';
import { generateRoomCode } from './code';
import {
  buildAdvanceUpdate,
  findNextPlayable,
  generateBracket,
  getOverallWinner,
} from './bracket';
import type { Bracket, Phase, Room } from '../types';

/**
 * Create a new room owned by `uid`. Retries on collision.
 */
export async function createRoom(
  uid: string,
  name: string,
  avatar: string
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const roomRef = ref(db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (snap.exists()) continue;

    await set(roomRef, {
      phase: 'lobby' as Phase,
      hostId: uid,
      createdAt: serverTimestamp(),
      players: {
        [uid]: {
          name,
          avatar,
          joinedAt: serverTimestamp(),
          online: true,
        },
      },
    });

    // Clean up online flag on disconnect (not the player itself — we want
    // them to remain on the roster so they can reconnect).
    try {
      onDisconnect(ref(db, `rooms/${code}/players/${uid}/online`)).set(false);
    } catch {
      /* ignore */
    }

    return code;
  }
  throw new Error('Could not allocate a room code — please try again');
}

export async function joinRoom(
  code: string,
  uid: string,
  name: string,
  avatar: string
): Promise<void> {
  const playerRef = ref(db, `rooms/${code}/players/${uid}`);
  await set(playerRef, {
    name,
    avatar,
    joinedAt: serverTimestamp(),
    online: true,
  });
  try {
    onDisconnect(ref(db, `rooms/${code}/players/${uid}/online`)).set(false);
  } catch {
    /* ignore */
  }
}

export async function roomExists(code: string): Promise<boolean> {
  const snap = await get(ref(db, `rooms/${code}`));
  return snap.exists();
}

export async function setPhase(code: string, phase: Phase): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase });
}

export async function submitSlogan(
  code: string,
  uid: string,
  text: string
): Promise<string> {
  const listRef = ref(db, `rooms/${code}/submissions`);
  const newRef = push(listRef);
  await set(newRef, {
    text: text.trim(),
    authorId: uid,
    submittedAt: serverTimestamp(),
  });
  return newRef.key as string;
}

export async function removeSubmission(
  code: string,
  submissionId: string
): Promise<void> {
  await set(ref(db, `rooms/${code}/submissions/${submissionId}`), null);
}

/**
 * Host action: close submissions, shuffle, generate bracket, go to preview.
 */
export async function startBracket(
  code: string,
  submissionIds: string[]
): Promise<void> {
  const bracket = generateBracket(submissionIds);
  await update(ref(db, `rooms/${code}`), {
    phase: 'bracket' as Phase,
    bracket,
    votes: null,
    currentMatchup: null,
  });
}

/**
 * Host action: begin voting on the next playable matchup.
 * Called both for the initial transition bracket→voting and to advance to
 * the next matchup after one concludes.
 */
export async function nextMatchup(code: string, bracket: Bracket): Promise<void> {
  const next = findNextPlayable(bracket);
  if (!next) {
    // Tournament done
    await update(ref(db, `rooms/${code}`), {
      phase: 'done' as Phase,
      currentMatchup: null,
    });
    return;
  }
  await update(ref(db, `rooms/${code}`), {
    phase: 'voting' as Phase,
    currentMatchup: {
      roundIdx: next.roundIdx,
      matchupIdx: next.matchupIdx,
    },
  });
}

export async function castVote(
  code: string,
  matchupId: string,
  uid: string,
  sloganId: string
): Promise<void> {
  await set(ref(db, `rooms/${code}/votes/${matchupId}/${uid}`), sloganId);
}

/**
 * Host action: finalize a matchup with the given winner and advance bracket.
 * Atomically updates the current matchup's winner, propagates to next round,
 * and — if this was the final — flips phase to `done`.
 */
export async function concludeMatchup(
  code: string,
  bracket: Bracket,
  roundIdx: number,
  matchupIdx: number,
  winnerId: string
): Promise<void> {
  const { updates, isFinal } = buildAdvanceUpdate(
    bracket,
    roundIdx,
    matchupIdx,
    winnerId
  );

  // If this was the final, also update phase.
  if (isFinal) {
    updates['phase'] = 'done' as Phase;
    updates['currentMatchup'] = null;
  } else {
    // Go back to bracket-preview so the host can pace with "Next matchup".
    updates['phase'] = 'bracket' as Phase;
    updates['currentMatchup'] = null;
  }

  await update(ref(db, `rooms/${code}`), updates);
}

export function isTournamentOver(room: Room): boolean {
  if (!room.bracket) return false;
  return !!getOverallWinner(room.bracket);
}
