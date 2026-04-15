import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room } from '../types';
import { startBracket, submitSlogan, removeSubmission } from '../lib/rtdb';

interface Props {
  code: string;
  room: Room;
  uid: string;
}

const MAX_CHARS = 80;
const MAX_PER_PLAYER = 1;

export function SubmissionPhase({ code, room, uid }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isHost = room.hostId === uid;
  const players = room.players ?? {};
  const submissions = room.submissions ?? {};

  const mine = useMemo(
    () =>
      Object.entries(submissions).filter(
        ([, s]) => s.authorId === uid
      ) as [string, { text: string; authorId: string; submittedAt: number }][],
    [submissions, uid]
  );

  const submitters = useMemo(() => {
    const set = new Set<string>();
    for (const s of Object.values(submissions)) set.add(s.authorId);
    return set;
  }, [submissions]);

  const playerCount = Object.keys(players).length;
  const submittedCount = submitters.size;
  const allIn = submittedCount >= playerCount && playerCount > 0;
  const reachedCap = mine.length >= MAX_PER_PLAYER;

  const canSubmit =
    draft.trim().length > 0 &&
    draft.length <= MAX_CHARS &&
    !reachedCap &&
    !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await submitSlogan(code, uid, draft);
      setDraft('');
    } catch (e) {
      setError((e as Error).message || 'Could not submit');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (sid: string) => {
    await removeSubmission(code, sid);
  };

  const handleCloseSubmissions = async () => {
    const ids = Object.keys(submissions);
    if (ids.length < 2) {
      setError('Need at least 2 slogans to run a bracket.');
      return;
    }
    await startBracket(code, ids);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto pt-4"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium mb-3">
        Round 00 · Submissions
      </p>
      <h2 className="font-serif text-4xl sm:text-6xl text-navy leading-[1] tracking-tightest">
        Give us your
        <br />
        <em>one</em> line.
      </h2>
      <p className="mt-5 text-navy/60 max-w-xl">
        One slogan per player — make it count. Keep it short, sharp, and
        under {MAX_CHARS} characters. All submissions are anonymous;
        authors are revealed only if their slogan wins the whole thing.
      </p>

      <div className="card mt-8 p-5 sm:p-7">
        <label className="block text-xs uppercase tracking-[0.2em] text-navy/50 mb-2">
          Your slogan
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS + 20))}
          rows={2}
          placeholder="Altegra — …"
          className="field resize-none font-serif text-xl italic disabled:opacity-60"
          disabled={reachedCap}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
          }}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={
              draft.length > MAX_CHARS ? 'text-red-700' : 'text-navy/50'
            }
          >
            {draft.length} / {MAX_CHARS}
          </span>
          <span className="text-navy/50">
            {reachedCap ? 'You\u2019re in ✓' : 'Not submitted yet'}
          </span>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary mt-4 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy
            ? 'Submitting…'
            : reachedCap
              ? 'Slogan submitted'
              : 'Submit slogan'}
        </button>
        {reachedCap && (
          <p className="mt-3 text-xs text-navy/50">
            Changed your mind? Remove it below and submit a new one.
          </p>
        )}
      </div>

      {mine.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-navy/50 mb-3">
            Your submission
          </h3>
          <ul className="space-y-2">
            <AnimatePresence>
              {mine.map(([sid, s]) => (
                <motion.li
                  key={sid}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="card px-4 py-3 flex items-start justify-between gap-3"
                >
                  <p className="font-serif italic text-navy text-lg leading-snug">
                    “{s.text}”
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemove(sid)}
                    className="text-xs text-navy/40 hover:text-red-700 flex-shrink-0"
                    aria-label="Remove submission"
                  >
                    Remove
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <div className="mt-10 card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-navy/50">
            Live counter
          </p>
          <p className="font-serif text-2xl text-navy mt-1">
            {submittedCount}{' '}
            <span className="text-navy/40">
              of {playerCount}{' '}
              {playerCount === 1 ? 'player' : 'players'} submitted
            </span>
          </p>
        </div>
        {allIn && (
          <p className="text-sm text-accent font-medium">Everyone's in ✓</p>
        )}
      </div>

      {isHost && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-paper via-paper/95 to-paper/0 pt-10 pb-5 px-5">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm text-navy/60">
              {Object.keys(submissions).length} slogan
              {Object.keys(submissions).length === 1 ? '' : 's'} collected
            </p>
            <button
              type="button"
              onClick={handleCloseSubmissions}
              disabled={Object.keys(submissions).length < 2}
              className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close submissions →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
