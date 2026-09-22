import { forwardRef, useImperativeHandle, useRef, type PointerEvent } from 'react';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { layerAnchor, renderFrame } from '../lib/canvasRenderer';
import { getEffect } from '../effects/registry';
import type { FaceData, LayerItem, LayerMeta, Point } from '../types';

interface Props {
  image: HTMLCanvasElement;
  face: FaceData;
  layers: LayerItem[];
  intensity: number;
  selectedId: string | null;
  shaking: boolean;
  onSelect(id: string | null): void;
  onDragStart(): void;
  onMeta(id: string, meta: Partial<LayerMeta>, record: boolean): void;
}

export const PhotoCanvas = forwardRef<HTMLCanvasElement | null, Props>(function PhotoCanvas(
  { image, face, layers, intensity, selectedId, shaking, onSelect, onDragStart, onMeta },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; start: Point; dx: number; dy: number } | null>(null);
  useImperativeHandle(ref, () => canvas.current!, []);

  useAnimationLoop((now) => {
    const c = canvas.current;
    if (!c) return;
    if (c.width !== image.width || c.height !== image.height) {
      c.width = image.width;
      c.height = image.height;
    }
    const ctx = c.getContext('2d');
    if (ctx) renderFrame(ctx, { image, face, layers, intensity, now });
  });

  const toImage = (e: PointerEvent): Point => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * image.width, y: ((e.clientY - r.top) / r.height) * image.height };
  };

  const visible = layers.filter((l) => l.visible && !getEffect(l.effectId)?.expand);
  const handleR = Math.max(14, image.width * 0.022);

  const pickAt = (p: Point) => {
    let best: { id: string; d: number } | null = null;
    for (const l of visible) {
      const a = layerAnchor(face, l);
      const d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d < face.width * 0.3 && (!best || d < best.d)) best = { id: l.id, d };
    }
    return best?.id ?? null;
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    const p = toImage(e);
    const id = pickAt(p) ?? null;
    onSelect(id);
    if (!id) return;
    const l = layers.find((x) => x.id === id)!;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, start: p, dx: l.metadata?.dx ?? 0, dy: l.metadata?.dy ?? 0 };
    onDragStart();
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = toImage(e);
    onMeta(d.id, { dx: d.dx + (p.x - d.start.x) / face.width, dy: d.dy + (p.y - d.start.y) / face.width }, false);
  };
  const up = () => (drag.current = null);

  const sel = visible.find((l) => l.id === selectedId);
  const selAnchor = sel ? layerAnchor(face, sel) : null;

  return (
    <div className={`relative inline-block max-w-full ${shaking ? 'animate-shake' : ''}`}>
      <canvas
        ref={canvas}
        className="sketch block h-auto max-h-[58vh] w-auto max-w-full bg-white shadow-[8px_8px_0_0_#1a1a2e] lg:max-h-[68vh]"
        aria-label={`Doodled photo with ${visible.length} effects`}
        role="img"
      />
      <svg
        ref={svg}
        viewBox={`0 0 ${image.width} ${image.height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: drag.current ? 'grabbing' : 'pointer' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(e) => {
          if (!sel) return;
          const s = Math.min(3, Math.max(0.3, (sel.metadata?.size ?? 1) * (e.deltaY < 0 ? 1.06 : 0.94)));
          onMeta(sel.id, { size: s }, false);
        }}
      >
        {visible.map((l) => {
          const a = layerAnchor(face, l);
          return l.id === selectedId ? null : (
            <circle key={l.id} cx={a.x} cy={a.y} r={handleR * 0.35} fill="rgba(230,57,70,0.35)" stroke="#fff" strokeWidth={2} />
          );
        })}
        {selAnchor && (
          <g pointerEvents="none">
            <circle cx={selAnchor.x} cy={selAnchor.y} r={handleR * 2.2} fill="none" stroke="#e63946" strokeWidth={3} strokeDasharray="10 7">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${selAnchor.x} ${selAnchor.y}`} to={`360 ${selAnchor.x} ${selAnchor.y}`} dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx={selAnchor.x} cy={selAnchor.y} r={handleR} fill="#e63946" stroke="#fff" strokeWidth={3} />
            <path
              d={`M${selAnchor.x - handleR * 0.55} ${selAnchor.y}h${handleR * 1.1}M${selAnchor.x} ${selAnchor.y - handleR * 0.55}v${handleR * 1.1}`}
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
});
