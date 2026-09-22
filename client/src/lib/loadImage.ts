const MAX_SIDE = 1400;
export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/** Decodes a user file into a canvas (≤1400px on the long side). Never leaves the browser. */
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error(
      /heic|heif/i.test(file.type || file.name)
        ? "HEIC photos aren't supported by browsers yet. Export it as JPG and try again."
        : "That's not a JPG, PNG or WebP. Nice try, though.",
    );
  }
  let source: CanvasImageSource & { width: number; height: number };
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("That image appears to be cursed (it wouldn't load). Try another one."));
      };
      img.src = url;
    });
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const c = document.createElement('canvas');
  c.width = Math.round(source.width * scale);
  c.height = Math.round(source.height * scale);
  c.getContext('2d')!.drawImage(source, 0, 0, c.width, c.height);
  if ('close' in source && typeof source.close === 'function') source.close();
  return c;
}
