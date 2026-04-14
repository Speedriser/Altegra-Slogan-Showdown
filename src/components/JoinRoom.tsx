import { useState } from 'react';
import { motion } from 'framer-motion';
import { joinRoom, roomExists } from '../lib/rtdb';
import { saveSession } from '../lib/storage';
import { isValidRoomCode } from '../lib/code';
import { Avatar, avatarUrl } from './Avatar';

interface Props {
  uid: string;
  initialCode?: string;
  onJoined: (code: string, name: string) => void;
  onBack: () => void;
}

export function JoinRoom({ uid, initialCode = '', onJoined, onBack }: Props) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(() =>
    Math.random().toString(36).slice(2, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeOk = isValidRoomCode(code);
  const canSubmit = codeOk && name.trim().length > 0 && !loading;

  const handleJoin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const normalised = code.toUpperCase();
      const exists = await roomExists(normalised);
      if (!exists) {
        setError(`No room found with code ${normalised}.`);
        setLoading(false);
        return;
      }
      await joinRoom(normalised, uid, name.trim(), avatarSeed);
      saveSession({ code: normalised, uid, isHost: false, name: name.trim() });
      onJoined(normalised, name.trim());
    } catch (e) {
      setError((e as Error).message || 'Could not join room');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto pt-8 sm:pt-16"
    >
      <button onClick={onBack} className="text-sm text-navy/50 hover:text-navy mb-6">
        ← Back
      </button>
      <h2 className="font-serif text-4xl sm:text-5xl text-navy leading-tight">
        Join a game
      </h2>
      <p className="mt-3 text-navy/60">
        Enter the 4-letter room code the host shared.
      </p>

      <div className="mt-8 card p-5 sm:p-7 flex flex-col gap-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
            Room code
          </label>
          <input
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-HJKMNP-Z]/g, '')
                  .slice(0, 4)
              )
            }
            placeholder="ABCD"
            className="field font-serif text-3xl tracking-[0.3em] uppercase text-center"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            maxLength={4}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder="e.g. Sam"
            className="field"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleJoin();
            }}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <Avatar seed={avatarSeed} size={56} />
            <button
              type="button"
              onClick={() =>
                setAvatarSeed(Math.random().toString(36).slice(2, 10))
              }
              className="btn-ghost text-sm"
            >
              Shuffle
            </button>
            <img src={avatarUrl(avatarSeed)} alt="" className="hidden" />
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handleJoin}
          disabled={!canSubmit}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Joining…' : 'Join room'}
        </button>
      </div>
    </motion.div>
  );
}
