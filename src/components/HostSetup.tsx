import { useState } from 'react';
import { motion } from 'framer-motion';
import { createRoom } from '../lib/rtdb';
import { saveSession } from '../lib/storage';
import { Avatar, avatarUrl } from './Avatar';

interface Props {
  uid: string;
  onCreated: (code: string, name: string) => void;
  onBack: () => void;
}

export function HostSetup({ uid, onCreated, onBack }: Props) {
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(() =>
    Math.random().toString(36).slice(2, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !loading;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const code = await createRoom(uid, name.trim(), avatarSeed);
      saveSession({ code, uid, isHost: true, name: name.trim() });
      onCreated(code, name.trim());
    } catch (e) {
      setError((e as Error).message || 'Could not create room');
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
        Host a game
      </h2>
      <p className="mt-3 text-navy/60">
        Pick a name and an avatar. We'll generate a short room code to share.
      </p>

      <div className="mt-8 card p-5 sm:p-7 flex flex-col gap-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder="e.g. Alex"
            className="field"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <Avatar seed={avatarSeed} size={64} />
            <button
              type="button"
              onClick={() =>
                setAvatarSeed(Math.random().toString(36).slice(2, 10))
              }
              className="btn-ghost text-sm"
            >
              Shuffle
            </button>
            {/* hidden preload so the new avatar is ready instantly */}
            <img src={avatarUrl(avatarSeed)} alt="" className="hidden" />
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          disabled={!canSubmit}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Creating room…' : 'Create room'}
        </button>
      </div>
    </motion.div>
  );
}
