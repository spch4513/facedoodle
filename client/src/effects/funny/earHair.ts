import type { EffectModule } from '../../types';
import { easeOutBack } from '../../lib/easing';
import { INK, boil, inFace, ink, quad, rng, sizeK } from '../draw';

export const earHair: EffectModule = {
  id: 'ear-hair',
  name: 'Ear Hair',
  icon: 'Sprout',
  keywords: ['ear hair', 'hairy ears', 'ear tufts'],
  duration: 1300,
  category: 'funny',
  sound: 'boing',
  quip: 'Grandpa-core. Very in right now.',
  anchor: (f) => f.landmarks.rightEar,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const color = meta.color ?? INK;
    const g = easeOutBack(progress, 2);
    const b = boil(time);
    for (const [ear, side] of [[L.leftEar, -1], [L.rightEar, 1]] as const) {
      const r = rng(side + 10);
      inFace(ctx, face, ear, () => {
        for (let i = 0; i < 11; i++) {
          const ang = (-0.9 + (i / 10) * 1.6) + Math.sin(time / 260 + i) * 0.12;
          const len = u * (0.14 + r() * 0.14) * g;
          const tip = { x: side * Math.cos(ang) * len, y: Math.sin(ang) * len };
          const ctrl = { x: tip.x * 0.5 + side * u * 0.03, y: tip.y * 0.5 - u * 0.04 * r() };
          ink(ctx, quad({ x: 0, y: 0 }, ctrl, tip, 8), { width: Math.max(1.2, u * 0.008), color, seed: b + i, wobble: 0.8 });
        }
      });
    }
  },
};
