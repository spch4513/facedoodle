import type { EffectModule, Point } from '../../types';
import { segment } from '../../lib/easing';
import { INK, blob, boil, inFace, ink, mid, quad, sizeK, toLocal } from '../draw';

export const mustacheGoatee: EffectModule = {
  id: 'mustache-goatee',
  name: 'Mustache + Goatee',
  icon: 'Glasses',
  keywords: ['mustache', 'moustache', 'beard', 'goatee', 'handlebar'],
  duration: 1600,
  category: 'funny',
  sound: 'boing',
  quip: 'Distinguished. Villainous. Probably owns a railroad.',
  anchor: (f) => mid(f.landmarks.noseTip, f.landmarks.upperLip),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const origin = mid(L.noseTip, L.upperLip);
    const color = meta.color ?? INK;
    const b = boil(time);
    const twirl = progress >= 1 ? Math.sin(time / 400) * 0.04 : 0;
    inFace(ctx, face, origin, () => {
      const m = segment(progress, 0, 0.6);
      for (const s of [-1, 1]) {
        ctx.save();
        ctx.scale(s, 1);
        ctx.rotate(twirl);
        const shape: Point[] = [
          ...quad({ x: 0, y: -u * 0.02 }, { x: u * 0.15, y: -u * 0.08 }, { x: u * 0.3, y: 0 }, 10),
          ...quad({ x: u * 0.3, y: 0 }, { x: u * 0.36, y: -u * 0.12 }, { x: u * 0.28, y: -u * 0.12 }, 8),
          ...quad({ x: u * 0.28, y: -u * 0.12 }, { x: u * 0.34, y: u * 0.06 }, { x: u * 0.12, y: u * 0.05 }, 10),
          ...quad({ x: u * 0.12, y: u * 0.05 }, { x: u * 0.05, y: u * 0.05 }, { x: 0, y: u * 0.03 }, 6),
        ];
        if (m >= 1) blob(ctx, shape, color, { width: Math.max(1.5, u * 0.01), seed: b + s, wobble: 0.6 });
        else ink(ctx, shape, { width: u * 0.03, color, seed: b + s, progress: m });
        ctx.restore();
      }
      const g = segment(progress, 0.55, 1);
      if (g > 0) {
        const chin = toLocal(face, origin, L.chin);
        const lip = toLocal(face, origin, L.mouthCenter);
        const top = lip.y + (chin.y - lip.y) * 0.45;
        for (let i = 0; i < 9; i++) {
          const f = i / 8;
          ink(ctx, quad({ x: (f - 0.5) * u * 0.14, y: top }, { x: (f - 0.5) * u * 0.18, y: chin.y }, { x: (f - 0.5) * u * 0.06, y: chin.y + u * 0.1 }), {
            width: u * 0.02,
            color,
            seed: b + i,
            progress: g,
          });
        }
      }
    });
  },
};
