import type { EffectModule, Point } from '../../types';
import { INK, boil, inFace, ink, quad, sizeK, toLocal } from '../draw';

export const demonGoatee: EffectModule = {
  id: 'demon-goatee',
  name: 'Demon Goatee',
  icon: 'Triangle',
  keywords: ['demon goatee', 'pointy beard', 'evil beard'],
  duration: 1500,
  category: 'demonic',
  sound: 'whoosh',
  quip: 'Grown in 1.5 seconds. Puberty could never.',
  anchor: (f) => f.landmarks.chin,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const b = boil(time);
    const color = meta.color ?? INK;
    inFace(ctx, face, L.chin, () => {
      const top = toLocal(face, L.chin, L.mouthCenter).y * 0.55;
      const tip: Point = { x: u * 0.04, y: u * 0.42 };
      const strands = 16;
      for (let i = 0; i < strands; i++) {
        const f = i / (strands - 1);
        const start = { x: (f - 0.5) * u * 0.34, y: top + Math.abs(f - 0.5) * u * 0.08 };
        const ctrl = { x: start.x * 0.7 + Math.sin(i * 3.1) * u * 0.02, y: u * 0.2 };
        const t = Math.max(0, Math.min(1, progress * 1.6 - f * 0.4));
        ink(ctx, quad(start, ctrl, tip, 12), { width: u * 0.022, color, seed: b * 31 + i, progress: t, wobble: u * 0.006 });
      }
      // Evil little flick at the end.
      if (progress > 0.8) {
        ink(ctx, quad(tip, { x: tip.x + u * 0.08, y: tip.y + u * 0.02 }, { x: tip.x + u * 0.1, y: tip.y - u * 0.05 }, 8), {
          width: u * 0.018,
          color,
          seed: b,
          progress: (progress - 0.8) / 0.2,
        });
      }
    });
  },
};
