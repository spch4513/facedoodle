import type { FaceData, FaceLandmarks, Point } from '../types';

const REFERENCE_FACE_WIDTH = 300;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// MediaPipe FaceMesh indices. "R" = subject's right, which is usually the image's left.
const IDX = {
  irisR: 468, irisL: 473,
  eyeOuterR: 33, eyeOuterL: 263,
  noseTip: 1,
  lipTopInner: 13, lipBottomInner: 14,
  mouthR: 61, mouthL: 291,
  forehead: 10, chin: 152,
  cheekR: 50, cheekL: 280,
  earR: 234, earL: 454,
  browR: 105, browL: 334,
};

function finish(l: FaceLandmarks, source: FaceData['source'], raw?: Point[]): FaceData {
  const width = dist(l.leftEar, l.rightEar);
  const height = dist(l.foreheadCenter, l.chin);
  const c = mid(mid(l.leftEar, l.rightEar), mid(l.foreheadCenter, l.chin));
  return {
    width,
    height,
    centerX: c.x,
    centerY: c.y,
    rotation: Math.atan2(l.rightEye.y - l.leftEye.y, l.rightEye.x - l.leftEye.x),
    scale: width / REFERENCE_FACE_WIDTH,
    landmarks: l,
    source,
    rawLandmarks: raw,
  };
}

/** Turns MediaPipe's normalised landmarks into pixel-space anchor points. */
export function fromMediaPipe(norm: { x: number; y: number }[], w: number, h: number): FaceData {
  const px = norm.map((p) => ({ x: p.x * w, y: p.y * h }));
  const at = (i: number) => px[i] ?? px[0];
  // Keep "left" meaning image-left, even for mirrored selfies.
  const flip = at(IDX.irisR).x > at(IDX.irisL).x;
  const pair = (r: number, l: number): [Point, Point] => (flip ? [at(l), at(r)] : [at(r), at(l)]);
  const irisOk = px.length > IDX.irisL;
  const [leftEye, rightEye] = irisOk
    ? pair(IDX.irisR, IDX.irisL)
    : pair(IDX.eyeOuterR, IDX.eyeOuterL).map((p, i) => mid(p, at(i === 0 ? 133 : 362))) as [Point, Point];
  const [leftEyeCorner, rightEyeCorner] = pair(IDX.eyeOuterR, IDX.eyeOuterL);
  const [mouthLeftCorner, mouthRightCorner] = pair(IDX.mouthR, IDX.mouthL);
  const [leftCheek, rightCheek] = pair(IDX.cheekR, IDX.cheekL);
  const [leftEar, rightEar] = pair(IDX.earR, IDX.earL);
  const [leftBrow, rightBrow] = pair(IDX.browR, IDX.browL);
  return finish(
    {
      leftEye, rightEye, leftEyeCorner, rightEyeCorner,
      noseTip: at(IDX.noseTip),
      mouthCenter: mid(at(IDX.lipTopInner), at(IDX.lipBottomInner)),
      mouthLeftCorner, mouthRightCorner,
      foreheadCenter: at(IDX.forehead),
      chin: at(IDX.chin),
      leftCheek, rightCheek, leftEar, rightEar,
      upperLip: at(IDX.lipTopInner),
      leftBrow, rightBrow,
    },
    'mediapipe',
    px,
  );
}

export interface ManualAnchors {
  leftEye: Point;
  rightEye: Point;
  mouth: Point;
  forehead: Point;
}

/** Guesses a whole face from four taps using boring average-human proportions. */
export function fromManualAnchors(a: ManualAnchors): FaceData {
  const [le, re] = a.leftEye.x <= a.rightEye.x ? [a.leftEye, a.rightEye] : [a.rightEye, a.leftEye];
  const ed = Math.max(8, dist(le, re));
  const ex = { x: (re.x - le.x) / ed, y: (re.y - le.y) / ed };
  const ey = { x: -ex.y, y: ex.x }; // "down" in face space
  const at = (o: Point, sx: number, sy: number): Point => ({ x: o.x + ex.x * sx * ed + ey.x * sy * ed, y: o.y + ex.y * sx * ed + ey.y * sy * ed });
  const eyeMid = mid(le, re);
  const m = a.mouth;
  return finish(
    {
      leftEye: le,
      rightEye: re,
      leftEyeCorner: at(le, -0.25, 0),
      rightEyeCorner: at(re, 0.25, 0),
      noseTip: { x: eyeMid.x + (m.x - eyeMid.x) * 0.62, y: eyeMid.y + (m.y - eyeMid.y) * 0.62 },
      mouthCenter: m,
      mouthLeftCorner: at(m, -0.42, 0),
      mouthRightCorner: at(m, 0.42, 0),
      foreheadCenter: a.forehead,
      chin: at(m, 0, 0.62),
      leftCheek: at(eyeMid, -0.75, 0.5),
      rightCheek: at(eyeMid, 0.75, 0.5),
      leftEar: at(eyeMid, -1.1, 0.25),
      rightEar: at(eyeMid, 1.1, 0.25),
      upperLip: at(m, 0, -0.04),
      leftBrow: at(le, 0, -0.3),
      rightBrow: at(re, 0, -0.3),
    },
    'manual',
  );
}

/** Strips raw landmarks (big + unneeded) before sending anywhere. */
export function slimFace(face: FaceData): FaceData {
  const { rawLandmarks: _raw, ...rest } = face;
  return rest;
}
