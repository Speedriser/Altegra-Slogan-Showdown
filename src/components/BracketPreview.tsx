import { motion } from 'framer-motion';
import type { Room } from '../types';
import { BracketView } from './BracketView';
import { findNextPlayable } from '../lib/bracket';
import { nextMatchup } from '../lib/rtdb';

interface Props {
  code: string;
  room: Room;
  uid: string;
}

/**
 * Shown between matchups (phase === 'bracket'). The host advances to the
 * next matchup; non-hosts see the current bracket state and wait.
 */
export function BracketPreview({ code, room, uid }: Props) {
  const isHost = room.hostId === uid;
  const bracket = room.bracket;
  const submissions = room.submissions ?? {};

  if (!bracket) return null;

  const next = findNextPlayable(bracket);
  const done = !next;

  const handleNext = async () => {
    await nextMatchup(code, bracket);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pt-4"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium mb-3">
        Bracket · Round of {bracket.rounds[0].length * 2}
      </p>
      <h2 className="font-serif text-4xl sm:text-5xl text-navy leading-[1] tracking-tightest">
        {done ? 'Ready for the final.' : 'Draw is set.'}
      </h2>
      <p className="mt-4 text-navy/60 max-w-xl">
        {done
          ? 'All slots filled. The host begins the championship matchup.'
          : 'Host advances to each matchup when the room is ready.'}
      </p>

      <div className="mt-8">
        <BracketView bracket={bracket} submissions={submissions} />
      </div>

      {isHost && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-paper via-paper/95 to-paper/0 pt-10 pb-5 px-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm text-navy/60">Host controls</p>
            <button
              type="button"
              onClick={handleNext}
              className="btn-accent"
            >
              {done ? 'Reveal winner →' : 'Begin next matchup →'}
            </button>
          </div>
        </div>
      )}
      {!isHost && (
        <p className="mt-10 text-center text-sm text-navy/50">
          Waiting for the host to advance…
        </p>
      )}
    </motion.div>
  );
}
