import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Room } from '../types';
import { getOverallWinner } from '../lib/bracket';
import { BracketView } from './BracketView';
import { clearSession } from '../lib/storage';

interface Props {
  room: Room;
}

export function WinnerReveal({ room }: Props) {
  const [revealAuthor, setRevealAuthor] = useState(false);

  const winnerId = useMemo(
    () => (room.bracket ? getOverallWinner(room.bracket) : null),
    [room.bracket]
  );
  const winningSubmission = winnerId
    ? room.submissions?.[winnerId]
    : undefined;
  const authorId = winningSubmission?.authorId;
  const authorName = authorId ? room.players?.[authorId]?.name : undefined;

  useEffect(() => {
    if (!winningSubmission) return;
    const fire = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#E2835B', '#0B1B2B', '#F1A885', '#F8F5EE'],
      });
    };
    fire();
    const t1 = window.setTimeout(fire, 400);
    const t2 = window.setTimeout(fire, 900);
    const t3 = window.setTimeout(() => setRevealAuthor(true), 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [winningSubmission]);

  if (!winningSubmission) {
    return (
      <div className="max-w-3xl mx-auto pt-10 text-center text-navy/60">
        Tallying the final…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto pt-4"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium text-center">
        The winner
      </p>
      <h2 className="font-serif text-center text-3xl sm:text-5xl text-navy mt-1">
        Altegra's new tagline
      </h2>

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        className="card mt-10 px-6 sm:px-14 py-12 sm:py-16 text-center"
      >
        <p className="pullquote text-navy" style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)' }}>
          {winningSubmission.text}
        </p>
        <div className="ornament w-24 mx-auto mt-10 mb-5" />
        <AnimatePresence mode="wait">
          {revealAuthor ? (
            <motion.p
              key="author"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-navy/70 text-sm uppercase tracking-[0.2em]"
            >
              Written by{' '}
              <span className="text-accent font-medium">
                {authorName ?? 'Anonymous'}
              </span>
            </motion.p>
          ) : (
            <motion.p
              key="anon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="text-navy/40 text-sm uppercase tracking-[0.2em]"
            >
              Revealing author…
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {room.bracket && (
        <div className="mt-16">
          <p className="text-[11px] uppercase tracking-[0.24em] text-navy/50 mb-3">
            Tournament recap
          </p>
          <BracketView bracket={room.bracket} submissions={room.submissions ?? {}} />
        </div>
      )}

      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={() => {
            clearSession();
            window.location.search = '';
          }}
          className="btn-ghost text-sm"
        >
          Start a new game
        </button>
      </div>
    </motion.div>
  );
}
