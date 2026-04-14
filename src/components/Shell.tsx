import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ShellProps {
  children: ReactNode;
  eyebrow?: string;
}

export function Shell({ children, eyebrow = 'Altegra · Slogan Showdown' }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <span
              aria-hidden
              className="block w-2 h-2 rounded-full bg-accent"
            />
            <span className="text-xs uppercase tracking-[0.22em] text-navy/60 font-medium">
              {eyebrow}
            </span>
          </motion.div>
          <span className="hidden sm:block text-xs uppercase tracking-[0.22em] text-navy/40">
            vol. 01
          </span>
        </div>
      </header>
      <main className="flex-1 px-5 sm:px-8 pb-24">{children}</main>
      <footer className="px-5 sm:px-8 pb-6 pt-4">
        <div className="ornament mb-4" />
        <p className="text-[11px] uppercase tracking-[0.22em] text-navy/40 text-center">
          A tagline tournament · Made for the team
        </p>
      </footer>
    </div>
  );
}
