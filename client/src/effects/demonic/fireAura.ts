import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { TAU, flame, rng, sizeK } from '../draw';

export const fireAura: EffectModule = {
  id: 'fire-aura',
  name: 'Fire Aura',
  icon: 'Flame',
  keywords: ['fire', 'flames', 'burning', 'on fire', 'hot'],
  duration: 1800,
  category: 'demonic',
  sound: 'whoosh',
  quip: 'This is fine. 🔥',
  draw({ ctx, face, progress, time, intensity }) {
    const k = sizeK(intensity);
    const rx = face.width * 0.68;
    const ry = face.height * 0.72;
    const n = 26;
    const r = rng(42);
    ctx.save();
    ctx.globalAlpha *= 0.9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r() * 0.1;
      const lx = Math.cos(a) * rx;
      const ly = Math.sin(a) * ry;
      const c = Math.cos(face.rotation);
      const s = Math.sin(face.rotation);
      const x = face.centerX + lx * c - ly * s;
      const y = face.centerY + lx * s + ly * c;
      // Bottom flames ignite first, then it climbs the head.
      const order = (1 - (Math.sin(a) + 1) / 2) * 0.6;
      const g = easeOutCubic(Math.max(0, Math.min(1, (progress - order) / 0.4)));
      if (g <= 0) continue;
      const h = face.width * (0.28 + r() * 0.2) * k * g;
      flame(ctx, x, y, face.width * 0.13 * k, h, time, i + 1);
    }
    ctx.restore();
  },
};
