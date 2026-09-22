import type { EffectModule } from '../../types';

export const randomChaos: EffectModule = {
  id: 'random-chaos',
  name: 'Random Chaos',
  icon: 'Dices',
  keywords: ['random', 'chaos', 'surprise me', 'yolo', 'anything'],
  duration: 0,
  category: 'chaos',
  sound: 'cackle',
  quip: 'You rolled the dice. The dice rolled you.',
  draw: () => {},
  // Filled in by the registry (it needs the full catalog).
  expand: () => [],
};
