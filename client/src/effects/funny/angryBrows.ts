import type { EffectModule } from '../../types';
import { easeOutBounce } from '../../lib/easing';
import { INK, blob, boil, inFace, sizeK } from '../draw';

export const angryBrows: EffectModule = {
  id: 'angry-brows',
  name: 'Angry Brows',
  icon: 'Angry',
  keywords: ['angry', 'mad', 'brows', 'eyebrows', 'grumpy', 'furious'],
  duration: 900,
  category: 'funny',
  sound: 'thud',
  quip: 'Someone microwaved fish in the office.',
  anchor: (f) => f.landmarks.leftBrow,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const slam = (1 - easeOutBounce(progress)) * face.height * 0.5;
    const twitch = progress >= 1 && (time % 2400) < 120 ? -u * 0.02 : 0;
    const color = meta.color ?? INK;
    const b = boil(time);
    [[L.leftBrow, 1], [L.rightBrow, -1]].forEach(([brow, s], i) => {
      const p = brow as { x: number; y: number };
      const side = s as number;
      inFace(ctx, face, p, () => {
        ctx.translate(0, -slam + (i === 0 ? twitch : 0) - u * 0.02);
        ctx.rotate(side * 0.35);
        blob(ctx, [
          { x: -u * 0.16, y: -u * 0.03 },
          { x: u * 0.16, y: -u * 0.06 },
          { x: u * 0.17, y: u * 0.02 },
          { x: -u * 0.15, y: u * 0.04 },
        ], color, { width: Math.max(1.5, u * 0.01), seed: b + i, wobble: 1 });
      });
    });
  },
};
