import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { dist, inFace, mid, sizeK } from '../draw';

export const dealWithIt: EffectModule = {
  id: 'deal-with-it',
  name: 'Deal With It',
  icon: 'Glasses',
  keywords: ['sunglasses', 'shades', 'deal with it', 'cool', 'glasses'],
  duration: 1500,
  category: 'funny',
  sound: 'thud',
  quip: '( •_•)>⌐■-■  (⌐■_■)',
  anchor: (f) => mid(f.landmarks.leftEye, f.landmarks.rightEye),
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const c = mid(L.leftEye, L.rightEye);
    const d = dist(L.leftEye, L.rightEye);
    const px = Math.max(3, Math.round(d * 0.085 * sizeK(intensity)));
    const drop = (1 - easeOutCubic(progress)) * (c.y + px * 12);
    // 1 = black, 2 = white glint. Pixel art, 20 × 4.
    const rows = [
      '11111111111111111111',
      '01211111100122111110',
      '00121111000012111100',
      '00011110000001111000',
    ];
    inFace(ctx, face, { x: c.x, y: c.y - drop }, () => {
      const w = rows[0].length * px;
      rows.forEach((row, y) =>
        [...row].forEach((cell, x) => {
          if (cell === '0') return;
          ctx.fillStyle = cell === '1' ? '#000' : '#fff';
          ctx.fillRect(x * px - w / 2, (y - 1) * px, px + 0.5, px + 0.5);
        }),
      );
      if (progress >= 1 && (time % 3000) < 1500) {
        ctx.fillStyle = '#000';
        ctx.font = `bold ${px * 3}px "Permanent Marker", cursive`;
        ctx.textAlign = 'center';
        ctx.fillText('DEAL WITH IT', 0, px * 10);
      }
    });
  },
};
