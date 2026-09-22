import { ArrowDown, ArrowUp, Eye, EyeOff, Ghost, Trash2 } from 'lucide-react';
import { getEffect } from '../effects/registry';
import { SPEECH_LINES } from '../effects/funny/speechBubble';
import type { EffectStore } from '../hooks/useEffectStore';
import type { LayerItem } from '../types';
import { EffectIcon } from './Icon';

interface Props {
  store: EffectStore;
  selectedId: string | null;
  onSelect(id: string | null): void;
}

export function LayersPanel({ store, selectedId, onSelect }: Props) {
  const { layers } = store;
  if (!layers.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center font-hand text-lg text-ink/60">
        <Ghost size={36} />
        No doodles yet. This face is suspiciously innocent.
      </div>
    );
  }
  // Top of the list = drawn last = on top.
  const ordered = [...layers].reverse();
  return (
    <ol className="space-y-1.5" aria-label="Layers">
      {ordered.map((l) => (
        <LayerRow
          key={l.id}
          layer={l}
          index={layers.indexOf(l)}
          total={layers.length}
          selected={l.id === selectedId}
          store={store}
          onSelect={onSelect}
        />
      ))}
    </ol>
  );
}

function LayerRow({ layer, index, total, selected, store, onSelect }: {
  layer: LayerItem; index: number; total: number; selected: boolean; store: EffectStore; onSelect(id: string | null): void;
}) {
  const fx = getEffect(layer.effectId);
  if (!fx) return null;
  const m = layer.metadata ?? {};
  return (
    <li className={`sketch-alt bg-white px-2 py-1.5 transition-colors ${selected ? 'border-blood bg-blood/5' : ''} ${layer.visible ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-1">
        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-left font-hand text-lg"
          onClick={() => onSelect(selected ? null : layer.id)}
          aria-pressed={selected}
          aria-label={`Select ${fx.name}`}
        >
          <EffectIcon name={fx.icon} size={16} className="shrink-0" />
          <span className="truncate">{fx.name}</span>
        </button>
        <IconBtn label={layer.visible ? 'Hide' : 'Show'} onClick={() => store.toggle(layer.id)}>
          {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </IconBtn>
        <IconBtn label="Move up" disabled={index === total - 1} onClick={() => store.move(layer.id, 1)}>
          <ArrowUp size={16} />
        </IconBtn>
        <IconBtn label="Move down" disabled={index === 0} onClick={() => store.move(layer.id, -1)}>
          <ArrowDown size={16} />
        </IconBtn>
        <IconBtn label="Delete" onClick={() => store.remove(layer.id)} danger>
          <Trash2 size={16} />
        </IconBtn>
      </div>
      {selected && (
        <div className="mt-2 space-y-2 border-t border-dashed border-ink/30 pt-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="w-12 font-hand text-base">Size</span>
            <input
              type="range"
              className="ink-range flex-1"
              min={0.3}
              max={3}
              step={0.05}
              value={m.size ?? 1}
              onPointerDown={store.checkpoint}
              onChange={(e) => store.setMeta(layer.id, { size: Number(e.target.value) }, false)}
              aria-label={`${fx.name} size`}
            />
          </label>
          {fx.color && (
            <label className="flex items-center gap-2">
              <span className="w-12 font-hand text-base">Color</span>
              <input
                type="color"
                value={m.color ?? fx.color}
                onChange={(e) => store.setMeta(layer.id, { color: e.target.value })}
                className="h-7 w-12 cursor-pointer rounded border-2 border-ink"
                aria-label={`${fx.name} color`}
              />
              {m.color && (
                <button className="font-hand underline" onClick={() => store.setMeta(layer.id, { color: undefined })}>
                  reset
                </button>
              )}
            </label>
          )}
          {fx.id === 'speech-bubble' && (
            <label className="block">
              <span className="font-hand text-base">Says</span>
              <input
                className="sketch-alt mt-1 w-full bg-paper px-2 py-1 font-hand text-lg outline-none focus:border-blood"
                maxLength={120}
                value={m.text ?? SPEECH_LINES[(m.seed ?? 0) % SPEECH_LINES.length]}
                onFocus={store.checkpoint}
                onChange={(e) => store.setMeta(layer.id, { text: e.target.value }, false)}
              />
            </label>
          )}
          {(m.dx || m.dy || (m.size && m.size !== 1)) && (
            <button className="font-hand text-base underline" onClick={() => store.setMeta(layer.id, { dx: 0, dy: 0, size: 1 })}>
              Snap back to face
            </button>
          )}
          <p className="font-hand text-sm text-ink/50">Tip: drag it on the photo. Scroll over it to resize.</p>
        </div>
      )}
    </li>
  );
}

function IconBtn({ label, children, onClick, disabled, danger }: {
  label: string; children: React.ReactNode; onClick(): void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-full transition hover:bg-ink/10 disabled:opacity-25 ${danger ? 'hover:bg-blood/15 hover:text-blood' : ''}`}
    >
      {children}
    </button>
  );
}
