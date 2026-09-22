import { EFFECTS } from '../effects/registry';

export interface ParsedCommand {
  effectIds: string[];
  speechText?: string;
  unknown: string[];
}

const STOP = new Set(['a', 'an', 'the', 'and', 'with', 'some', 'add', 'give', 'him', 'her', 'them', 'me', 'please', 'plus', 'also', 'make', 'put', 'on', 'of', 'to', 'it', 'more', 'lots', 'big', 'huge', 'tiny', 'little', 'extra', 'then', 'now', 'i', 'want', 'like', 'some', 'face', 'my', 'this', 'that', 'guy', 'person', 'their', 'his']);

const INDEX = EFFECTS.flatMap((e) => e.keywords.map((k) => ({ k, id: e.id }))).sort((a, b) => b.k.length - a.k.length);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keyword matcher: longest keywords win and "consume" their words, so
 * "full demon" never also triggers "demon", and "ring of fire" beats "fire".
 */
export function parseCommand(input: string): ParsedCommand {
  let speechText: string | undefined;
  let text = input;
  // Quoted text or `says …` becomes speech-bubble copy.
  const quoted = text.match(/["“]([^"”]{1,120})["”]/) ?? text.match(/(?:^|\s)'([^']{1,120})'/);
  const says = text.match(/\b(?:says?|saying|yells?|screams?)\b[:\s]+(.{1,120}?)(?:[,;]|$)/i);
  if (quoted) {
    speechText = quoted[1].trim();
    text = text.replace(quoted[0], ' say ');
  } else if (says) {
    speechText = says[1].trim();
    text = text.replace(says[1], ' ');
  }

  let norm = ` ${text.toLowerCase().replace(/[^a-z0-9_\s]/g, ' ').replace(/\s+/g, ' ')} `;
  const hits: { at: number; id: string }[] = [];
  for (const { k, id } of INDEX) {
    const re = new RegExp(`\\s${escapeRe(k)}s?(?=\\s)`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(norm))) {
      hits.push({ at: m.index, id });
      norm = norm.slice(0, m.index) + ' ' + '#'.repeat(m[0].length - 1) + norm.slice(m.index + m[0].length);
    }
  }
  hits.sort((a, b) => a.at - b.at);
  const effectIds = [...new Set(hits.map((h) => h.id))];
  const unknown = norm
    .split(' ')
    .filter((w) => w && !w.startsWith('#') && !STOP.has(w) && w.length > 2);
  return { effectIds, speechText, unknown };
}
