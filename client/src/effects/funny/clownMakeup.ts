import type { EffectModule } from '../../types';
import { easeOutBack, easeOutElastic, segment } from '../../lib/easing';
import { INK, TAU, dist, inFace, sizeK, toLocal } from '../draw';

export const clownMakeup: EffectModule = {
  id: 'clown-makeup',
  name: 'Clown Makeup',
  icon: 'PartyPopper',
  keywords: ['clown', 'circus', 'clown makeup', 'honk'],
  duration: 2000,
  category: 'funny',
  sound: 'boing',
  quip: 'Honk honk. Your honor, I can explain.',
  anchor: (f) => f.landmarks.noseTip,
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const k = sizeK(intensity);
    const u = face.width;
    const c = { x: face.centerX, y: face.centerY };
    inFace(ctx, face, c, () => {
      // 1. Greasepaint
      const white = segment(progress, 0, 0.3);
      if (white > 0) {
        ctx.save();
        ctx.globalAlpha *= white * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, face.width * 0.48, face.height * 0.58, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      // 2. Blue diamond eyes
      const eyes = segment(progress, 0.3, 0.5);
      const er = dist(L.leftEye, L.rightEye) * 0.2 * k * easeOutBack(eyes);
      for (const e of [L.leftEye, L.rightEye]) {
        const p = toLocal(face, c, e);
        ctx.fillStyle = 'rgba(58,134,255,0.75)';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, u * 0.006);
        for (const dir of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(p.x - er * 0.5, p.y + dir * er * 0.35);
          ctx.lineTo(p.x, p.y + dir * er * 1.8);
          ctx.lineTo(p.x + er * 0.5, p.y + dir * er * 0.35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      // 3. Enormous lips
      const lips = segment(progress, 0.5, 0.75);
      if (lips > 0) {
        const m = toLocal(face, c, L.mouthCenter);
        const hw = Math.abs(toLocal(face, c, L.mouthRightCorner).x - m.x) * 1.7 * k;
        ctx.save();
        ctx.globalAlpha *= 0.85;
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(m.x - hw * lips, m.y - u * 0.02);
        ctx.quadraticCurveTo(m.x - hw * 0.5, m.y - u * 0.1 * k, m.x, m.y - u * 0.05);
        ctx.quadraticCurveTo(m.x + hw * 0.5, m.y - u * 0.1 * k, m.x + hw * lips, m.y - u * 0.02);
        ctx.quadraticCurveTo(m.x + hw * 0.6, m.y + u * 0.16 * k, m.x, m.y + u * 0.13 * k);
        ctx.quadraticCurveTo(m.x - hw * 0.6, m.y + u * 0.16 * k, m.x - hw * lips, m.y - u * 0.02);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, u * 0.01);
        ctx.stroke();
        ctx.restore();
      }
      // 4. The nose. Honks every ~2s.
      const nose = segment(progress, 0.75, 1);
      if (nose > 0) {
        const n = toLocal(face, c, L.noseTip);
        const honk = progress >= 1 ? 1 + Math.max(0, Math.sin(time / 320)) ** 12 * 0.25 : 1;
        const r = u * 0.085 * k * easeOutElastic(nose) * honk;
        const g = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, r * 0.1, n.x, n.y, r);
        g.addColorStop(0, '#ff8a8a');
        g.addColorStop(1, '#d00018');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(n.x, n.y, r * honk, r / honk, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(2, u * 0.01);
        ctx.stroke();
      }
    });
  },
};
