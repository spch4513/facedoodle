import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { TAU, dist, sizeK } from '../draw';

export const glowingEyes: EffectModule = {
  id: 'glowing-eyes',
  name: 'Glowing Red Eyes',
  icon: 'Eye',
  keywords: ['red eyes', 'glowing eyes', 'evil eyes', 'glowing', 'possessed'],
  duration: 1200,
  category: 'demonic',
  sound: 'zap',
  color: '#ff1e2d',
  quip: 'Eyes set to "reply-all rage" mode.',
  anchor: (f) => ({ x: (f.landmarks.leftEye.x + f.landmarks.rightEye.x) / 2, y: f.landmarks.leftEye.y }),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const r = dist(L.leftEye, L.rightEye) * 0.16 * sizeK(intensity);
    const fill = easeOutCubic(progress);
    const pulse = progress < 1 ? 1 : 1 + Math.sin(time / 220) * 0.18;
    const color = meta.color ?? '#ff1e2d';
    for (const e of [L.leftEye, L.rightEye]) {
      const aura = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 3.2 * pulse);
      aura.addColorStop(0, color);
      aura.addColorStop(0.35, 'rgba(255,30,45,0.45)');
      aura.addColorStop(1, 'rgba(255,30,45,0)');
      ctx.save();
      ctx.globalAlpha *= fill;
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r * 3.2 * pulse, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.arc(e.x, e.y, r, -Math.PI / 2, -Math.PI / 2 + TAU * fill);
      ctx.closePath();
      ctx.fill();
      // Slit pupil. Classic.
      ctx.fillStyle = '#1a0006';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, r * 0.18 * fill, r * 0.8 * fill, face.rotation, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(e.x - r * 0.35, e.y - r * 0.35, r * 0.16 * fill, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  },
};
