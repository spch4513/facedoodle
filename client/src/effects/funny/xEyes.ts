import type { EffectModule } from '../../types';
import { segment } from '../../lib/easing';
import { INK, boil, dist, inFace, ink, sizeK } from '../draw';

export const xEyes: EffectModule = {
  id: 'x-eyes',
  name: 'X-Eyes',
  icon: 'X',
  keywords: ['x eyes', 'dead eyes', 'x_x', 'dead', 'knocked out', 'ko'],
  duration: 1000,
  category: 'funny',
  sound: 'thud',
  quip: 'Critical hit. Respawning in 3… 2…',
  anchor: (f) => ({ x: (f.landmarks.leftEye.x + f.landmarks.rightEye.x) / 2, y: f.landmarks.leftEye.y }),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const r = dist(L.leftEye, L.rightEye) * 0.22 * sizeK(intensity);
    const color = meta.color ?? INK;
    const b = boil(time);
    [L.leftEye, L.rightEye].forEach((e, i) => {
      inFace(ctx, face, e, () => {
        ink(ctx, [{ x: -r, y: -r }, { x: r, y: r }], { width: r * 0.28, color, seed: b + i, progress: segment(progress, i * 0.5, i * 0.5 + 0.25) });
        ink(ctx, [{ x: r, y: -r }, { x: -r, y: r }], { width: r * 0.28, color, seed: b + i + 5, progress: segment(progress, i * 0.5 + 0.25, i * 0.5 + 0.5) });
      });
    });
  },
};
