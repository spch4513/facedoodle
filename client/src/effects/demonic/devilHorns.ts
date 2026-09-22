import type { EffectModule, Point } from '../../types';
import { easeOutBack } from '../../lib/easing';
import { INK, RED, blob, boil, hatch, inFace, ink, quad, sizeK } from '../draw';

export const devilHorns: EffectModule = {
  id: 'devil-horns',
  name: 'Devil Horns',
  icon: 'Flame',
  keywords: ['horns', 'devil', 'demon', 'devil horns'],
  duration: 1400,
  category: 'demonic',
  sound: 'growl',
  color: RED,
  quip: 'Horns installed. Therapy not included.',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const u = face.width * sizeK(intensity);
    const g = easeOutBack(progress, 2.2);
    const color = meta.color ?? RED;
    const b = boil(time);
    inFace(ctx, face, face.landmarks.foreheadCenter, () => {
      for (const s of [-1, 1]) {
        const base: Point = { x: s * 0.28 * u, y: 0.02 * u };
        const pts = (p: Point): Point => ({ x: base.x + (p.x - base.x) * g, y: base.y + (p.y - base.y) * g });
        const b1 = { x: s * 0.2 * u, y: 0.04 * u };
        const b2 = { x: s * 0.34 * u, y: 0.01 * u };
        const tip = { x: s * 0.36 * u, y: -0.5 * u };
        const outer = quad(b2, { x: s * 0.62 * u, y: -0.12 * u }, tip, 14).map(pts);
        const inner = quad(tip, { x: s * 0.36 * u, y: -0.12 * u }, b1, 14).map(pts);
        const shape = [...outer, ...inner];
        blob(ctx, shape, color, { width: Math.max(2, u * 0.018), seed: b + s * 7, wobble: u * 0.008 });
        hatch(ctx, shape, 'rgba(26,26,46,0.22)', u * 0.045, 11 + s);
        // A few "ridges" so the horns look like they've been through things.
        for (let i = 1; i <= 3; i++) {
          const t = i / 4;
          const o = outer[Math.round(t * 14)];
          const n = inner[14 - Math.round(t * 14)];
          ink(ctx, [o, n], { width: u * 0.01, color: INK, seed: b + i, progress: g });
        }
      }
    });
  },
};
