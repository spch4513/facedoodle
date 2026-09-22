import { useCallback, useState } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import { fromMediaPipe } from '../lib/faceLandmarks';
import type { FaceData } from '../types';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const LOCAL_WASM = '/mediapipe/wasm';
const CDN_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function create(): Promise<FaceLandmarker> {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const localOk = await fetch(`${LOCAL_WASM}/vision_wasm_internal.js`, { method: 'HEAD' })
    .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
    .catch(() => false);
  const fileset = await FilesetResolver.forVisionTasks(localOk ? LOCAL_WASM : CDN_WASM);
  const make = (delegate: 'GPU' | 'CPU') =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: 'IMAGE',
      numFaces: 1,
    });
  try {
    return await make('GPU');
  } catch {
    return await make('CPU');
  }
}

function getLandmarker() {
  landmarkerPromise ??= create().catch((err) => {
    landmarkerPromise = null;
    throw err;
  });
  return landmarkerPromise;
}

export type DetectionStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

export function useFaceDetection() {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (source: HTMLCanvasElement): Promise<FaceData | null> => {
    setStatus('loading');
    setError(null);
    // MediaPipe's WASM logs chatty INFO lines to console.error; mute them during detection.
    const origErr = console.error;
    console.error = (...args: unknown[]) => {
      const first = String(args[0] ?? '');
      if (/^(INFO|W0000|I0000)|gl_context|TensorFlow Lite/.test(first)) return;
      origErr(...args);
    };
    try {
      const lm = await getLandmarker();
      const res = lm.detect(source);
      const face = res.faceLandmarks?.[0];
      if (!face?.length) {
        setStatus('not-found');
        return null;
      }
      setStatus('found');
      return fromMediaPipe(face, source.width, source.height);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      console.error = origErr;
    }
  }, []);

  return { detect, status, error, setStatus };
}
