import type { EffectModule } from '../../types';
import { INK, TAU, inFace, sizeK, toLocal } from '../draw';

export const snotBubble: EffectModule = {
  id: 'snot-bubble',
  name: 'Snot Bubble',
  icon: 'CircleDashed',
  keywords: ['snot', 'booger', 'snot bubble', 'sneeze', 'bogey'],
  duration: 800,
  category: 'funny',
  sound: 'pbbt',
  color: '#8fd14f',
  quip: 'Gross. Iconic. Grossly iconic.',
  anchor: (f) => f.landmarks.noseTip,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const color = meta.color ?? '#8fd14f';
    const period = 2400;
    const phase = (time % period) / period;
    inFace(ctx, face, L.noseTip, () => {
      const lip = toLocal(face, L.noseTip, L.upperLip);
      const nostril = { x: u * 0.05, y: lip.y * 0.3 };
      // Drip strand, always there. Always.
      ctx.strokeStyle = color;
      ctx.lineWidth = u * 0.018;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nostril.x, nostril.y);
      ctx.quadraticCurveTo(nostril.x + u * 0.01, nostril.y + u * 0.06 * progress, nostril.x - u * 0.005, nostril.y + u * 0.09 * progress);
      ctx.stroke();
      if (phase < 0.85) {
        const r = u * 0.16 * (phase / 0.85) * progress;
        const bx = nostril.x + r * 0.95;
        const by = nostril.y + r * 0.15;
        ctx.fillStyle = 'rgba(143,209,79,0.45)';
        ctx.strokeStyle = 'rgba(70,130,30,0.9)';
        ctx.lineWidth = Math.max(1.5, u * 0.008);
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(bx - r * 0.35, by - r * 0.4, r * 0.22, r * 0.12, -0.6, 0, TAU);
        ctx.fill();
      } else {
        // POP! Splatter lines.
        const t = (phase - 0.85) / 0.15;
        const r = u * 0.16 * progress;
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1.5, u * 0.01);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          ctx.beginPath();
          ctx.moveTo(nostril.x + r + Math.cos(a) * r * (0.6 + t * 0.6), nostril.y + Math.sin(a) * r * (0.6 + t * 0.6));
          ctx.lineTo(nostril.x + r + Math.cos(a) * r * (0.9 + t), nostril.y + Math.sin(a) * r * (0.9 + t));
          ctx.stroke();
        }
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.round(u * 0.07)}px "Permanent Marker", cursive`;
        ctx.fillText('POP!', nostril.x + r * 1.4, nostril.y - r * 0.6);
      }
    });
  },
};
