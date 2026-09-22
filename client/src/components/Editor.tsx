import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageUp, Layers, Palette, RefreshCw, Repeat, Share } from 'lucide-react';
import { getEffect, pickRandom } from '../effects/registry';
import { newLayerId, useEffectStore } from '../hooks/useEffectStore';
import { useCreateShare } from '../hooks/useShareLink';
import { parseCommand } from '../lib/commandParser';
import { downloadBlob, downloadPng, recordClip } from '../lib/imageExport';
import { EXPORT_LINES, NO_MATCH, demonName, possession } from '../lib/jokes';
import { isMuted, play, setMuted } from '../lib/sfx';
import type { FaceData, LayerItem } from '../types';
import { CommandBar } from './CommandBar';
import { EffectPanel } from './EffectPanel';
import { LayersPanel } from './LayersPanel';
import { PhotoCanvas } from './PhotoCanvas';
import { ShareDialog } from './ShareDialog';
import { EditTools, ExportTools, IntensitySlider } from './Toolbar';

type Tab = 'effects' | 'layers' | 'export';

interface Props {
  image: HTMLCanvasElement;
  face: FaceData;
  initialLayers?: LayerItem[];
  initialIntensity?: number;
  onNewPhoto(): void;
  toast(text: string, tone?: 'info' | 'error'): void;
}

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function Editor({ image, face, initialLayers, initialIntensity, onNewPhoto, toast }: Props) {
  const store = useEffectStore(initialLayers);
  const [intensity, setIntensity] = useState(initialIntensity ?? 0.6);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('effects');
  const [muted, setMutedState] = useState(isMuted);
  const [shaking, setShaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [title, setTitle] = useState(demonName);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const share = useCreateShare();
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => {
    if (ms <= 0) return fn();
    timers.current.push(window.setTimeout(fn, ms));
  };

  const shake = useCallback(() => {
    setShaking(true);
    later(420, () => setShaking(false));
  }, []);

  /** Adds effects (expanding combos) with staggered start times. Returns number of layers added. */
  const apply = useCallback(
    (ids: string[], opts: { stagger?: number; text?: string; quiet?: boolean } = {}) => {
      const now = performance.now();
      const items: LayerItem[] = [];
      let delay = 0;
      for (const id of ids) {
        const fx = getEffect(id);
        if (!fx) continue;
        const parts = fx.expand ? fx.expand() : [{ effectId: id, delay: 0 }];
        for (const part of parts) {
          const sub = getEffect(part.effectId)!;
          const at = delay + part.delay;
          items.push({
            id: newLayerId(),
            effectId: part.effectId,
            visible: true,
            startTime: now + at,
            metadata: {
              seed: Math.floor(Math.random() * 1e6),
              ...(part.effectId === 'speech-bubble' && opts.text ? { text: opts.text } : {}),
            },
          });
          later(at, () => {
            play(sub.sound);
            if (sub.sound === 'growl' || sub.sound === 'thud') shake();
          });
        }
        if (!opts.quiet) later(delay, () => toast(fx.quip));
        delay += fx.expand ? parts.reduce((m, p) => Math.max(m, p.delay), 0) + 500 : (opts.stagger ?? 0);
      }
      store.add(items);
      if (items.length) setSelectedId(null);
      return items.length;
    },
    [store, toast, shake],
  );

  const onCommand = (text: string) => {
    const { effectIds, speechText, unknown } = parseCommand(text);
    const ids = [...effectIds];
    if (speechText && !ids.includes('speech-bubble')) ids.push('speech-bubble');
    if (!ids.length) {
      play('pbbt');
      toast(unknown.length ? `"${unknown.slice(0, 2).join(' ')}"? ${pick(NO_MATCH)}` : pick(NO_MATCH), 'error');
      return;
    }
    apply(ids, { stagger: 450, text: speechText, quiet: ids.length > 1 });
    if (ids.length > 1) toast(`Summoning ${ids.length} horrors. Stand back.`);
  };

  const randomize = () => {
    const ids = pickRandom(3 + Math.floor(Math.random() * 3));
    apply(ids, { quiet: true });
    play('cackle');
    toast(`🎲 Rolled ${ids.length} random crimes.`);
  };

  const clear = () => {
    store.clear();
    setSelectedId(null);
    play('chime');
    toast('Exorcism complete. The face is pure again (you monster, you can undo this).');
  };

  // Keyboard: ⌘Z / ⇧⌘Z / ⌘Y, Delete removes the selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        store.remove(selectedId);
        setSelectedId(null);
      } else if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, selectedId]);

  const exportPng = async () => {
    if (!canvasRef.current) return;
    try {
      await downloadPng(canvasRef.current, 'facedoodle');
      toast(pick(EXPORT_LINES));
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const exportClip = async () => {
    if (!canvasRef.current || recording) return;
    setRecording(true);
    store.replay();
    try {
      const blob = await recordClip(canvasRef.current, 3000);
      downloadBlob(blob, `facedoodle-${Date.now()}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
      toast('3 seconds of pure chaos, bottled.');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setRecording(false);
    }
  };

  const openShare = () => {
    share.reset();
    setShareOpen(true);
  };

  const toolProps = {
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    hasLayers: store.layers.length > 0,
    intensity,
    muted,
    recording,
    onUndo: store.undo,
    onRedo: store.redo,
    onRandomize: randomize,
    onClear: clear,
    onIntensity: setIntensity,
    onMute: () => {
      setMuted(!muted);
      setMutedState(!muted);
      if (muted) later(0, () => play('boing'));
    },
    onPng: exportPng,
    onClip: exportClip,
    onShare: openShare,
  };

  const drawable = store.layers.filter((l) => !getEffect(l.effectId)?.expand);
  const pos = possession(drawable.filter((l) => l.visible).length);

  const effects = <EffectPanel layers={store.layers} onApply={(id) => apply([id])} />;
  const layersPanel = (
    <div className="space-y-3">
      <IntensitySlider intensity={intensity} onIntensity={setIntensity} />
      <LayersPanel store={store} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  );
  const exportPanel = <ExportTools {...toolProps} />;

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-3 px-3 pb-24 pt-3 lg:pb-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={onNewPhoto} className="marker text-3xl leading-none" aria-label="FaceDoodle — start over with a new photo">
          Face<span className="text-blood">Doodle</span> 😈
        </button>
        <div className="order-3 flex w-full min-w-0 items-center gap-2 font-hand text-lg sm:order-none sm:w-auto">
          <span className="text-ink/60">Now defacing:</span>
          <span className="truncate font-bold">{title}</span>
          <button aria-label="Re-roll demon name" title="Re-roll name" onClick={() => setTitle(demonName())} className="rounded-full p-1 hover:bg-ink/10">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="ink-btn py-1.5" onClick={() => store.replay()} disabled={!drawable.length} title="Replay all intro animations">
            <Repeat size={16} /> <span className="hidden sm:inline">Replay</span>
          </button>
          <button className="ink-btn py-1.5" onClick={onNewPhoto}>
            <ImageUp size={16} /> <span className="hidden sm:inline">New face</span>
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]">
        <aside className="panel scroll-thin hidden max-h-[calc(100vh-90px)] overflow-y-auto lg:block" aria-label="Effects">
          {effects}
        </aside>

        <main className="flex min-w-0 flex-col items-center gap-3">
          <div className="w-full max-w-3xl">
            <CommandBar onCommand={onCommand} />
          </div>
          <div className="flex w-full max-w-3xl items-center gap-3 font-hand text-lg">
            <span className="shrink-0">Possession:</span>
            <div className="sketch-alt h-4 flex-1 overflow-hidden bg-white" role="meter" aria-valuenow={pos.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Possession level">
              <div className="h-full bg-blood transition-all duration-500" style={{ width: `${pos.pct}%` }} />
            </div>
            <span className="shrink-0 text-ink/70">
              {pos.pct}% · <span className={pos.pct > 75 ? 'text-blood' : ''}>{pos.label}</span>
            </span>
          </div>
          <PhotoCanvas
            ref={canvasRef}
            image={image}
            face={face}
            layers={store.layers}
            intensity={intensity}
            selectedId={selectedId}
            shaking={shaking}
            onSelect={setSelectedId}
            onDragStart={store.checkpoint}
            onMeta={store.setMeta}
          />
          {face.source === 'manual' && (
            <p className="font-hand text-base text-ink/60">Using hand-placed anchors. Effects may be a smidge wonky (that's a feature).</p>
          )}
          <EditTools {...toolProps} />

          {/* Mobile panels */}
          <div className="panel w-full lg:hidden">
            {tab === 'effects' && effects}
            {tab === 'layers' && layersPanel}
            {tab === 'export' && exportPanel}
          </div>
        </main>

        <aside className="hidden flex-col gap-4 lg:flex" aria-label="Layers and export">
          <div className="panel scroll-thin max-h-[60vh] overflow-y-auto">
            <h3 className="marker mb-2 text-lg">Layers of sin</h3>
            {layersPanel}
          </div>
          <div className="panel">
            <h3 className="marker mb-2 text-lg">Export</h3>
            {exportPanel}
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t-[2.5px] border-ink bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Editor panels">
        {([
          ['effects', 'Effects', Palette],
          ['layers', `Layers (${drawable.length})`, Layers],
          ['export', 'Export', Share],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 font-hand text-base ${tab === id ? 'text-blood' : 'text-ink/70'}`}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </nav>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        effectCount={drawable.length}
        url={share.url}
        busy={share.busy}
        error={share.error}
        thumbNote={share.thumbNote}
        onCreate={(withThumbnail) =>
          share.create({ layers: store.layers, intensity, face, canvas: canvasRef.current, withThumbnail })
        }
      />
    </div>
  );
}
