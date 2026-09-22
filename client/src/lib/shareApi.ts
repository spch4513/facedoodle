import type { ShareConfig } from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface SharedConfig extends ShareConfig {
  hasThumbnail: boolean;
  views: number;
  expiresAt: string | null;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error("Couldn't reach the FaceDoodle server. Is the backend awake? (npm run dev)");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Server said ${res.status}. The demons are on break.`);
  return body as T;
}

export const createShare = (config: ShareConfig) =>
  call<{ slug: string; url: string }>('/api/share', { method: 'POST', body: JSON.stringify(config) });

export const fetchShare = (slug: string) => call<SharedConfig>(`/api/share/${encodeURIComponent(slug)}`);

export const uploadThumbnail = (slug: string, image: string) =>
  call<{ success: boolean }>(`/api/share/${encodeURIComponent(slug)}/thumbnail`, {
    method: 'POST',
    body: JSON.stringify({ image }),
  });

export const thumbnailUrl = (slug: string) => `${BASE}/api/share/${encodeURIComponent(slug)}/thumbnail`;
