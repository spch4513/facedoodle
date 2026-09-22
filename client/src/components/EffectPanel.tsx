import { CATEGORIES, EFFECTS } from '../effects/registry';
import type { LayerItem } from '../types';
import { EffectIcon } from './Icon';

export function EffectPanel({ layers, onApply }: { layers: LayerItem[]; onApply(effectId: string): void }) {
  const counts = new Map<string, number>();
  for (const l of layers) counts.set(l.effectId, (counts.get(l.effectId) ?? 0) + 1);
  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
          <h3 id={`cat-${cat.id}`} className="marker mb-1.5 flex items-baseline gap-2 text-lg">
            <span className={cat.id === 'demonic' || cat.id === 'chaos' ? 'text-blood' : ''}>{cat.label}</span>
            <span className="font-hand text-sm font-normal text-ink/50">{cat.blurb}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.filter((e) => e.category === cat.id).map((fx) => {
              const n = counts.get(fx.id) ?? 0;
              return (
                <button
                  key={fx.id}
                  type="button"
                  className="chip"
                  data-active={n > 0}
                  aria-label={`Add ${fx.name}`}
                  title={fx.quip}
                  onClick={() => onApply(fx.id)}
                >
                  <EffectIcon name={fx.icon} size={18} className={n ? 'text-blood' : 'text-ink'} />
                  <span className="min-w-0 flex-1 truncate">{fx.name}</span>
                  {n > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-blood px-1 text-xs font-bold text-white">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
