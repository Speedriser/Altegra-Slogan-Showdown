import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  code: string;
}

export function RoomCode({ code }: Props) {
  const [copied, setCopied] = useState<'url' | 'code' | null>(null);

  const shareUrl = `${window.location.origin}${window.location.pathname}?r=${code}`;

  const copy = async (what: 'url' | 'code') => {
    try {
      await navigator.clipboard.writeText(what === 'url' ? shareUrl : code);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card p-5 sm:p-8 flex flex-col items-center gap-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-navy/50">
        Room code
      </p>
      <motion.button
        type="button"
        onClick={() => copy('code')}
        whileTap={{ scale: 0.98 }}
        className="font-serif text-6xl sm:text-8xl tracking-[0.12em] text-navy hover:text-accent transition-colors"
      >
        {code}
      </motion.button>
      <div className="ornament w-24" />
      <div className="flex flex-col items-center gap-2 text-sm w-full max-w-md">
        <p className="text-navy/60 text-center">
          Share this link — or read the code aloud.
        </p>
        <div className="flex w-full gap-2">
          <input
            readOnly
            value={shareUrl}
            className="field text-xs sm:text-sm flex-1 bg-paper/60"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            onClick={() => copy('url')}
            className="btn-ghost text-sm"
          >
            {copied === 'url' ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
