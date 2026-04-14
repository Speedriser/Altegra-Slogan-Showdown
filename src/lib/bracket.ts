import type { Bracket, Matchup } from '../types';

function shuffle<T>(input: T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPow2(n: number): number {
  if (n <= 1) return 1;
  return 2 ** Math.ceil(Math.log2(n));
}

export function generateBracket(submissionIds: string[]): Bracket {
  const ids = shuffle(submissionIds);
  const n = ids.length;
  if (n < 2) {
    // Degenerate: single submission wins by default.
    return {
      rounds: [
        [
          {
            matchupId: 'r0-m0',
            slogan1Id: ids[0] ?? null,
            slogan2Id: null,
            winnerId: ids[0] ?? null,
          },
        ],
      ],
    };
  }

  const size = nextPow2(n);
  const byes = size - n;
  const round1: Matchup[] = [];

  // Seeds 0..byes-1 get an auto-advance.
  for (let i = 0; i < byes; i++) {
    round1.push({
      matchupId: `r0-m${i}`,
      slogan1Id: ids[i],
      slogan2Id: null,
      winnerId: ids[i],
    });
  }

  const rest = ids.slice(byes);
  for (let i = 0; i < rest.length; i += 2) {
    round1.push({
      matchupId: `r0-m${byes + i / 2}`,
      slogan1Id: rest[i],
      slogan2Id: rest[i + 1],
      winnerId: null,
    });
  }

  const rounds: Matchup[][] = [round1];
  let prev = round1.length;
  while (prev > 1) {
    prev /= 2;
    const r = rounds.length;
    const empty: Matchup[] = [];
    for (let j = 0; j < prev; j++) {
      empty.push({
        matchupId: `r${r}-m${j}`,
        slogan1Id: null,
        slogan2Id: null,
        winnerId: null,
      });
    }
    rounds.push(empty);
  }

  // Propagate bye winners from round 0 into round 1.
  if (rounds.length > 1) {
    for (let i = 0; i < round1.length; i++) {
      const mu = round1[i];
      if (mu.winnerId) {
        const nextIdx = Math.floor(i / 2);
        if (i % 2 === 0) {
          rounds[1][nextIdx].slogan1Id = mu.winnerId;
        } else {
          rounds[1][nextIdx].slogan2Id = mu.winnerId;
        }
      }
    }
  }

  return { rounds };
}

/**
 * Find the next playable matchup (both slots filled, no winner yet).
 * Returns null if every matchup is decided.
 */
export function findNextPlayable(
  bracket: Bracket
): { roundIdx: number; matchupIdx: number } | null {
  for (let r = 0; r < bracket.rounds.length; r++) {
    const round = bracket.rounds[r];
    for (let m = 0; m < round.length; m++) {
      const mu = round[m];
      if (mu.slogan1Id && mu.slogan2Id && !mu.winnerId) {
        return { roundIdx: r, matchupIdx: m };
      }
    }
  }
  return null;
}

/**
 * Compute the multi-path RTDB update to (a) set the winner on the given
 * matchup and (b) propagate that winner into the correct slot in the next
 * round. Returns an object with paths relative to `rooms/{code}`.
 */
export function buildAdvanceUpdate(
  bracket: Bracket,
  roundIdx: number,
  matchupIdx: number,
  winnerId: string
): { updates: Record<string, unknown>; isFinal: boolean } {
  const updates: Record<string, unknown> = {};
  updates[`bracket/rounds/${roundIdx}/${matchupIdx}/winnerId`] = winnerId;

  const nextRoundIdx = roundIdx + 1;
  const isFinal = nextRoundIdx >= bracket.rounds.length;
  if (!isFinal) {
    const nextMatchupIdx = Math.floor(matchupIdx / 2);
    const slot = matchupIdx % 2 === 0 ? 'slogan1Id' : 'slogan2Id';
    updates[`bracket/rounds/${nextRoundIdx}/${nextMatchupIdx}/${slot}`] =
      winnerId;
  }

  return { updates, isFinal };
}

export function tallyVotes(
  votes: Record<string, string> | undefined,
  slogan1Id: string,
  slogan2Id: string
): { s1: number; s2: number; total: number } {
  let s1 = 0;
  let s2 = 0;
  if (votes) {
    for (const v of Object.values(votes)) {
      if (v === slogan1Id) s1++;
      else if (v === slogan2Id) s2++;
    }
  }
  return { s1, s2, total: s1 + s2 };
}

/**
 * Given a tally, pick the winner. Ties go to slogan1 (random-but-deterministic
 * since the bracket was already shuffled).
 */
export function pickWinner(
  s1Count: number,
  s2Count: number,
  slogan1Id: string,
  slogan2Id: string
): string {
  if (s2Count > s1Count) return slogan2Id;
  return slogan1Id;
}

/**
 * Has the overall tournament concluded? True when the final round's
 * single matchup has a winner, OR any bye-only bracket resolves.
 */
export function getOverallWinner(bracket: Bracket): string | null {
  const last = bracket.rounds[bracket.rounds.length - 1];
  if (!last || last.length !== 1) return null;
  return last[0].winnerId ?? null;
}
