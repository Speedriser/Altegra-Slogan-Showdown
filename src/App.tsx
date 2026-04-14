import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayer } from './hooks/usePlayer';
import { useRoom } from './hooks/useRoom';
import { clearSession, loadSession, saveSession } from './lib/storage';
import { isValidRoomCode } from './lib/code';
import { Shell } from './components/Shell';
import { Landing } from './components/Landing';
import { HostSetup } from './components/HostSetup';
import { JoinRoom } from './components/JoinRoom';
import { Lobby } from './components/Lobby';
import { SubmissionPhase } from './components/SubmissionPhase';
import { BracketPreview } from './components/BracketPreview';
import { VotingPhase } from './components/VotingPhase';
import { WinnerReveal } from './components/WinnerReveal';

type UiScreen = 'landing' | 'host-setup' | 'join' | 'in-room';

function readCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const r = params.get('r');
  if (!r) return null;
  const up = r.toUpperCase();
  return isValidRoomCode(up) ? up : null;
}

export default function App() {
  const { uid, loading: authLoading, session } = usePlayer();
  const [screen, setScreen] = useState<UiScreen>('landing');
  const [code, setCode] = useState<string | null>(null);
  const [urlCode] = useState<string | null>(() => readCodeFromUrl());

  const { room, loading: roomLoading, missing } = useRoom(code);

  // On auth-ready, attempt to reconnect via stored session.
  useEffect(() => {
    if (authLoading) return;
    if (!uid) return;
    if (code) return;
    const stored = loadSession();
    if (stored && stored.uid === uid) {
      setCode(stored.code);
      setScreen('in-room');
    }
  }, [authLoading, uid, code]);

  // If the URL has a code and nothing else is going on, pre-route to join.
  useEffect(() => {
    if (authLoading || code) return;
    if (urlCode && screen === 'landing') {
      setScreen('join');
    }
  }, [authLoading, code, urlCode, screen]);

  // If the stored room is gone (cleared, expired, or never existed), reset.
  useEffect(() => {
    if (missing && code) {
      clearSession();
      setCode(null);
      setScreen('landing');
    }
  }, [missing, code]);

  const handleHosted = useCallback((newCode: string, _name: string) => {
    setCode(newCode);
    setScreen('in-room');
  }, []);

  const handleJoined = useCallback((joinedCode: string, _name: string) => {
    setCode(joinedCode);
    setScreen('in-room');
  }, []);

  const leave = useCallback(() => {
    clearSession();
    setCode(null);
    setScreen('landing');
  }, []);

  // Loading shell
  if (authLoading) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto pt-20 text-center text-navy/50">
          <p className="font-serif text-2xl italic">Warming up…</p>
        </div>
      </Shell>
    );
  }

  if (!uid) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto pt-20 text-center text-red-700">
          <p className="font-serif text-2xl">
            Couldn't sign in. Please check that your Firebase config is set
            and Anonymous Auth is enabled.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <Landing
            key="landing"
            onHost={() => setScreen('host-setup')}
            onJoin={() => setScreen('join')}
            prefilledCode={urlCode}
          />
        )}

        {screen === 'host-setup' && (
          <HostSetup
            key="host-setup"
            uid={uid}
            onCreated={handleHosted}
            onBack={() => setScreen('landing')}
          />
        )}

        {screen === 'join' && (
          <JoinRoom
            key="join"
            uid={uid}
            initialCode={urlCode ?? session?.code ?? ''}
            onJoined={handleJoined}
            onBack={() => setScreen('landing')}
          />
        )}

        {screen === 'in-room' && code && (
          <motion.div key={`room-${code}`} className="contents">
            {roomLoading && !room && (
              <div className="max-w-xl mx-auto pt-20 text-center text-navy/50">
                <p className="font-serif text-2xl italic">Connecting to room…</p>
              </div>
            )}
            {room && (
              <RoomPhases room={room} code={code} uid={uid} onLeave={leave} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function RoomPhases({
  room,
  code,
  uid,
  onLeave,
}: {
  room: ReturnType<typeof useRoom>['room'] & object;
  code: string;
  uid: string;
  onLeave: () => void;
}) {
  const phase = room.phase;

  // Persist the latest session info (in case name/host status changed).
  useEffect(() => {
    const me = room.players?.[uid];
    if (me) {
      saveSession({
        code,
        uid,
        isHost: room.hostId === uid,
        name: me.name,
      });
    }
  }, [room, code, uid]);

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'lobby' && (
          <Lobby key="lobby" code={code} room={room} uid={uid} />
        )}
        {phase === 'submission' && (
          <SubmissionPhase key="sub" code={code} room={room} uid={uid} />
        )}
        {phase === 'bracket' && (
          <BracketPreview key="br" code={code} room={room} uid={uid} />
        )}
        {phase === 'voting' && (
          <VotingPhase key="vote" code={code} room={room} uid={uid} />
        )}
        {phase === 'done' && <WinnerReveal key="done" room={room} />}
      </AnimatePresence>

      <button
        type="button"
        onClick={onLeave}
        className="fixed top-3 right-3 text-xs uppercase tracking-[0.2em] text-navy/40 hover:text-navy z-30"
        aria-label="Leave room"
      >
        Leave
      </button>
    </>
  );
}
