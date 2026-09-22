import { Dices, Download, Film, Link2, Loader2, Redo2, Trash2, Undo2, Volume2, VolumeX } from 'lucide-react';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  hasLayers: boolean;
  intensity: number;
  muted: boolean;
  recording: boolean;
  onUndo(): void;
  onRedo(): void;
  onRandomize(): void;
  onClear(): void;
  onIntensity(v: number): void;
  onMute(): void;
  onPng(): void;
  onClip(): void;
  onShare(): void;
  compact?: boolean;
}

export function EditTools(p: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button className="ink-btn" onClick={p.onUndo} disabled={!p.canUndo} aria-label="Undo" title="Undo (⌘Z) — repent">
        <Undo2 size={18} /> <span className="hidden sm:inline">Undo</span>
      </button>
      <button className="ink-btn" onClick={p.onRedo} disabled={!p.canRedo} aria-label="Redo" title="Redo (⇧⌘Z) — relapse">
        <Redo2 size={18} /> <span className="hidden sm:inline">Redo</span>
      </button>
      <button className="ink-btn-gold" onClick={p.onRandomize} aria-label="Randomize: add 3 to 5 random effects">
        <Dices size={18} /> Unleash chaos
      </button>
      <button className="ink-btn" onClick={p.onClear} disabled={!p.hasLayers} aria-label="Clear all effects">
        <Trash2 size={18} /> Exorcise all
      </button>
      <button className="ink-btn" onClick={p.onMute} aria-label={p.muted ? 'Unmute sound effects' : 'Mute sound effects'}>
        {p.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}

export function IntensitySlider({ intensity, onIntensity }: Pick<Props, 'intensity' | 'onIntensity'>) {
  const label = intensity < 0.2 ? 'Mildly spooky' : intensity < 0.5 ? 'Spicy' : intensity < 0.8 ? 'Unhinged' : 'MAXIMUM HELL';
  return (
    <label className="block">
      <span className="flex items-baseline justify-between font-hand text-lg">
        <span>Intensity</span>
        <span className={intensity >= 0.8 ? 'marker text-blood' : 'text-ink/70'}>{label}</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={intensity}
        onChange={(e) => onIntensity(Number(e.target.value))}
        className="ink-range w-full"
        aria-label="Global effect intensity"
      />
    </label>
  );
}

export function ExportTools(p: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <button className="ink-btn-red" onClick={p.onPng}>
        <Download size={18} /> Download evidence (PNG)
      </button>
      <button className="ink-btn" onClick={p.onClip} disabled={p.recording}>
        {p.recording ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
        {p.recording ? 'Recording 3 sec of chaos…' : 'Download 3s clip (WebM)'}
      </button>
      <button className="ink-btn-gold" onClick={p.onShare} disabled={!p.hasLayers}>
        <Link2 size={18} /> Summon a share link
      </button>
    </div>
  );
}
