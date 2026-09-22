import type { EffectModule, Point } from '../../types';
import { segment } from '../../lib/easing';
import { TAU, boil, circlePts, glow, inFace, ink, mid, sizeK } from '../draw';

export const pentagram: EffectModule = {
  id: 'pentagram',
  name: 'Pentagram Forehead',
  icon: 'Star',
  keywords: ['pentagram', 'forehead star', 'occult'],
  duration: 1800,
  category: 'demonic',
  sound: 'cackle',
  color: '#ff2d3d',
  quip: 'Forehead now doubles as a portal. Please wipe feet.',
  anchor: (f) => mid(f.landmarks.foreheadCenter, mid(f.landmarks.leftBrow, f.landmarks.rightBrow)),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const origin = mid(L.foreheadCenter, mid(L.leftBrow, L.rightBrow));
    const r = face.width * 0.12 * sizeK(intensity);
    const color = meta.color ?? '#ff2d3d';
    const b = boil(time);
    const flicker = progress >= 1 ? 0.75 + Math.sin(time / 130) * 0.15 + Math.sin(time / 47) * 0.1 : 1;
    inFace(ctx, face, origin, () => {
      ctx.globalAlpha *= flicker;
      glow(ctx, color, r * 0.6);
      const star: Point[] = [];
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + ((i * 2) % 5) * (TAU / 5);
        star.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      for (let i = 0; i < 5; i++) {
        ink(ctx, [star[i], star[(i + 1) % 5]], {
          width: r * 0.08,
          color,
          seed: b + i,
          progress: segment(progress, i * 0.12, i * 0.12 + 0.14),
        });
      }
      ink(ctx, circlePts(0, 0, r * 1.08, 40), { width: r * 0.07, color, seed: b + 9, progress: segment(progress, 0.6, 1) });
    });
  },
};
