// All the copy that makes FaceDoodle feel like it was written by a gremlin.

export const PLACEHOLDERS = [
  "devil horns and red eyes",
  "a crown, a mustache, and a snot bubble",
  "full demon",
  "clown makeup that says \"I regret nothing\"",
  "bees. just bees.",
  "googly eyes and a lightning scar",
  "halo of birds + smoke from ears",
  "chaos",
  "third eye, angry brows, laser eyes",
  "ring of fire and vampire fangs",
];

export const DETECTING = [
  'Consulting the council of demons…',
  'Locating eyeballs (there are usually two)…',
  'Measuring forehead real estate…',
  'Asking the face politely to hold still…',
  'Calibrating nostril-to-snot ratio…',
];

export const NO_MATCH = [
  "I don't know how to draw that yet. My art degree was mostly horns.",
  "No idea what that is. Try 'horns', 'crown', 'bees', or 'chaos'.",
  "Our demons are unionized and refuse to draw that. Try something else.",
];

const TITLES_A = ['Lord', 'Duke', 'Baroness', 'Archfiend', 'Sir', 'Dame', 'Count', 'Grand Wizard of', 'His Moistness', 'Supreme Overlord'];
const TITLES_B = ['Snotgoblin', 'Bogwort', 'Crumbleton', 'Gorbash', 'Fizzlewick', 'McSpookington', 'Noodleface', 'Grimbelly', 'Wobblechin', 'Beelzeboop'];
const TITLES_C = [
  'the Unwashed', 'Devourer of Snacks', 'of the Third Microwave', 'Who Replies-All', 'the Mildly Cursed',
  'Destroyer of Group Chats', 'Eater of Office Birthday Cake', 'the Suspiciously Moist', 'of Infinite Tabs', 'Who Forgot the Password',
];

export function demonName(): string {
  const p = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  return `${p(TITLES_A)} ${p(TITLES_B)} ${p(TITLES_C)}`;
}

export function possession(count: number): { pct: number; label: string } {
  const pct = Math.min(100, Math.round((1 - Math.exp(-count / 4)) * 100));
  const label =
    pct === 0 ? 'Disappointingly holy'
    : pct < 25 ? 'Slightly haunted'
    : pct < 50 ? 'Needs a priest (part-time)'
    : pct < 75 ? 'Actively possessed'
    : pct < 95 ? 'Call the Vatican'
    : 'Beyond saving. Congrats.';
  return { pct, label };
}

export const EXPORT_LINES = ['Evidence secured.', 'Framed it. Metaphorically. Also literally.', 'Saved for the family group chat.'];
