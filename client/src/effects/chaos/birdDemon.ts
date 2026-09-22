import type { EffectModule } from '../../types';

export const birdDemon: EffectModule = {
  id: 'bird-demon',
  name: 'Bird Demon',
  icon: 'Feather',
  keywords: ['bird demon', 'crow demon', 'raven lord'],
  duration: 0,
  category: 'chaos',
  sound: 'cackle',
  quip: 'Lord of the Pigeons has entered the chat.',
  draw: () => {},
  expand: () =>
    ['devil-horns', 'bird-halo', 'glowing-eyes', 'smoke-ears'].map((effectId, i) => ({ effectId, delay: i * 700 })),
};
