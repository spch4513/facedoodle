import type { EffectModule } from '../../types';
import { easeOutBack } from '../../lib/easing';
import { INK, RED, boil, inFace, ink, quad, sizeK } from '../draw';

export const pitchfork: EffectModule = {
  id: 'pitchfork',
  name: 'Pitchfork',
  icon: 'Utensils',
  keywords: ['pitchfork', 'trident', 'fork'],
  duration: 1100,
  category: 'demonic',
  sound: 'whoosh',
  color: RED,
  quip: 'For poking. And for very large salads.',
  anchor: (f) => f.landmarks.rightEar,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const u = face.width * sizeK(intensity);
    const slide = (1 - easeOutBack(progress, 1.4)) * ctx.canvas.width;
    const sway = progress >= 1 ? Math.sin(time / 700) * 0.06 : 0;
    const origin = { x: face.landmarks.rightEar.x + face.width * 0.35 + slide, y: face.centerY };
    const color = meta.color ?? RED;
    const b = boil(time);
    inFace(ctx, face, origin, () => {
      ctx.rotate(0.12 + sway);
      const w = u * 0.03;
      ink(ctx, [{ x: 0, y: u * 1.2 }, { x: 0, y: -u * 0.62 }], { width: w * 1.6, color: INK, seed: b, sketchy: false });
      ink(ctx, [{ x: 0, y: u * 1.2 }, { x: 0, y: -u * 0.62 }], { width: w, color: '#8a5a2b', seed: b + 1, sketchy: false });
      // The business end: a U-shaped crossbar with three barbed tines.
      ink(ctx, quad({ x: -u * 0.2, y: -u * 0.82 }, { x: 0, y: -u * 0.48 }, { x: u * 0.2, y: -u * 0.82 }, 16), { width: w, color, seed: b + 2 });
      const tines: [number, number, number][] = [[-u * 0.2, -u * 0.82, -u * 1.02], [0, -u * 0.64, -u * 1.08], [u * 0.2, -u * 0.82, -u * 1.02]];
      for (const [x, from, top] of tines) {
        ink(ctx, [{ x, y: from }, { x, y: top }], { width: w * 0.9, color, seed: b + x });
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - w * 1.5, top + w * 2.2);
        ctx.lineTo(x, top - w * 2.2);
        ctx.lineTo(x + w * 1.5, top + w * 2.2);
        ctx.closePath();
        ctx.fill();
      }
    });
  },
};
