import { motion } from 'framer-motion';

interface Props {
  onHost: () => void;
  onJoin: () => void;
  prefilledCode?: string | null;
}

export function Landing({ onHost, onJoin, prefilledCode }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-3xl mx-auto pt-10 sm:pt-20"
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-medium mb-5">
        Issue No. 01 — Tagline Edition
      </p>
      <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tightest leading-[0.95] text-navy">
        Find the one
        <br />
        that <em className="text-accent">sings</em>.
      </h1>
      <p className="mt-8 max-w-xl text-lg text-navy/70 leading-relaxed">
        A live bracket tournament for Altegra slogans. Everyone submits a
        couple. We vote, round by round, until one remains.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onHost} className="btn-primary text-base">
          Host a game
        </button>
        <button type="button" onClick={onJoin} className="btn-ghost text-base">
          {prefilledCode ? `Join room ${prefilledCode}` : 'Join a game'}
        </button>
      </div>
      <div className="mt-16 ornament" />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-navy/40">
        Anonymous submissions · Live bracket · 15-minute format
      </p>
    </motion.div>
  );
}
