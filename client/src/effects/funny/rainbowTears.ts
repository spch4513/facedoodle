import type { EffectModule } from '../../types';
import { TAU, dist, inFace, sizeK, toLocal } from '../draw';

export const rainbowTears: EffectModule = {
  id: 'rainbow-tears',
  name: 'Rainbow Tears',
  icon: 'Rainbow',
  keywords: ['tears', 'crying', 'cry', 'sad', 'rainbow'],
  duration: 1200,
  category: 'funny',
  sound: 'chime',
  quip: 'Crying, but make it fabulous.',
  anchor: (f) => f.landmarks.leftEye,
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const k = sizeK(intensity);
    const er = dist(L.leftEye, L.rightEye) * 0.12;
    for (const [i, eye] of [L.leftEye, L.rightEye].entries()) {
      inFace(ctx, face, eye, () => {
        const fall = toLocal(face, eye, L.chin).y + face.width * 0.35;
        const drift = (i === 0 ? -1 : 1) * face.width * 0.04;
        // Stream: a rainbow ribbon of stacked lines.
        const reach = fall * Math.min(1, progress * 1.3);
        const bands = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
        bands.forEach((col, b) => {
          ctx.strokeStyle = col;
          ctx.globalAlpha = 0.75;
          ctx.lineWidth = er * 0.28 * k;
          ctx.lineCap = 'round';
          ctx.beginPath();
          const off = (b - 2) * er * 0.26 * k;
          for (let s = 0; s <= 24; s++) {
            const y = er + (s / 24) * reach;
            const x = off + drift * (y / fall) + Math.sin(y / (face.width * 0.08) - time / 200) * er * 0.25;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
        // Drops tumbling down the ribbon.
        if (progress >= 0.6) {
          for (let d = 0; d < 3; d++) {
            const t = ((time / 1400 + d / 3 + i * 0.17) % 1);
            const y = er + t * fall;
            const x = drift * t;
            ctx.fillStyle = `hsl(${(time / 5 + d * 120) % 360} 90% 60%)`;
            ctx.beginPath();
            ctx.arc(x, y, er * 0.55 * k, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = Math.max(1, er * 0.1);
            ctx.stroke();
          }
        }
      });
    }
  },
};
