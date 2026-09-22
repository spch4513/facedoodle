import type { EffectModule } from '../../types';
import { TAU, sizeK } from '../draw';

export const smokeFromEars: EffectModule = {
  id: 'smoke-ears',
  name: 'Smoke from Ears',
  icon: 'Wind',
  keywords: ['smoke', 'steam', 'fuming', 'smoke from ears'],
  duration: 1000,
  category: 'demonic',
  sound: 'pbbt',
  quip: 'Brain.exe has stopped responding.',
  draw({ ctx, face, progress, time, intensity }) {
    const u = face.width * sizeK(intensity);
    const L = face.landmarks;
    const puffs = 7;
    const up = { x: Math.sin(face.rotation), y: -Math.cos(face.rotation) };
    ctx.save();
    for (const [ear, side] of [[L.leftEar, -1], [L.rightEar, 1]] as const) {
      for (let i = 0; i < puffs; i++) {
        const t = ((time / 1800 + i / puffs) % 1);
        const rise = t * u * 0.9;
        const drift = side * (t * u * 0.35 + Math.sin(t * 7 + i) * u * 0.05);
        const x = ear.x + up.x * rise + drift * Math.cos(face.rotation);
        const y = ear.y + up.y * rise + drift * Math.sin(face.rotation);
        const rad = u * (0.04 + t * 0.13);
        ctx.globalAlpha = (1 - t) * 0.8 * progress;
        ctx.fillStyle = '#d9d9d9';
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = Math.max(1, u * 0.006);
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};
