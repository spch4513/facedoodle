import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { INK, TAU, dist, inFace, mid, sizeK } from '../draw';

export const thirdEye: EffectModule = {
  id: 'third-eye',
  name: 'Third Eye',
  icon: 'ScanEye',
  keywords: ['third eye', 'extra eye', 'all seeing', 'enlightened'],
  duration: 1600,
  category: 'funny',
  sound: 'chime',
  quip: 'Now seeing your browser history. Yikes.',
  anchor: (f) => mid(f.landmarks.foreheadCenter, mid(f.landmarks.leftBrow, f.landmarks.rightBrow)),
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const origin = mid(L.foreheadCenter, mid(L.leftBrow, L.rightBrow));
    const w = dist(L.leftEye, L.rightEye) * 0.32 * sizeK(intensity);
    // Opens slowly, then blinks every ~3.2s like it's judging you.
    const blinkPhase = (time % 3200) / 3200;
    const blink = progress < 1 ? 1 : blinkPhase > 0.94 ? Math.abs(blinkPhase - 0.97) / 0.03 : 1;
    const open = easeOutCubic(progress) * blink;
    const h = w * 0.55 * open;
    inFace(ctx, face, origin, () => {
      ctx.fillStyle = '#fffdf5';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(2, w * 0.08);
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.quadraticCurveTo(0, -h * 1.6, w, 0);
      ctx.quadraticCurveTo(0, h * 1.6, -w, 0);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.clip();
      const look = Math.sin(time / 900) * w * 0.35;
      ctx.fillStyle = '#7b2cbf';
      ctx.beginPath();
      ctx.arc(look, 0, w * 0.42, 0, TAU);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(look, 0, w * 0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(look - w * 0.1, -w * 0.1, w * 0.07, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.stroke();
      // Lashes, for drama.
      for (let i = -2; i <= 2; i++) {
        const x = (i / 2.5) * w * 0.8;
        const y = -h * 0.8 * (1 - (x / w) ** 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x * 1.2, y - w * 0.28 * open);
        ctx.stroke();
      }
    });
  },
};
