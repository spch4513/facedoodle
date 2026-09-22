import type { EffectModule } from '../../types';
import { TAU, flame, sizeK } from '../draw';

export const flameRing: EffectModule = {
  id: 'flame-ring',
  name: 'Flame Ring',
  icon: 'Orbit',
  keywords: ['flame ring', 'ring of fire', 'fire ring', 'johnny cash'],
  duration: 2000,
  category: 'halo',
  sound: 'whoosh',
  quip: 'I fell into a burning ring of fire. Went down, down, down.',
  draw({ ctx, face, progress, time, intensity }) {
    const k = sizeK(intensity);
    const R = Math.max(face.width, face.height) * 0.68 * k;
    const n = 36;
    for (let i = 0; i < n; i++) {
      // Ignites clockwise from the top like a fuse.
      const lit = Math.max(0, Math.min(1, progress * 1.3 * n - i) );
      if (lit <= 0) continue;
      const a = (i / n) * TAU - Math.PI / 2 + time / 5000;
      const x = face.centerX + Math.cos(a) * R;
      const y = face.centerY + Math.sin(a) * R;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);
      flame(ctx, 0, 0, face.width * 0.17 * k, face.width * 0.26 * k * lit, time, i + 50);
      ctx.restore();
    }
  },
};
