import type { EffectModule } from '../../types';
import { easeOutBack } from '../../lib/easing';
import { TAU, glow, inFace, sizeK } from '../draw';

export const angelHalo: EffectModule = {
  id: 'angel-halo',
  name: 'Angel Halo',
  icon: 'CircleDot',
  keywords: ['angel', 'halo', 'angel halo', 'holy', 'saint', 'innocent'],
  duration: 1500,
  category: 'halo',
  sound: 'chime',
  color: '#ffd166',
  quip: 'Totally innocent. Ignore everything else on this face.',
  anchor: (f) => f.landmarks.foreheadCenter,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const k = sizeK(intensity);
    const g = easeOutBack(progress, 1.5);
    const color = meta.color ?? '#ffd166';
    const bob = Math.sin(time / 600) * face.width * 0.02;
    const origin = { x: face.landmarks.foreheadCenter.x, y: face.landmarks.foreheadCenter.y };
    inFace(ctx, face, origin, () => {
      ctx.translate(0, -face.width * 0.32 + bob);
      const rx = face.width * 0.38 * k * g;
      const ry = face.width * 0.09 * k * g;
      ctx.globalAlpha *= Math.min(1, progress * 2);
      glow(ctx, color, face.width * 0.08);
      ctx.strokeStyle = color;
      ctx.lineWidth = face.width * 0.04 * k;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // A glint that orbits the ring.
      const a = time / 700;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rx, Math.sin(a) * ry, face.width * 0.02 * k, 0, TAU);
      ctx.fill();
    });
  },
};
