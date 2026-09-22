import type { EffectModule, Point } from '../../types';
import { easeOutBack, segment } from '../../lib/easing';
import { RED, TAU, blob, inFace, sizeK, toLocal } from '../draw';

export const vampireFangs: EffectModule = {
  id: 'vampire-fangs',
  name: 'Vampire Fangs',
  icon: 'Droplet',
  keywords: ['fangs', 'teeth', 'vampire', 'dracula'],
  duration: 1300,
  category: 'demonic',
  sound: 'thud',
  quip: 'I vant to suck... at small talk.',
  anchor: (f) => f.landmarks.upperLip,
  draw({ ctx, face, progress, time, intensity }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const halfMouth = Math.abs(toLocal(face, L.mouthCenter, L.mouthRightCorner).x);
    inFace(ctx, face, L.mouthCenter, () => {
      const lipY = toLocal(face, L.mouthCenter, L.upperLip).y;
      [-1, 1].forEach((s, i) => {
        const t = easeOutBack(segment(progress, i * 0.4, i * 0.4 + 0.6), 2);
        if (t <= 0) return;
        const x = s * halfMouth * 0.55;
        const len = 0.16 * u * t;
        const w = 0.055 * u;
        const fang: Point[] = [
          { x: x - w / 2, y: lipY },
          { x: x + w / 2, y: lipY },
          { x: x + s * w * 0.1, y: lipY + len },
        ];
        blob(ctx, fang, '#fffdf5', { width: Math.max(1.5, u * 0.008), seed: 5 + i, wobble: 0.5 });
        // A drip of ketchup. Definitely ketchup.
        if (i === 1 && progress >= 1) {
          const cycle = (time % 2600) / 2600;
          const tip = { x: x + s * w * 0.1, y: lipY + len };
          const grow = Math.min(1, cycle * 3);
          const fall = Math.max(0, cycle - 0.45) * 1.8;
          ctx.fillStyle = RED;
          ctx.beginPath();
          ctx.ellipse(tip.x, tip.y + u * 0.02 * grow + fall * fall * u * 0.6, u * 0.012 * grow, u * 0.02 * grow, 0, 0, TAU);
          ctx.fill();
        }
      });
    });
  },
};
