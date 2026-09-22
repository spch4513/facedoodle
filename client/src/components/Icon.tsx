import {
  Angry, Bird, Brain, Bug, CircleDashed, CircleDot, Crosshair, Crown, Dices, Droplet, Eye, Feather, Flame, Glasses,
  MessageCircle, Minus, Orbit, Paintbrush, PartyPopper, Rainbow, ScanEye, Skull, Smile, Sparkles, Sprout, Star, Tent,
  Triangle, Utensils, Wind, X, Zap, type LucideIcon, type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Angry, Bird, Brain, Bug, CircleDashed, CircleDot, Crosshair, Crown, Dices, Droplet, Eye, Feather, Flame, Glasses,
  MessageCircle, Minus, Orbit, Paintbrush, PartyPopper, Rainbow, ScanEye, Skull, Smile, Sparkles, Sprout, Star, Tent,
  Triangle, Utensils, Wind, X, Zap,
};

export function EffectIcon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Sparkles;
  return <C aria-hidden {...props} />;
}
