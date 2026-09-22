export interface Point {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  /** Eye on the image's left side (the subject's right eye). */
  leftEye: Point;
  /** Eye on the image's right side (the subject's left eye). */
  rightEye: Point;
  leftEyeCorner: Point;
  rightEyeCorner: Point;
  noseTip: Point;
  mouthCenter: Point;
  mouthLeftCorner: Point;
  mouthRightCorner: Point;
  foreheadCenter: Point;
  chin: Point;
  leftCheek: Point;
  rightCheek: Point;
  leftEar: Point;
  rightEar: Point;
  /** Extras used by a few effects; derived geometrically when detection is manual. */
  upperLip: Point;
  leftBrow: Point;
  rightBrow: Point;
}

export interface FaceData {
  width: number; // face bounding box width in px
  height: number; // face bounding box height in px
  centerX: number;
  centerY: number;
  rotation: number; // radians
  scale: number; // relative to a 300px reference face
  landmarks: FaceLandmarks;
  source?: 'mediapipe' | 'manual';
  rawLandmarks?: Point[];
}

export interface EffectContext {
  ctx: CanvasRenderingContext2D;
  face: FaceData;
  progress: number; // 0 → 1 (intro animation)
  time: number; // ms since the layer was added (for looping animations)
  intensity: number; // 0 → 1 (global intensity slider)
  meta: LayerMeta;
}

export type EffectCategory = 'demonic' | 'funny' | 'halo' | 'chaos';

export interface EffectModule {
  id: string;
  name: string;
  icon: string; // lucide icon name
  keywords: string[];
  duration: number; // intro animation duration in ms
  category: EffectCategory;
  /** A snarky line shown when the effect lands. */
  quip: string;
  /** Which synthesized sound to play when applied. */
  sound?: SoundName;
  /** Default colour, user-overridable per layer. */
  color?: string;
  /** Where the drag handle sits (defaults to the face center). */
  anchor?(face: FaceData): Point;
  draw(ctx: EffectContext): void;
  /** Chaos combos expand into several layers instead of drawing themselves. */
  expand?(): { effectId: string; delay: number }[];
}

export interface LayerMeta {
  text?: string; // speech bubble text
  color?: string; // per-layer colour override
  /** Drag offset + size, normalised to the face width so they survive a new photo. */
  dx?: number;
  dy?: number;
  size?: number;
  seed?: number;
}

export interface LayerItem {
  id: string; // unique instance id
  effectId: string; // references EffectModule.id
  visible: boolean;
  startTime: number; // performance.now() when added
  metadata?: LayerMeta;
}

export interface ShareConfig {
  effects: LayerItem[];
  intensity: number;
  faceData: FaceData; // landmarks only, no photo
}

export type SoundName = 'growl' | 'boing' | 'chime' | 'pop' | 'pbbt' | 'zap' | 'whoosh' | 'thud' | 'cackle';
