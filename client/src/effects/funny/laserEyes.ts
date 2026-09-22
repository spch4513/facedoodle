import type { EffectModule } from '../../types';
import { easeOutCubic } from '../../lib/easing';
import { TAU, dist, sizeK } from '../draw';

export const laserEyes: EffectModule = {
  id: 'laser-eyes',
  name: 'Laser Eyes',
  icon: 'Crosshair',
  keywords: ['laser', 'lasers', 'laser eyes', 'beam', 'pew'],
  duration: 800,
  category: 'funny',
  sound: 'zap',
  color: '#ff1e2d',
  quip: 'Pew pew. HR has been notified.',
  anchor: (f) => mid2(f.landmarks.leftEye, f.landmarks.rightEye),
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const w = dist(L.leftEye, L.rightEye) * 0.12 * sizeK(intensity);
    const reach = Math.hypot(ctx.canvas.width, ctx.canvas.height) * easeOutCubic(progress);
    const color = meta.color ?? '#ff1e2d';
    const wobble = Math.sin(time / 60) * w * 0.15;
    const dir = face.rotation + Math.PI * 0.08;
    [L.leftEye, L.rightEye].forEach((e, i) => {
      const a = dir + (i === 0 ? Math.PI * 0.84 : 0);
      const ex = e.x + Math.cos(a) * reach;
      const ey = e.y + Math.sin(a) * reach;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.globalAlpha *= 0.55;
      ctx.lineWidth = w * 2.4 + wobble;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha /= 0.55;
      ctx.strokeStyle = '#fff5f5';
      ctx.lineWidth = w * 0.8;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(e.x, e.y, w * 1.3 + wobble, 0, TAU);
      ctx.fill();
      ctx.restore();
    });
  },
};

function mid2(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
