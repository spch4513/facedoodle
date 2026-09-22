import type { EffectModule } from '../../types';
import { segment } from '../../lib/easing';
import { TAU, boil, circlePts, glow, inFace, ink, sizeK } from '../draw';

const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';

export const demonicSigil: EffectModule = {
  id: 'demonic-sigil',
  name: 'Demonic Sigil',
  icon: 'CircleDot',
  keywords: ['sigil', 'summoning circle', 'runes', 'summon'],
  duration: 2200,
  category: 'demonic',
  sound: 'cackle',
  color: '#ff2d3d',
  quip: 'Summoning circle complete. Pizza has not arrived.',
  draw({ ctx, face, progress, time, intensity, meta }) {
    const R = Math.max(face.width, face.height) * 0.72 * sizeK(intensity);
    const color = meta.color ?? '#ff2d3d';
    const b = boil(time);
    const spin = time / 9000;
    inFace(ctx, face, { x: face.centerX, y: face.centerY }, () => {
      glow(ctx, color, R * 0.05);
      ink(ctx, circlePts(0, 0, R, 64, -Math.PI / 2 + spin), { width: R * 0.018, color, seed: b, progress: segment(progress, 0, 0.4) });
      ink(ctx, circlePts(0, 0, R * 0.86, 64, Math.PI / 2 - spin), { width: R * 0.01, color, seed: b + 1, progress: segment(progress, 0.15, 0.5) });
      const n = 16;
      ctx.fillStyle = color;
      ctx.font = `${Math.round(R * 0.1)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const show = segment(progress, 0.45 + (i / n) * 0.5, 0.5 + (i / n) * 0.5);
        if (show <= 0) continue;
        const a = (i / n) * TAU + spin;
        ctx.save();
        ctx.globalAlpha *= show * (0.7 + Math.sin(time / 200 + i) * 0.3);
        ctx.translate(Math.cos(a) * R * 0.93, Math.sin(a) * R * 0.93);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillText(RUNES[(i * 7) % RUNES.length], 0, 0);
        ctx.restore();
      }
    });
  },
};
