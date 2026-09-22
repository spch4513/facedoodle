import type { EffectModule } from '../../types';

export const circusFreak: EffectModule = {
  id: 'circus-freak',
  name: 'Circus Freak',
  icon: 'Tent',
  keywords: ['circus freak', 'full clown', 'clown car', 'big top'],
  duration: 0,
  category: 'chaos',
  sound: 'boing',
  quip: 'The circus called. They want their whole vibe back.',
  draw: () => {},
  expand: () =>
    ['clown-makeup', 'crazy-tongue', 'x-eyes', 'snot-bubble'].map((effectId, i) => ({ effectId, delay: i * 800 })),
};
