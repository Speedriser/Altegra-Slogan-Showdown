import { motion } from 'framer-motion';
import type { Bracket, Submission } from '../types';

interface Props {
  bracket: Bracket;
  submissions: Record<string, Submission>;
  currentMatchupId?: string | null;
  compact?: boolean;
}

function truncate(s: string, n = 48): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

export function BracketView({
  bracket,
  submissions,
  currentMatchupId,
  compact = false,
}: Props) {
  return (
    <div
      className={`flex ${
        compact ? 'gap-4' : 'gap-6 sm:gap-10'
      } items-stretch overflow-x-auto pb-2 -mx-5 px-5`}
    >
      {bracket.rounds.map((round, rIdx) => (
        <div
          key={rIdx}
          className="flex flex-col justify-around gap-3 min-w-[220px]"
        >
          <p
            className={`text-[10px] uppercase tracking-[0.24em] text-navy/40 mb-1 ${
              compact ? '' : 'text-center'
            }`}
          >
            {labelForRound(rIdx, bracket.rounds.length)}
          </p>
          <div className="flex flex-col gap-3 justify-around flex-1">
            {round.map((mu) => {
              const s1 = mu.slogan1Id ? submissions[mu.slogan1Id] : null;
              const s2 = mu.slogan2Id ? submissions[mu.slogan2Id] : null;
              const isCurrent = currentMatchupId === mu.matchupId;
              const winner1 = mu.winnerId && mu.winnerId === mu.slogan1Id;
              const winner2 = mu.winnerId && mu.winnerId === mu.slogan2Id;

              return (
                <motion.div
                  key={mu.matchupId}
                  layout
                  className={[
                    'card overflow-hidden text-[11px] sm:text-xs',
                    isCurrent ? 'ring-2 ring-accent' : '',
                    compact ? 'p-0' : 'p-0',
                  ].join(' ')}
                >
                  <BracketSlot
                    text={s1?.text}
                    isWinner={!!winner1}
                    isBye={!!mu.slogan1Id && !mu.slogan2Id && !!mu.winnerId}
                  />
                  <div className="h-px bg-navy/10" />
                  <BracketSlot
                    text={s2?.text}
                    isWinner={!!winner2}
                    placeholder={!mu.slogan2Id && !!mu.slogan1Id && !!mu.winnerId ? 'Bye' : undefined}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketSlot({
  text,
  isWinner,
  isBye,
  placeholder,
}: {
  text?: string;
  isWinner?: boolean;
  isBye?: boolean;
  placeholder?: string;
}) {
  return (
    <div
      className={[
        'px-3 py-2.5 min-h-[44px] flex items-center',
        isWinner ? 'bg-accent/10 text-navy font-medium' : 'text-navy/80',
        isBye ? 'italic' : '',
      ].join(' ')}
    >
      <span className="leading-snug line-clamp-2">
        {text ? (
          truncate(text, 60)
        ) : placeholder ? (
          <span className="text-navy/30">{placeholder}</span>
        ) : (
          <span className="text-navy/30">—</span>
        )}
      </span>
    </div>
  );
}

function labelForRound(idx: number, total: number): string {
  if (idx === total - 1) return 'Final';
  if (idx === total - 2) return 'Semis';
  if (idx === total - 3) return 'Quarters';
  return `Round ${idx + 1}`;
}
