import { AnimatePresence, motion } from 'framer-motion';
import type { Player } from '../types';
import { Avatar } from './Avatar';

interface Props {
  players: Record<string, Player>;
  hostId: string;
  highlightUid?: string | null;
}

export function PlayerList({ players, hostId, highlightUid }: Props) {
  const entries = Object.entries(players).sort(
    ([, a], [, b]) => a.joinedAt - b.joinedAt
  );

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <AnimatePresence initial={false}>
        {entries.map(([uid, p]) => (
          <motion.li
            key={uid}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`flex items-center gap-3 rounded-xl border border-navy/10 bg-white/80 px-3 py-2 ${
              highlightUid === uid ? 'ring-2 ring-accent/50' : ''
            }`}
          >
            <Avatar seed={p.avatar || p.name} />
            <div className="flex-1 min-w-0">
              <p className="text-navy font-medium truncate">
                {p.name}
                {highlightUid === uid && (
                  <span className="text-navy/40 text-xs ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-navy/50">
                {uid === hostId ? 'Host' : 'Player'}
                {p.online === false && ' · away'}
              </p>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
