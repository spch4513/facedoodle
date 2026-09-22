import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { INK, TAU, rng, sizeK } from '../draw';
import { haloPoint } from './haloFrame';

export const birdHalo: EffectModule = {
  id: 'bird-halo',
  name: 'Bird Halo',
  icon: 'Bird',
  keywords: ['birds', 'crows', 'ravens', 'halo of birds', 'bird halo', 'tweety', 'dizzy'],
  duration: 1800,
  category: 'halo',
  sound: 'cackle',
  quip: 'Caw. Caw. (Translation: you owe us bread.)',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const k = sizeK(intensity);
    const n = 8;
    const r = rng(3);
    const color = meta.color ?? INK;
    const rx = face.width * 0.62 * k;
    const ry = face.width * 0.16 * k;
    const lift = face.width * 0.22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + time / 1400;
      const target = haloPoint(face, a, rx, ry, lift);
      const t = easeOutCubic(Math.max(0, Math.min(1, progress * 1.4 - i * 0.05)));
      const from = { x: target.x + Math.cos(a) * ctx.canvas.width, y: target.y + Math.sin(a) * ctx.canvas.height - ctx.canvas.height * 0.3 };
      const x = from.x + (target.x - from.x) * t;
      const y = from.y + (target.y - from.y) * t;
      // Birds at the back of the ring are smaller + fainter: cheap 3D.
      const depth = 0.7 + 0.3 * Math.sin(a);
      const s = face.width * 0.12 * k * depth * (0.8 + r() * 0.3);
      const flap = Math.sin(time / 110 + i * 1.7);
      ctx.save();
      ctx.globalAlpha *= 0.6 + 0.4 * depth;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(1.5, s * 0.22);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * 0.4 * flap);
      ctx.quadraticCurveTo(x - s * 0.45, y - s * (0.2 + 0.5 * flap), x, y);
      ctx.quadraticCurveTo(x + s * 0.45, y - s * (0.2 + 0.5 * flap), x + s, y - s * 0.4 * flap);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.08, s * 0.22, s * 0.14, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  },
};
