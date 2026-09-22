import type { EffectModule, Point } from '../../types';
import { INK, boil, inFace, ink, mid, partial, quad, rng, sizeK, toLocal } from '../draw';

export const unibrow: EffectModule = {
  id: 'unibrow',
  name: 'Unibrow',
  icon: 'Minus',
  keywords: ['unibrow', 'monobrow', 'one brow'],
  duration: 1200,
  category: 'funny',
  sound: 'whoosh',
  quip: 'Two brows? In THIS economy?',
  anchor: (f) => mid(f.landmarks.leftBrow, f.landmarks.rightBrow),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const k = sizeK(intensity);
    const origin = mid(L.leftBrow, L.rightBrow);
    const color = meta.color ?? INK;
    const b = boil(time);
    inFace(ctx, face, origin, () => {
      const l = toLocal(face, origin, L.leftBrow);
      const r = toLocal(face, origin, L.rightBrow);
      const ext = face.width * 0.08;
      const center = { x: 0, y: face.width * 0.01 };
      const halves = [
        quad(center, { x: l.x * 0.5, y: l.y - face.width * 0.03 }, { x: l.x - ext, y: l.y + face.width * 0.02 }, 18),
        quad(center, { x: r.x * 0.5, y: r.y - face.width * 0.03 }, { x: r.x + ext, y: r.y + face.width * 0.02 }, 18),
      ];
      for (const h of halves) {
        const shown = partial(h, progress);
        const rand = rng(b * 13 + (h === halves[0] ? 1 : 2));
        for (let i = 0; i < shown.length; i++) {
          const p: Point = shown[i];
          for (let j = 0; j < 5; j++) {
            const len = face.width * (0.04 + rand() * 0.035) * k;
            const ang = -Math.PI / 2 + (rand() - 0.5) * 1.1;
            ink(ctx, [
              { x: p.x + (rand() - 0.5) * face.width * 0.03, y: p.y + len * 0.5 },
              { x: p.x + Math.cos(ang) * len * 0.4, y: p.y + Math.sin(ang) * len * 0.5 },
            ], { width: Math.max(1.5, face.width * 0.009), color, sketchy: false, wobble: 0.5 });
          }
        }
      }
    });
  },
};
