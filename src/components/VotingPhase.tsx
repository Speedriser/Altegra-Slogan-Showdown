import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Room } from '../types';
import { castVote, concludeMatchup } from '../lib/rtdb';
import { pickWinner, tallyVotes } from '../lib/bracket';
import { useCountdown } from '../hooks/useCountdown';
import { PullQuote } from './PullQuote';

interface Props {
  code: string;
  room: Room;
  uid: string;
}

const VOTE_DURATION_MS = 20_000;

export function VotingPhase({ code, room, uid }: Props) {
  const isHost = room.hostId === uid;
  const bracket = room.bracket;
  const current = room.currentMatchup;
  const submissions = room.submissions ?? {};
  const players = room.players ?? {};

  const matchup = useMemo(() => {
    if (!bracket || !current) return null;
    return bracket.rounds[current.roundIdx]?.[current.matchupIdx] ?? null;
  }, [bracket, current]);

  const matchupVotes =
    matchup && room.votes ? room.votes[matchup.matchupId] : undefined;
  const myVote = matchupVotes?.[uid];

  const startedAt = current?.startedAt ?? null;
  const deadline = startedAt ? startedAt + VOTE_DURATION_MS : null;
  const remaining = useCountdown(deadline);

  const s1 =
    matchup?.slogan1Id ? submissions[matchup.slogan1Id] : undefined;
  const s2 =
    matchup?.slogan2Id ? submissions[matchup.slogan2Id] : undefined;

  const tally = useMemo(() => {
    if (!matchup?.slogan1Id || !matchup?.slogan2Id) {
      return { s1: 0, s2: 0, total: 0 };
    }
    return tallyVotes(matchupVotes, matchup.slogan1Id, matchup.slogan2Id);
  }, [matchup, matchupVotes]);

  const playerCount = Object.keys(players).length;
  const everyoneVoted = tally.total >= playerCount && playerCount > 0;
  const timeUp = remaining !== null && remaining <= 0;

  const concludedRef = useRef(false);
  useEffect(() => {
    // Reset guard whenever the current matchup changes.
    concludedRef.current = false;
  }, [matchup?.matchupId]);

  // Host-only: conclude the matchup when everyone has voted or time is up.
  useEffect(() => {
    if (!isHost || !bracket || !matchup || !current) return;
    if (matchup.winnerId) return;
    if (concludedRef.current) return;
    if (!matchup.slogan1Id || !matchup.slogan2Id) return;
    if (!(everyoneVoted || timeUp)) return;

    concludedRef.current = true;
    const winner = pickWinner(
      tally.s1,
      tally.s2,
      matchup.slogan1Id,
      matchup.slogan2Id
    );
    concludeMatchup(
      code,
      bracket,
      current.roundIdx,
      current.matchupIdx,
      winner
    ).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to conclude matchup', err);
      concludedRef.current = false;
    });
  }, [
    isHost,
    bracket,
    matchup,
    current,
    everyoneVoted,
    timeUp,
    tally.s1,
    tally.s2,
    code,
  ]);

  if (!matchup || !current || !s1 || !s2) {
    return (
      <div className="max-w-3xl mx-auto pt-10 text-center text-navy/60">
        Loading matchup…
      </div>
    );
  }

  const seconds = remaining == null ? 20 : Math.ceil(remaining / 1000);
  const s1Id = matchup.slogan1Id!;
  const s2Id = matchup.slogan2Id!;
  const pctS1 =
    tally.total === 0 ? 50 : Math.round((tally.s1 / tally.total) * 100);
  const pctS2 = 100 - pctS1;

  const vote = (sloganId: string) => {
    if (myVote || timeUp || matchup.winnerId) return;
    castVote(code, matchup.matchupId, uid, sloganId);
  };

  return (
    <motion.div
      key={matchup.matchupId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pt-2"
    >
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium">
            Voting · Round {current.roundIdx + 1}, Match{' '}
            {current.matchupIdx + 1}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-navy leading-tight">
            Which one sings?
          </h2>
        </div>
        <TimerBadge seconds={seconds} />
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        <PullQuote
          text={s1.text}
          variant="left"
          selected={myVote === s1Id}
          disabled={!!myVote || timeUp}
          onClick={() => vote(s1Id)}
          footer={
            <VoteBar
              pct={pctS1}
              count={tally.s1}
              total={tally.total}
              side="left"
            />
          }
        />
        <div className="flex md:flex-col items-center justify-center text-navy/30 font-serif text-2xl italic">
          vs.
        </div>
        <PullQuote
          text={s2.text}
          variant="right"
          selected={myVote === s2Id}
          disabled={!!myVote || timeUp}
          onClick={() => vote(s2Id)}
          footer={
            <VoteBar
              pct={pctS2}
              count={tally.s2}
              total={tally.total}
              side="right"
            />
          }
        />
      </div>

      <div className="mt-6 text-center text-sm text-navy/60">
        {myVote
          ? 'Vote cast. Results update live.'
          : timeUp
            ? 'Time’s up — tallying…'
            : 'Tap a card to cast your vote.'}{' '}
        <span className="text-navy/40">
          · {tally.total} of {playerCount} voted
        </span>
      </div>
    </motion.div>
  );
}

function TimerBadge({ seconds }: { seconds: number }) {
  const warn = seconds <= 5;
  return (
    <motion.div
      key={seconds}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className={`font-serif text-4xl sm:text-5xl tabular-nums ${
        warn ? 'text-accent' : 'text-navy'
      }`}
    >
      {String(seconds).padStart(2, '0')}
      <span className="text-xs tracking-[0.2em] uppercase text-navy/40 ml-2">
        sec
      </span>
    </motion.div>
  );
}

function VoteBar({
  pct,
  count,
  total,
  side,
}: {
  pct: number;
  count: number;
  total: number;
  side: 'left' | 'right';
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-navy/60 mb-1">
        <span>
          {count} vote{count === 1 ? '' : 's'}
        </span>
        <span>{total === 0 ? '—' : `${pct}%`}</span>
      </div>
      <div className="h-2 bg-navy/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            side === 'left' ? 'bg-accent' : 'bg-navy'
          } rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
