import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { INK, TAU, rng, sizeK } from '../draw';

export const beeSwarm: EffectModule = {
  id: 'bee-swarm',
  name: 'Bee Swarm',
  icon: 'Bug',
  keywords: ['bees', 'bee', 'swarm', 'buzz', 'bee swarm'],
  duration: 1400,
  category: 'halo',
  sound: 'pbbt',
  quip: 'Not the bees! NOT THE BEES!',
  draw({ ctx, face, progress, time, intensity }) {
    const k = sizeK(intensity);
    const n = 12;
    const r = rng(9);
    for (let i = 0; i < n; i++) {
      const sp = 0.0015 + r() * 0.002;
      const dirn = r() > 0.5 ? 1 : -1;
      const a = r() * TAU + time * sp * dirn;
      const zig = Math.sin(time / 70 + i * 4) * face.width * 0.05;
      const R = face.width * (0.55 + r() * 0.35) * k;
      const t = easeOutCubic(Math.max(0, Math.min(1, progress * 1.5 - i * 0.03)));
      const cx = face.centerX;
      const cy = face.centerY - face.height * 0.1;
      const x = cx + Math.cos(a) * R * (0.4 + t * 0.6) * (1 + (1 - t) * 2) + zig;
      const y = cy + Math.sin(a) * R * 0.8 * (1 + (1 - t) * 2) + Math.cos(time / 55 + i) * face.width * 0.03;
      const s = face.width * 0.035 * k;
      const heading = a + (dirn > 0 ? Math.PI / 2 : -Math.PI / 2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(heading);
      // Wings
      ctx.fillStyle = 'rgba(210,235,255,0.85)';
      const flap = Math.abs(Math.sin(time / 25 + i)) * 0.6 + 0.4;
      ctx.beginPath();
      ctx.ellipse(-s * 0.2, -s * 0.9, s * 0.45, s * 0.7 * flap, -0.4, 0, TAU);
      ctx.ellipse(s * 0.2, -s * 0.9, s * 0.45, s * 0.7 * flap, 0.4, 0, TAU);
      ctx.fill();
      // Body with stripes
      ctx.fillStyle = '#ffc93c';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1, s * 0.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.65, 0, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = INK;
      ctx.fillRect(-s * 0.35, -s, s * 0.25, s * 2);
      ctx.fillRect(s * 0.15, -s, s * 0.25, s * 2);
      ctx.restore();
      ctx.stroke();
      ctx.restore();
    }
  },
};
