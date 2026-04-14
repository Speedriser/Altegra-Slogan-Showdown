import { motion } from 'framer-motion';

interface Props {
  onHost: () => void;
  onJoin: () => void;
  prefilledCode?: string | null;
}

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Gather',
    body: 'One person hosts and gets a 4-letter code. Everyone else joins with the code and a name.',
  },
  {
    title: 'Submit',
    body: 'Each player writes 1–2 slogans — up to 80 characters, completely anonymous.',
  },
  {
    title: 'Vote',
    body: 'Slogans are shuffled into a single-elimination bracket. Head-to-head matchups, 20 seconds each.',
  },
  {
    title: 'Crown',
    body: 'The last slogan standing gets the spotlight — then we reveal who wrote it.',
  },
];

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
        Give Altegra
        <br />
        its <em className="text-accent">voice</em>.
      </h1>
      <p className="mt-8 max-w-xl text-lg text-navy/70 leading-relaxed">
        The tagline we crown today is the one we'll carry — on the site,
        the decks, the door. Everyone writes a couple, we vote round by
        round, and the sharpest line wins.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onHost} className="btn-primary text-base">
          Host a game
        </button>
        <button type="button" onClick={onJoin} className="btn-ghost text-base">
          {prefilledCode ? `Join room ${prefilledCode}` : 'Join a game'}
        </button>
      </div>

      <section className="mt-20" aria-labelledby="how-it-works">
        <div className="flex items-baseline gap-4 mb-8">
          <h2
            id="how-it-works"
            className="font-serif text-3xl sm:text-4xl text-navy tracking-tightest"
          >
            How it works
          </h2>
          <span className="text-[11px] uppercase tracking-[0.24em] text-navy/40">
            Four acts · ~15 minutes
          </span>
        </div>

        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              className="flex gap-5 items-start"
            >
              <span
                aria-hidden
                className="font-serif italic text-accent text-4xl sm:text-5xl leading-none tabular-nums shrink-0 w-10"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-serif text-xl text-navy leading-snug">
                  {step.title}
                </h3>
                <p className="mt-1 text-navy/65 text-[15px] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <span className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium shrink-0">
            A few notes
          </span>
          <ul className="text-sm text-navy/70 space-y-1.5 sm:space-y-1">
            <li>
              <span className="text-navy/50">·</span> Works on any phone or
              laptop — just share the room code or link.
            </li>
            <li>
              <span className="text-navy/50">·</span> Submissions are anonymous
              until the winning author is revealed.
            </li>
            <li>
              <span className="text-navy/50">·</span> If you refresh or lose
              signal, you'll rejoin your room automatically.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-16 ornament" />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-navy/40">
        Anonymous submissions · Live bracket · 15-minute format
      </p>
    </motion.div>
  );
}
