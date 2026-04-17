import { motion } from 'framer-motion';
import { HowItWorks } from './HowItWorks';

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
        Altegra 2027 · Conference Destination Vote
      </p>
      <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tightest leading-[0.95] text-navy">
        Where should we
        <br />
        <em className="text-accent">land</em> in 2027?
      </h1>
      <p className="mt-8 max-w-xl text-lg text-navy/70 leading-relaxed">
        One team, one vote, one destination. Everyone pitches a city,
        we go head-to-head in a live bracket, and the winning spot
        becomes our 2027 conference home.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onHost} className="btn-primary text-base">
          Host a game
        </button>
        <button type="button" onClick={onJoin} className="btn-ghost text-base">
          {prefilledCode ? `Join room ${prefilledCode}` : 'Join a game'}
        </button>
      </div>

      <HowItWorks variant="full" />

      <div className="mt-16 ornament" />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-navy/40">
        Anonymous picks · Live bracket · The team decides
      </p>
    </motion.div>
  );
}
