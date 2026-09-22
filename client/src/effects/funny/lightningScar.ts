import type { EffectModule, Point } from '../../types';
import { boil, glow, inFace, ink, sizeK } from '../draw';

export const lightningScar: EffectModule = {
  id: 'lightning-scar',
  name: 'Lightning Scar',
  icon: 'Zap',
  keywords: ['scar', 'lightning', 'wizard', 'bolt'],
  duration: 900,
  category: 'funny',
  sound: 'zap',
  color: '#b3122b',
  quip: 'Yer a wizard. A very tired wizard.',
  anchor: (f) => f.landmarks.leftBrow,
  draw({ ctx, face, progress, time, intensity, meta }) {
    const L = face.landmarks;
    const u = face.width * sizeK(intensity);
    const origin = { x: L.leftBrow.x + (L.foreheadCenter.x - L.leftBrow.x) * 0.5, y: L.leftBrow.y + (L.foreheadCenter.y - L.leftBrow.y) * 0.55 };
    const color = meta.color ?? '#b3122b';
    const zz: Point[] = [
      { x: u * 0.05, y: -u * 0.12 },
      { x: -u * 0.04, y: -u * 0.02 },
      { x: u * 0.04, y: -u * 0.01 },
      { x: -u * 0.05, y: u * 0.11 },
    ];
    inFace(ctx, face, origin, () => {
      if (progress >= 1 && Math.sin(time / 500) > 0.92) glow(ctx, '#fff27a', u * 0.08);
      ink(ctx, zz, { width: u * 0.022, color, seed: boil(time), progress });
    });
  },
};
