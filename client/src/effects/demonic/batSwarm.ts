import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { TAU, bat, rng, sizeK } from '../draw';

export const batSwarm: EffectModule = {
  id: 'bat-swarm',
  name: 'Bat Swarm',
  icon: 'Bird',
  keywords: ['bats', 'bat', 'bat swarm'],
  duration: 1600,
  category: 'demonic',
  sound: 'cackle',
  quip: 'The bats have unionized. They demand snacks.',
  draw({ ctx, face, progress, time, intensity }) {
    const k = sizeK(intensity);
    const n = 9;
    const r = rng(7);
    const W = ctx.canvas.width;
    for (let i = 0; i < n; i++) {
      const phase = r() * TAU;
      const speed = 0.0009 + r() * 0.0006;
      const a = phase + time * speed;
      const rx = face.width * (0.75 + r() * 0.25);
      const ry = face.height * (0.45 + r() * 0.2);
      const tx = face.centerX + Math.cos(a) * rx;
      const ty = face.centerY - face.height * 0.35 + Math.sin(a) * ry + Math.sin(time / 180 + i) * face.width * 0.03;
      const t = easeOutCubic(Math.max(0, Math.min(1, progress * 1.5 - i * 0.05)));
      const sx = i % 2 ? W + 80 : -80;
      const sy = r() * ctx.canvas.height * 0.4;
      const x = sx + (tx - sx) * t;
      const y = sy + (ty - sy) * t;
      bat(ctx, x, y, face.width * 0.15 * k * (0.7 + r() * 0.5), time / 140 + phase);
    }
  },
};
