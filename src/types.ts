export type Phase = 'lobby' | 'submission' | 'bracket' | 'voting' | 'done';

export interface Player {
  name: string;
  avatar: string;
  joinedAt: number;
  online?: boolean;
}

export interface Submission {
  text: string;
  authorId: string;
  submittedAt: number;
}

export interface Matchup {
  matchupId: string;
  slogan1Id: string | null;
  slogan2Id: string | null;
  winnerId?: string | null;
}

export interface Bracket {
  rounds: Matchup[][];
}

export interface CurrentMatchup {
  roundIdx: number;
  matchupIdx: number;
  startedAt: number;
}

export interface Room {
  phase: Phase;
  hostId: string;
  createdAt: number;
  players?: Record<string, Player>;
  submissions?: Record<string, Submission>;
  bracket?: Bracket;
  currentMatchup?: CurrentMatchup;
  votes?: Record<string, Record<string, string>>;
}
