import type { EffectModule, Point } from '../../types';
import { segment } from '../../lib/easing';
import { TAU, inFace, partial, quad, rng, sizeK, tracePath } from '../draw';

export const redFacePaint: EffectModule = {
  id: 'red-face-paint',
  name: 'Red Face Paint',
  icon: 'Paintbrush',
  keywords: ['red face', 'face paint', 'paint face', 'war paint', 'paint'],
  duration: 1800,
  category: 'funny',
  sound: 'whoosh',
  color: '#e63946',
  quip: 'Ready for battle. Or a very intense sports game.',
  draw({ ctx, face, progress, intensity, meta }) {
    const u = face.width;
    const k = sizeK(intensity);
    const color = meta.color ?? '#e63946';
    const strokes: [Point, Point, Point][] = [
      [{ x: -0.55, y: -0.05 }, { x: 0, y: 0.15 }, { x: 0.55, y: -0.05 }],
      [{ x: -0.5, y: 0.2 }, { x: -0.2, y: 0.12 }, { x: -0.05, y: 0.28 }],
      [{ x: 0.5, y: 0.2 }, { x: 0.2, y: 0.12 }, { x: 0.05, y: 0.28 }],
      [{ x: -0.3, y: -0.45 }, { x: 0, y: -0.3 }, { x: 0.3, y: -0.45 }],
    ];
    inFace(ctx, face, { x: face.centerX, y: face.centerY }, () => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, face.width * 0.52, face.height * 0.6, 0, 0, TAU);
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      strokes.forEach(([a, c, b], i) => {
        const t = segment(progress, i * 0.2, i * 0.2 + 0.35);
        if (t <= 0) return;
        const path = partial(quad({ x: a.x * u, y: a.y * u }, { x: c.x * u, y: c.y * u }, { x: b.x * u, y: b.y * u }, 30), t);
        const r = rng(i + 1);
        // Bristles: lots of thin offset strokes read as a real brush.
        for (let j = 0; j < 14; j++) {
          const off = (j / 13 - 0.5) * u * 0.14 * k;
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.25 + r() * 0.35;
          ctx.lineWidth = u * (0.008 + r() * 0.012) * k;
          ctx.lineCap = 'round';
          tracePath(ctx, path.map((p, n) => ({ x: p.x + (r() - 0.5) * 2, y: p.y + off + Math.sin(n * 0.7 + j) * 1.5 })));
          ctx.stroke();
        }
      });
      ctx.restore();
    });
  },
};
