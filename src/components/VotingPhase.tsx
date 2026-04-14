import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Room } from '../types';
import { castVote, concludeMatchup } from '../lib/rtdb';
import { pickWinner, tallyVotes } from '../lib/bracket';
import { PullQuote } from './PullQuote';

interface Props {
  code: string;
  room: Room;
  uid: string;
}

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

  const concludingRef = useRef(false);
  const [concluding, setConcluding] = useState(false);

  if (!matchup || !current || !s1 || !s2) {
    return (
      <div className="max-w-3xl mx-auto pt-10 text-center text-navy/60">
        Loading matchup…
      </div>
    );
  }

  const s1Id = matchup.slogan1Id!;
  const s2Id = matchup.slogan2Id!;
  const pctS1 =
    tally.total === 0 ? 50 : Math.round((tally.s1 / tally.total) * 100);
  const pctS2 = 100 - pctS1;

  const vote = (sloganId: string) => {
    if (myVote || matchup.winnerId) return;
    castVote(code, matchup.matchupId, uid, sloganId);
  };

  const handleClose = async () => {
    if (!bracket || !current || concludingRef.current) return;
    if (tally.total === 0) {
      const ok = window.confirm(
        'No votes have been cast yet. Close voting anyway? The left slogan will win by default.'
      );
      if (!ok) return;
    }
    concludingRef.current = true;
    setConcluding(true);
    const winner = pickWinner(tally.s1, tally.s2, s1Id, s2Id);
    try {
      await concludeMatchup(
        code,
        bracket,
        current.roundIdx,
        current.matchupIdx,
        winner
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to conclude matchup', err);
      concludingRef.current = false;
      setConcluding(false);
    }
  };

  return (
    <motion.div
      key={matchup.matchupId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pt-2 pb-28"
    >
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium">
            Voting · Round {current.roundIdx + 1}, Match{' '}
            {current.matchupIdx + 1}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-navy leading-tight tracking-tightest mt-1">
            Which one sings?
          </h2>
        </div>
        <VoteCounter voted={tally.total} total={playerCount} />
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        <PullQuote
          text={s1.text}
          variant="left"
          selected={myVote === s1Id}
          disabled={!!myVote}
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
          disabled={!!myVote}
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
          ? 'Vote cast — results update live. Waiting for the host to close voting.'
          : 'Take your time. Tap a card to cast your vote.'}
      </div>

      {isHost && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-paper via-paper/95 to-paper/0 pt-10 pb-5 px-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="text-sm text-navy/70">
              <span className="font-serif italic text-navy text-lg">
                {tally.total}
              </span>
              <span className="text-navy/50"> of {playerCount} voted</span>
              {everyoneVoted && (
                <span className="ml-2 text-accent font-medium">
                  · everyone's in ✓
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={concluding}
              className="btn-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {concluding ? 'Closing…' : 'Close voting →'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function VoteCounter({ voted, total }: { voted: number; total: number }) {
  return (
    <div className="text-right shrink-0">
      <p className="text-[10px] uppercase tracking-[0.24em] text-navy/40">
        Votes in
      </p>
      <p className="font-serif text-3xl sm:text-4xl text-navy tabular-nums leading-none mt-1">
        <motion.span
          key={voted}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-accent"
        >
          {voted}
        </motion.span>
        <span className="text-navy/30"> / {total}</span>
      </p>
    </div>
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
