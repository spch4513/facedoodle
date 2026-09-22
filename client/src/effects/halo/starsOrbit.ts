import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { INK, TAU, sizeK } from '../draw';
import { haloPoint } from './haloFrame';

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = spin + (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export const starsOrbit: EffectModule = {
  id: 'stars-orbit',
  name: 'Stars Orbit',
  icon: 'Sparkles',
  keywords: ['stars', 'star', 'dizzy stars', 'sparkles', 'seeing stars'],
  duration: 1600,
  category: 'halo',
  sound: 'chime',
  color: '#ffd166',
  quip: 'Bonk. Seeing stars. Classic cartoon concussion.',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const k = sizeK(intensity);
    const color = meta.color ?? '#ffd166';
    const n = 5;
    const spiral = 1 + (1 - easeOutCubic(progress)) * 2.5;
    for (let i = 0; i < n; i++) {
      const base = (i / n) * TAU;
      // Trails: a few ghost copies behind each star.
      for (let tr = 4; tr >= 0; tr--) {
        const a = base + (time - tr * 45) / 600;
        const p = haloPoint(face, a, face.width * 0.5 * k * spiral, face.width * 0.13 * k * spiral, face.width * 0.2);
        const r = face.width * 0.055 * k * (1 - tr * 0.15);
        ctx.save();
        ctx.globalAlpha *= tr === 0 ? 1 : 0.18 * (1 - tr / 5);
        star(ctx, p.x, p.y, r, time / 300 + i);
        ctx.fillStyle = color;
        ctx.fill();
        if (tr === 0) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.5, r * 0.15);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  },
};
