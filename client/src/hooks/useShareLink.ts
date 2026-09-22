import { useCallback, useEffect, useState } from 'react';
import { createShare, fetchShare, uploadThumbnail, type SharedConfig } from '../lib/shareApi';
import { makeThumbnail } from '../lib/imageExport';
import { slimFace } from '../lib/faceLandmarks';
import type { FaceData, LayerItem } from '../types';

export function slugFromPath(path = window.location.pathname): string | null {
  const m = path.match(/^\/s\/([a-z0-9]{6})\/?$/i);
  return m ? m[1].toLowerCase() : null;
}

/** Loads a shared config when the page was opened at /s/:slug. */
export function useIncomingShare() {
  const [slug] = useState(slugFromPath);
  const [shared, setShared] = useState<SharedConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!slug);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    fetchShare(slug)
      .then((s) => alive && setShared(s))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  const dismiss = useCallback(() => {
    setShared(null);
    setError(null);
    window.history.replaceState(null, '', '/');
  }, []);

  return { slug, shared, error, loading, dismiss };
}

export function useCreateShare() {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbNote, setThumbNote] = useState<string | null>(null);

  const create = useCallback(
    async (opts: { layers: LayerItem[]; intensity: number; face: FaceData; canvas: HTMLCanvasElement | null; withThumbnail: boolean }) => {
      setBusy(true);
      setError(null);
      setThumbNote(null);
      try {
        const effects = opts.layers.map((l) => ({ ...l, startTime: 0 }));
        const { slug } = await createShare({ effects, intensity: opts.intensity, faceData: slimFace(opts.face) });
        if (opts.withThumbnail && opts.canvas) {
          try {
            await uploadThumbnail(slug, makeThumbnail(opts.canvas));
            setThumbNote('Preview thumbnail attached.');
          } catch (e) {
            setThumbNote(`Link works, but the thumbnail didn't make it: ${(e as Error).message}`);
          }
        }
        // The link must open the app, which may live on a different origin than the API.
        const url = `${window.location.origin}/s/${slug}`;
        setUrl(url);
        return url;
      } catch (e) {
        setError((e as Error).message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setUrl(null);
    setError(null);
    setThumbNote(null);
  }, []);

  return { url, busy, error, thumbNote, create, reset };
}
