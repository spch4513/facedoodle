import type { EffectCategory, EffectModule } from '../types';
import { devilHorns } from './demonic/devilHorns';
import { glowingEyes } from './demonic/glowingEyes';
import { vampireFangs } from './demonic/vampireFangs';
import { demonGoatee } from './demonic/demonGoatee';
import { fireAura } from './demonic/fireAura';
import { pitchfork } from './demonic/pitchfork';
import { pentagram } from './demonic/pentagram';
import { batSwarm } from './demonic/batSwarm';
import { smokeFromEars } from './demonic/smokeFromEars';
import { demonicSigil } from './demonic/demonicSigil';
import { crazyTongue } from './funny/crazyTongue';
import { crown } from './funny/crown';
import { redFacePaint } from './funny/redFacePaint';
import { clownMakeup } from './funny/clownMakeup';
import { unibrow } from './funny/unibrow';
import { mustacheGoatee } from './funny/mustacheGoatee';
import { xEyes } from './funny/xEyes';
import { speechBubble } from './funny/speechBubble';
import { lightningScar } from './funny/lightningScar';
import { thirdEye } from './funny/thirdEye';
import { rainbowTears } from './funny/rainbowTears';
import { angryBrows } from './funny/angryBrows';
import { snotBubble } from './funny/snotBubble';
import { earHair } from './funny/earHair';
import { brainExposed } from './funny/brainExposed';
import { googlyEyes } from './funny/googlyEyes';
import { dealWithIt } from './funny/dealWithIt';
import { laserEyes } from './funny/laserEyes';
import { birdHalo } from './halo/birdHalo';
import { angelHalo } from './halo/angelHalo';
import { beeSwarm } from './halo/beeSwarm';
import { starsOrbit } from './halo/starsOrbit';
import { flameRing } from './halo/flameRing';
import { fullDemon } from './chaos/fullDemon';
import { circusFreak } from './chaos/circusFreak';
import { birdDemon } from './chaos/birdDemon';
import { randomChaos } from './chaos/randomChaos';

export const EFFECTS: EffectModule[] = [
  devilHorns, glowingEyes, vampireFangs, demonGoatee, fireAura, pitchfork, pentagram, batSwarm, smokeFromEars, demonicSigil,
  crazyTongue, crown, redFacePaint, clownMakeup, unibrow, mustacheGoatee, xEyes, speechBubble, lightningScar, thirdEye,
  rainbowTears, angryBrows, snotBubble, earHair, brainExposed, googlyEyes, dealWithIt, laserEyes,
  birdHalo, angelHalo, beeSwarm, starsOrbit, flameRing,
  fullDemon, circusFreak, birdDemon, randomChaos,
];

export const REGISTRY = new Map(EFFECTS.map((e) => [e.id, e]));
export const getEffect = (id: string) => REGISTRY.get(id);

/** Every effect that draws itself (i.e. not a combo). */
export const DRAWABLE = EFFECTS.filter((e) => !e.expand);

export function pickRandom(count: number, exclude: string[] = []): string[] {
  const pool = DRAWABLE.filter((e) => !exclude.includes(e.id)).map((e) => e.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

randomChaos.expand = () => pickRandom(3 + Math.floor(Math.random() * 3)).map((effectId) => ({ effectId, delay: 0 }));

export const CATEGORIES: { id: EffectCategory; label: string; blurb: string }[] = [
  { id: 'demonic', label: 'Demonic', blurb: 'For your inner Beelzebub' },
  { id: 'funny', label: 'Unhinged', blurb: 'Pure, weaponised silliness' },
  { id: 'halo', label: 'Orbiters', blurb: 'Things that circle your head' },
  { id: 'chaos', label: 'Chaos Combos', blurb: 'Several crimes at once' },
];
