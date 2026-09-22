// Copies MediaPipe's WASM runtime into public/ so face detection is self-hosted.
// If this fails the app quietly falls back to the jsDelivr CDN.
import { cpSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const pkg = createRequire(import.meta.url).resolve('@mediapipe/tasks-vision');
  let dir = dirname(pkg);
  while (!existsSync(join(dir, 'wasm')) && dir !== dirname(dir)) dir = dirname(dir);
  cpSync(join(dir, 'wasm'), join(root, 'public/mediapipe/wasm'), { recursive: true });
  console.log('[facedoodle] MediaPipe WASM copied to public/mediapipe/wasm');
} catch (err) {
  console.warn(`[facedoodle] Could not copy MediaPipe WASM (${err.message}); will use the CDN.`);
}
