import { motion } from 'framer-motion';
import type { Room } from '../types';
import { PlayerList } from './PlayerList';
import { RoomCode } from './RoomCode';
import { setPhase } from '../lib/rtdb';

interface Props {
  code: string;
  room: Room;
  uid: string;
}

export function Lobby({ code, room, uid }: Props) {
  const isHost = room.hostId === uid;
  const players = room.players ?? {};
  const count = Object.keys(players).length;

  const startSubmissions = async () => {
    await setPhase(code, 'submission');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto pt-6"
    >
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium mb-3">
            Lobby · waiting room
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl text-navy leading-[1] tracking-tightest">
            Gather
            <br />
            the team.
          </h2>
          <p className="mt-5 text-navy/60 max-w-md">
            Share the code. Once everyone's here, the host begins the
            submission round.
          </p>
          <div className="mt-6">
            <RoomCode code={code} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-serif text-2xl text-navy">
              Players <span className="text-navy/40 text-lg">({count})</span>
            </h3>
          </div>
          <PlayerList players={players} hostId={room.hostId} highlightUid={uid} />
          {count < 2 && (
            <p className="mt-4 text-sm text-navy/50">
              Waiting for at least one more player…
            </p>
          )}
        </div>
      </div>

      {isHost && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-paper via-paper/95 to-paper/0 pt-10 pb-5 px-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm text-navy/60">
              You're the host.{' '}
              <span className="hidden sm:inline">
                You control when each phase advances.
              </span>
            </p>
            <button
              type="button"
              onClick={startSubmissions}
              disabled={count < 1}
              className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start submissions →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
