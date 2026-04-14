// Alphabet excludes I, O, L (ambiguous with 1, 0) and all digits.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateRoomCode(length = 4): string {
  let out = '';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidRoomCode(s: string): boolean {
  if (!s) return false;
  return /^[A-HJ-KM-NP-Z]{4}$/.test(s.toUpperCase());
}
