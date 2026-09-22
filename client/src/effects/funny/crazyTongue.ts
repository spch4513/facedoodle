import type { EffectModule, Point } from '../../types';
import { easeOutBack } from '../../lib/easing';
import { INK, TAU, inFace, sizeK, tracePath } from '../draw';

export const crazyTongue: EffectModule = {
  id: 'crazy-tongue',
  name: 'Crazy Tongue',
  icon: 'Smile',
  keywords: ['tongue', 'crazy tongue', 'blep', 'lick'],
  duration: 1100,
  category: 'funny',
  sound: 'pbbt',
  color: '#ff7aa2',
  quip: 'Blep. Absolutely unhinged blep.',
  anchor: (f) => f.landmarks.mouthCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const u = face.width * sizeK(intensity);
    const ext = easeOutBack(progress, 1.8);
    const len = u * 0.7 * ext;
    const w = u * 0.16;
    const color = meta.color ?? '#ff7aa2';
    inFace(ctx, face, face.landmarks.mouthCenter, () => {
      ctx.fillStyle = '#3b0a14';
      ctx.beginPath();
      ctx.ellipse(0, 0, u * 0.12, u * 0.05 + u * 0.02 * ext, 0, 0, TAU);
      ctx.fill();
      const pts: Point[] = [];
      for (let i = 0; i <= 20; i++) {
        const f = i / 20;
        pts.push({ x: Math.sin(time / 110 - f * 5) * f * f * u * 0.16, y: f * len });
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = INK;
      ctx.lineWidth = w + Math.max(3, u * 0.02);
      tracePath(ctx, pts);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      tracePath(ctx, pts);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(160,30,70,0.6)';
      ctx.lineWidth = Math.max(1.5, u * 0.012);
      tracePath(ctx, pts.slice(1, -2));
      ctx.stroke();
    });
  },
};
