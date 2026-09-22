// Shared doodle toolkit: hand-drawn ink lines, partial paths, seeded wobble.
import type { FaceData, Point } from '../types';

export const INK = '#1a1a2e';
export const RED = '#e63946';
export const GOLD = '#f4a261';
export const TAU = Math.PI * 2;

/** How big effects get for a given intensity (0 → 1). */
export const sizeK = (intensity: number) => 0.6 + 0.7 * intensity;
/** How opaque effects get for a given intensity (0 → 1). */
export const alphaK = (intensity: number) => 0.35 + 0.65 * intensity;

export function rng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The "line boil" frame — doodles re-wobble ~8 times a second like hand-drawn animation. */
export const boil = (time: number) => Math.floor(time / 120);

export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Transforms into a face-aligned frame at `origin` (rotated with the head), runs fn, restores. */
export function inFace(ctx: CanvasRenderingContext2D, face: FaceData, origin: Point, fn: () => void, scale = 1) {
  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(face.rotation);
  if (scale !== 1) ctx.scale(scale, scale);
  fn();
  ctx.restore();
}

/** Converts a world point into the rotated face frame centred on `origin`. */
export function toLocal(face: FaceData, origin: Point, p: Point): Point {
  const c = Math.cos(-face.rotation);
  const s = Math.sin(-face.rotation);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

export function quad(p0: Point, c: Point, p1: Point, n = 16): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push({ x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y });
  }
  return out;
}

export function cubic(p0: Point, c1: Point, c2: Point, p1: Point, n = 20): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
    });
  }
  return out;
}

export function circlePts(cx: number, cy: number, r: number, n = 32, start = -Math.PI / 2, sweep = TAU): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const a = start + (sweep * i) / n;
    out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return out;
}

/** Returns the first `t` fraction of a polyline, by arc length. */
export function partial(pts: Point[], t: number): Point[] {
  if (t >= 1 || pts.length < 2) return pts;
  if (t <= 0) return [];
  let total = 0;
  const seg: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    seg.push(d);
    total += d;
  }
  let remaining = total * t;
  const out: Point[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (remaining >= seg[i - 1]) {
      out.push(pts[i]);
      remaining -= seg[i - 1];
    } else {
      const f = remaining / seg[i - 1];
      out.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f });
      break;
    }
  }
  return out;
}

export function jitter(pts: Point[], amount: number, seed: number): Point[] {
  if (amount <= 0) return pts;
  const r = rng(seed);
  return pts.map((p) => ({ x: p.x + (r() - 0.5) * amount, y: p.y + (r() - 0.5) * amount }));
}

export function tracePath(ctx: CanvasRenderingContext2D, pts: Point[], close = false) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  if (close) ctx.closePath();
}

export interface InkOpts {
  width?: number;
  color?: string;
  progress?: number;
  wobble?: number;
  seed?: number;
  sketchy?: boolean; // draw a second, offset pass like a nervous pen
}

/** Draws a hand-drawn ink stroke along a polyline, optionally only partially. */
export function ink(ctx: CanvasRenderingContext2D, pts: Point[], o: InkOpts = {}) {
  const shown = partial(pts, o.progress ?? 1);
  if (shown.length < 2) return;
  const w = o.width ?? 3;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = o.color ?? INK;
  ctx.lineWidth = w;
  tracePath(ctx, jitter(shown, o.wobble ?? w * 0.6, o.seed ?? 1));
  ctx.stroke();
  if (o.sketchy !== false) {
    ctx.globalAlpha *= 0.55;
    ctx.lineWidth = Math.max(1, w * 0.45);
    tracePath(ctx, jitter(shown, (o.wobble ?? w * 0.6) * 1.8, (o.seed ?? 1) + 99));
    ctx.stroke();
  }
  ctx.restore();
}

/** Filled shape with a sketchy ink outline. */
export function blob(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  fill: string | CanvasGradient,
  o: InkOpts & { outline?: boolean } = {},
) {
  ctx.save();
  ctx.fillStyle = fill;
  tracePath(ctx, jitter(pts, (o.wobble ?? 1) * 0.6, o.seed ?? 3), true);
  ctx.fill();
  ctx.restore();
  if (o.outline !== false) ink(ctx, [...pts, pts[0]], { ...o, progress: 1 });
}

/** Scribbly hatch fill inside a region, clipped — the ballpoint-on-newspaper look. */
export function hatch(ctx: CanvasRenderingContext2D, pts: Point[], color: string, spacing: number, seed: number) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  ctx.save();
  tracePath(ctx, pts, true);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, spacing * 0.35);
  ctx.lineCap = 'round';
  const r = rng(seed);
  ctx.beginPath();
  const span = maxX - minX + maxY - minY;
  for (let d = -span; d < span; d += spacing) {
    ctx.moveTo(minX + d + (r() - 0.5) * spacing, minY);
    ctx.lineTo(minX + d + (maxY - minY) + (r() - 0.5) * spacing, maxY);
  }
  ctx.stroke();
  ctx.restore();
}

export function glow(ctx: CanvasRenderingContext2D, color: string, blur: number) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

/** A tiny flying bat silhouette, wings flapping with `flap` in [0, 1]. */
export function bat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, color = INK) {
  const w = Math.sin(flap * TAU) * 0.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-s * 0.5, -s * (0.2 + w), -s, -s * (0.1 + w));
  ctx.quadraticCurveTo(-s * 0.75, s * 0.1, -s * 0.8, s * 0.3);
  ctx.quadraticCurveTo(-s * 0.4, s * 0.05, 0, s * 0.3);
  ctx.quadraticCurveTo(s * 0.4, s * 0.05, s * 0.8, s * 0.3);
  ctx.quadraticCurveTo(s * 0.75, s * 0.1, s, -s * (0.1 + w));
  ctx.quadraticCurveTo(s * 0.5, -s * (0.2 + w), 0, 0);
  ctx.fill();
  ctx.fillStyle = RED;
  ctx.fillRect(-s * 0.12, s * 0.05, s * 0.07, s * 0.07);
  ctx.fillRect(s * 0.05, s * 0.05, s * 0.07, s * 0.07);
  ctx.restore();
}

/** One flame tongue, flickering with `t` (ms). */
export function flame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, seed: number) {
  const r = rng(seed);
  const phase = r() * TAU;
  const flick = Math.sin(t / 90 + phase) * 0.15 + Math.sin(t / 37 + phase * 2) * 0.08;
  const hh = h * (0.85 + flick);
  const lean = Math.sin(t / 160 + phase) * w * 0.35;
  const layers: [string, number][] = [
    ['#e63946', 1],
    ['#f4a261', 0.66],
    ['#ffe66d', 0.36],
  ];
  for (const [col, k] of layers) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - (w / 2) * k, y);
    ctx.quadraticCurveTo(x - (w / 2) * k, y - hh * k * 0.5, x + lean * k, y - hh * k);
    ctx.quadraticCurveTo(x + (w / 2) * k, y - hh * k * 0.5, x + (w / 2) * k, y);
    ctx.closePath();
    ctx.fill();
  }
}
