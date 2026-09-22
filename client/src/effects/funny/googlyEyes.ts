import type { EffectModule } from '../../types';
import { easeOutElastic } from '../../lib/easing';
import { INK, TAU, dist, sizeK } from '../draw';

export const googlyEyes: EffectModule = {
  id: 'googly-eyes',
  name: 'Googly Eyes',
  icon: 'Eye',
  keywords: ['googly', 'googly eyes', 'wobbly eyes', 'silly eyes'],
  duration: 900,
  category: 'funny',
  sound: 'boing',
  quip: 'Instantly 400% more trustworthy.',
  anchor: (f) => ({ x: (f.landmarks.leftEye.x + f.landmarks.rightEye.x) / 2, y: f.landmarks.leftEye.y }),
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const R = dist(L.leftEye, L.rightEye) * 0.3 * sizeK(intensity) * easeOutElastic(progress);
    [L.leftEye, L.rightEye].forEach((e, i) => {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(2, R * 0.1);
      ctx.beginPath();
      ctx.arc(e.x, e.y, R, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Damped chaos: pupils roll around like marbles in a cereal bowl.
      const a = Math.sin(time / (330 + i * 70)) * 2.2 + Math.sin(time / 190 + i) * 0.8 + Math.PI / 2;
      const d = R * 0.42;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, R * 0.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(e.x - R * 0.45, e.y - R * 0.45, R * 0.14, 0, TAU);
      ctx.fill();
    });
  },
};
