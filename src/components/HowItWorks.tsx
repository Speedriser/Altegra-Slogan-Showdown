import { motion } from 'framer-motion';

export interface Step {
  title: string;
  body: string;
}

export const STEPS: Step[] = [
  {
    title: 'Gather',
    body: 'One person hosts and shares a 4-letter code. Everyone else joins with the code and a name.',
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

const ROMAN = ['I', 'II', 'III', 'IV'];

interface Props {
  variant?: 'full' | 'compact';
}

export function HowItWorks({ variant = 'full' }: Props) {
  return variant === 'full' ? <FullHowItWorks /> : <CompactHowItWorks />;
}

/* -------------------------------------------------------------------------- */
/*  FULL — editorial magazine spread for the landing page                     */
/* -------------------------------------------------------------------------- */

function FullHowItWorks() {
  return (
    <section className="mt-24" aria-labelledby="how-it-works">
      <header className="text-center">
        <div className="flex items-center justify-center gap-4 mb-5">
          <span aria-hidden className="h-px w-12 bg-navy/20" />
          <span className="text-[10px] uppercase tracking-[0.34em] text-navy/50 font-medium">
            The Format · Four Acts
          </span>
          <span aria-hidden className="h-px w-12 bg-navy/20" />
        </div>
        <h2
          id="how-it-works"
          className="font-serif text-5xl sm:text-6xl text-navy tracking-tightest leading-[0.95]"
        >
          How it <em className="text-accent">works</em>
        </h2>
        <p className="mt-4 text-navy/60 max-w-md mx-auto">
          A four-act format, purpose-built for a team on a video call.
          Fast, fair, and friendly to phones.
        </p>
      </header>

      <ol className="relative mt-16 grid gap-12 sm:grid-cols-4 sm:gap-6">
        {/* Mobile vertical connector */}
        <div
          aria-hidden
          className="sm:hidden absolute left-[6px] top-3 bottom-3 w-px bg-navy/15"
        />
        {/* Desktop horizontal connector — spans dot centres (12.5% → 87.5%) */}
        <div
          aria-hidden
          className="hidden sm:block absolute top-[5px] left-[12.5%] right-[12.5%] h-px bg-navy/15"
        />

        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className="relative pl-7 sm:pl-0 sm:pt-8 sm:text-center group"
          >
            {/* Mobile pin */}
            <span
              aria-hidden
              className="sm:hidden absolute left-0 top-[6px] w-3 h-3 rounded-full bg-accent ring-4 ring-paper"
            />
            {/* Desktop pin */}
            <span
              aria-hidden
              className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-paper transition-transform group-hover:scale-125"
            />

            <p className="text-[10px] uppercase tracking-[0.28em] text-navy/40 font-medium">
              Act {ROMAN[i]}
            </p>
            <p className="font-serif italic text-accent leading-none tabular-nums mt-2 text-6xl sm:text-7xl transition-colors group-hover:text-accent-dark">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="font-serif text-2xl text-navy mt-4 tracking-tight">
              {step.title}
            </h3>
            <p className="mt-2 text-[15px] text-navy/65 leading-relaxed sm:px-1">
              {step.body}
            </p>
          </motion.li>
        ))}
      </ol>

      {/* Side notes */}
      <div className="mt-14 grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Note title="Any device">
          Phones, laptops, tablets. Share the room code or the link.
        </Note>
        <Note title="Anonymous">
          Slogans aren't attributed until the winning author is revealed.
        </Note>
        <Note title="Reconnect-safe">
          Refresh or switch networks and you'll drop right back into the
          room.
        </Note>
      </div>
    </section>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-accent font-medium mb-1.5">
        {title}
      </p>
      <p className="text-sm text-navy/65 leading-snug">{children}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  COMPACT — slim in-page guide for the join screen                          */
/* -------------------------------------------------------------------------- */

function CompactHowItWorks() {
  return (
    <section
      className="mt-10 card p-5 sm:p-7 overflow-hidden"
      aria-labelledby="how-to-play"
    >
      <header className="flex items-baseline justify-between mb-5 gap-3">
        <div className="flex items-baseline gap-3">
          <h3
            id="how-to-play"
            className="font-serif text-xl sm:text-2xl text-navy tracking-tight"
          >
            What you'll do
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-[0.24em] text-navy/40 shrink-0">
          ~15 min
        </span>
      </header>

      <ol className="relative grid gap-5 sm:gap-0 sm:grid-cols-4">
        {/* Subtle divider rules between columns on desktop */}
        <div
          aria-hidden
          className="hidden sm:grid sm:grid-cols-4 absolute inset-0 pointer-events-none"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={
                i === 0 ? '' : 'border-l border-dashed border-navy/15'
              }
            />
          ))}
        </div>

        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
            className="relative flex sm:flex-col gap-3 sm:gap-2 items-start sm:px-3 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="font-serif italic text-accent text-3xl sm:text-4xl leading-none tabular-nums shrink-0 w-9 sm:w-auto">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h4 className="font-serif text-base sm:text-lg text-navy leading-tight">
                {step.title}
              </h4>
              <p className="text-[13px] text-navy/65 leading-snug mt-1">
                {step.body}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
