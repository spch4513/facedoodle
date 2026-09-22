import type { FaceData, Point } from '../../types';

/** A point on the tilted "halo plane" ellipse above the head. */
export function haloPoint(face: FaceData, angle: number, rx: number, ry: number, lift: number): Point {
  const top = face.landmarks.foreheadCenter;
  const lx = Math.cos(angle) * rx;
  const ly = Math.sin(angle) * ry - lift;
  const c = Math.cos(face.rotation);
  const s = Math.sin(face.rotation);
  return { x: top.x + lx * c - ly * s, y: top.y + lx * s + ly * c };
}
