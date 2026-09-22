export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The canvas refused to be exported. Rude.'))), type, quality),
  );
}

export async function downloadPng(canvas: HTMLCanvasElement, name = 'facedoodle') {
  downloadBlob(await canvasToBlob(canvas), `${name}-${Date.now()}.png`);
}

/** A ≤500px-wide PNG of the current frame, as a data URL (for share-link previews). */
export function makeThumbnail(canvas: HTMLCanvasElement, maxWidth = 500): string {
  const scale = Math.min(1, maxWidth / canvas.width);
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * scale);
  c.height = Math.round(canvas.height * scale);
  c.getContext('2d')!.drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

/** Records the live canvas for `ms` milliseconds into a WebM clip (GIF's cooler cousin). */
export async function recordClip(canvas: HTMLCanvasElement, ms = 3000): Promise<Blob> {
  if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
    throw new Error("Your browser can't record clips. It's not you, it's them.");
  }
  const stream = canvas.captureStream(30);
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((t) =>
    MediaRecorder.isTypeSupported(t),
  );
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 4_000_000 } : undefined);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((resolve) => (rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType }))));
  rec.start(100);
  await new Promise((r) => setTimeout(r, ms));
  rec.stop();
  stream.getTracks().forEach((t) => t.stop());
  return done;
}
