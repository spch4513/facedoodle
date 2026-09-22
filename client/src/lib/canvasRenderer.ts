import { getEffect } from '../effects/registry';
import { alphaK } from '../effects/draw';
import { clamp } from './easing';
import type { FaceData, LayerItem, Point } from '../types';

export function layerAnchor(face: FaceData, layer: LayerItem): Point {
  const fx = getEffect(layer.effectId);
  const base = fx?.anchor?.(face) ?? { x: face.centerX, y: face.centerY };
  const m = layer.metadata ?? {};
  return { x: base.x + (m.dx ?? 0) * face.width, y: base.y + (m.dy ?? 0) * face.width };
}

export interface RenderInput {
  image: CanvasImageSource | null;
  face: FaceData | null;
  layers: LayerItem[];
  intensity: number;
  now: number;
}

/** Draws one frame. Returns true while any intro animation is still running. */
export function renderFrame(ctx: CanvasRenderingContext2D, { image, face, layers, intensity, now }: RenderInput): boolean {
  const { width, height } = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, width, height);
  if (image) ctx.drawImage(image, 0, 0, width, height);
  if (!face) return false;

  let animating = false;
  for (const layer of layers) {
    if (!layer.visible) continue;
    const fx = getEffect(layer.effectId);
    if (!fx || fx.expand) continue;
    const time = now - layer.startTime;
    if (time < 0) {
      animating = true;
      continue;
    }
    const progress = clamp(time / Math.max(1, fx.duration));
    if (progress < 1) animating = true;
    const m = layer.metadata ?? {};
    ctx.save();
    ctx.globalAlpha = alphaK(intensity);
    // Per-layer drag + resize, applied around the effect's anchor.
    const base = fx.anchor?.(face) ?? { x: face.centerX, y: face.centerY };
    const dx = (m.dx ?? 0) * face.width;
    const dy = (m.dy ?? 0) * face.width;
    const s = m.size ?? 1;
    ctx.translate(base.x + dx, base.y + dy);
    ctx.scale(s, s);
    ctx.translate(-base.x, -base.y);
    try {
      fx.draw({ ctx, face, progress, time, intensity, meta: m });
    } catch (err) {
      // One cursed effect shouldn't take the whole canvas down with it.
      if (import.meta.env.DEV) console.warn(`[facedoodle] ${fx.id} failed to draw`, err);
    }
    ctx.restore();
  }
  return animating;
}
