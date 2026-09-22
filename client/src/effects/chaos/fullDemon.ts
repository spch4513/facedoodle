import type { EffectModule } from '../../types';

const noop = () => {};

export const fullDemon: EffectModule = {
  id: 'full-demon',
  name: 'Full Demon',
  icon: 'Skull',
  keywords: ['full demon', 'satan', 'lucifer', 'possessed fully', 'demon mode'],
  duration: 0,
  category: 'chaos',
  sound: 'growl',
  quip: 'Congratulations, you have summoned Kevin from Accounting (demon form).',
  draw: noop,
  expand: () =>
    ['fire-aura', 'devil-horns', 'glowing-eyes', 'vampire-fangs', 'demon-goatee'].map((effectId, i) => ({
      effectId,
      delay: i * 700,
    })),
};
