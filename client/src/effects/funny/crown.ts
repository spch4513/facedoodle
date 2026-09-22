import type { EffectModule, Point } from '../../types';
import { easeOutBounce } from '../../lib/easing';
import { GOLD, TAU, blob, boil, hatch, inFace, sizeK } from '../draw';

export const crown: EffectModule = {
  id: 'crown',
  name: 'Crown',
  icon: 'Crown',
  keywords: ['crown', 'king', 'queen', 'royal', 'royalty'],
  duration: 1300,
  category: 'funny',
  sound: 'thud',
  color: '#ffc93c',
  quip: 'All hail the ruler of absolutely nothing.',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const u = face.width * sizeK(intensity);
    const drop = (1 - easeOutBounce(progress)) * (face.landmarks.foreheadCenter.y + u);
    const color = meta.color ?? '#ffc93c';
    const b = boil(time);
    const origin = { x: face.landmarks.foreheadCenter.x, y: face.landmarks.foreheadCenter.y - drop };
    inFace(ctx, face, origin, () => {
      const w = u * 0.36;
      const h = u * 0.34;
      const top = -h - u * 0.08;
      const shape: Point[] = [
        { x: -w, y: -u * 0.06 },
        { x: -w * 1.05, y: top },
        { x: -w * 0.5, y: top + h * 0.45 },
        { x: 0, y: top - h * 0.2 },
        { x: w * 0.5, y: top + h * 0.45 },
        { x: w * 1.05, y: top },
        { x: w, y: -u * 0.06 },
      ];
      blob(ctx, shape, color, { width: Math.max(2, u * 0.014), seed: b, wobble: u * 0.006 });
      hatch(ctx, shape, 'rgba(180,110,20,0.35)', u * 0.03, 4);
      const jewels = ['#e63946', '#3a86ff', '#2ec4b6'];
      [-0.55, 0, 0.55].forEach((f, i) => {
        ctx.fillStyle = jewels[i];
        ctx.beginPath();
        ctx.arc(f * w, -h * 0.35, u * 0.035, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = Math.max(1, u * 0.006);
        ctx.stroke();
      });
      // Sparkles take turns showing off.
      for (const [i, p] of [shape[1], shape[3], shape[5]].entries()) {
        const tw = Math.max(0, Math.sin(time / 260 + i * 2.1));
        const s = u * 0.05 * tw;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = Math.max(1.5, u * 0.008);
        ctx.beginPath();
        ctx.moveTo(p.x - s, p.y - s * 0.4); ctx.lineTo(p.x + s, p.y - s * 0.4);
        ctx.moveTo(p.x, p.y - s * 1.4); ctx.lineTo(p.x, p.y + s * 0.6);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y - s * 0.4, s * 0.25, 0, TAU);
        ctx.fill();
      }
    });
  },
};
