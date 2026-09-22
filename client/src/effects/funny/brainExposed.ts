import type { EffectModule, Point } from '../../types';
import { easeOutBack, segment } from '../../lib/easing';
import { INK, TAU, boil, inFace, ink, sizeK } from '../draw';

export const brainExposed: EffectModule = {
  id: 'brain-exposed',
  name: 'Brain Exposed',
  icon: 'Brain',
  keywords: ['brain', 'big brain', 'galaxy brain', 'exposed brain', 'skull'],
  duration: 1800,
  category: 'funny',
  sound: 'pbbt',
  color: '#ff9eb5',
  quip: 'Big brain energy, now with extra ventilation.',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const u = face.width * sizeK(intensity);
    const color = meta.color ?? '#ff9eb5';
    const b = boil(time);
    const origin = { x: face.landmarks.foreheadCenter.x, y: face.landmarks.foreheadCenter.y };
    inFace(ctx, face, origin, () => {
      const crack: Point[] = [
        { x: -u * 0.3, y: -u * 0.05 },
        { x: -u * 0.2, y: u * 0.01 },
        { x: -u * 0.12, y: -u * 0.04 },
        { x: -u * 0.02, y: u * 0.03 },
        { x: u * 0.08, y: -u * 0.03 },
        { x: u * 0.18, y: u * 0.02 },
        { x: u * 0.3, y: -u * 0.05 },
      ];
      const c = segment(progress, 0, 0.35);
      const grow = easeOutBack(segment(progress, 0.3, 1), 1.6);
      if (grow > 0) {
        const pulse = 1 + Math.sin(time / 260) * 0.04;
        ctx.save();
        ctx.translate(0, -u * 0.12);
        ctx.scale(grow * pulse, grow * pulse);
        ctx.fillStyle = color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, u * 0.012);
        ctx.beginPath();
        ctx.ellipse(0, 0, u * 0.3, u * 0.18, 0, Math.PI, TAU);
        ctx.quadraticCurveTo(0, u * 0.12, -u * 0.3, 0);
        ctx.fill();
        ctx.stroke();
        // Gyri squiggles. Science.
        for (let i = 0; i < 6; i++) {
          const x0 = -u * 0.24 + i * u * 0.09;
          const pts: Point[] = [];
          for (let s = 0; s <= 8; s++) pts.push({ x: x0 + Math.sin(s * 1.3 + i) * u * 0.025, y: -u * 0.14 + s * u * 0.017 });
          ink(ctx, pts, { width: Math.max(1.2, u * 0.008), color: '#c9426a', seed: b + i, sketchy: false });
        }
        ink(ctx, [{ x: 0, y: -u * 0.17 }, { x: 0, y: u * 0.02 }], { width: Math.max(1.5, u * 0.01), color: '#c9426a', seed: b });
        ctx.restore();
      }
      ink(ctx, crack, { width: u * 0.018, color: INK, seed: b + 3, progress: c });
    });
  },
};
