import { randomInt } from 'node:crypto';

// No 0/O/1/l/I so nobody has to squint at a demon's URL.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function generateSlug(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
