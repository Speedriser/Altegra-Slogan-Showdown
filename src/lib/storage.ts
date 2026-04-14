const KEY = 'slogan-showdown:v1';

export interface LocalSession {
  code: string;
  uid: string;
  isHost: boolean;
  name: string;
}

export function loadSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.code === 'string' &&
      typeof parsed.uid === 'string' &&
      typeof parsed.isHost === 'boolean' &&
      typeof parsed.name === 'string'
    ) {
      return parsed as LocalSession;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSession(s: LocalSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
