import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { db, type ShareRow } from '../db/index.js';
import { generateSlug } from '../utils/slug.js';

const SLUG_RE = /^[a-z0-9]{6}$/;
const MAX_THUMB_BYTES = 750_000; // base64 chars — a 500px PNG fits comfortably
const TTL_DAYS = Number(process.env.SHARE_TTL_DAYS ?? 7);

const createLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Whoa there, Beelzebub. 10 links a minute is plenty. Take a breather.' },
});

const insert = db.prepare(
  `INSERT INTO shares (slug, config, expires_at) VALUES (?, ?, datetime('now', ?))`,
);
const findLive = db.prepare<[string], ShareRow>(
  `SELECT * FROM shares WHERE slug = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`,
);
const bumpViews = db.prepare(`UPDATE shares SET views = views + 1 WHERE slug = ?`);
const setThumb = db.prepare(`UPDATE shares SET thumbnail = ? WHERE slug = ?`);
const purgeExpired = db.prepare(`DELETE FROM shares WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')`);

function isValidConfig(body: unknown): body is { effects: unknown[]; intensity: number; faceData: unknown } {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    Array.isArray(b.effects) &&
    b.effects.length <= 100 &&
    typeof b.intensity === 'number' &&
    b.intensity >= 0 &&
    b.intensity <= 1.5 &&
    !!b.faceData &&
    typeof b.faceData === 'object'
  );
}

function publicBase(req: Request): string {
  return process.env.PUBLIC_URL ?? `${req.protocol}://${req.get('x-forwarded-host') ?? req.get('host')}`;
}

export const shareRouter = Router();

shareRouter.post('/', createLimiter, (req: Request, res: Response) => {
  if (!isValidConfig(req.body)) {
    return res.status(400).json({ error: 'That config looks cursed (in the bad way). Expected { effects, intensity, faceData }.' });
  }
  const { effects, intensity, faceData } = req.body;
  // Belt and braces: never persist anything that smells like a photo.
  const config = JSON.stringify({ effects, intensity, faceData: { ...(faceData as object), rawLandmarks: undefined } });

  purgeExpired.run();
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    try {
      insert.run(slug, config, `+${TTL_DAYS} days`);
      return res.status(201).json({ slug, url: `${publicBase(req)}/s/${slug}` });
    } catch (err) {
      if ((err as { code?: string }).code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw err;
    }
  }
  return res.status(503).json({ error: 'Every slug we tried was already possessed. Try again.' });
});

shareRouter.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!SLUG_RE.test(slug)) return res.status(404).json({ error: 'No demon lives here.' });
  const row = findLive.get(slug);
  if (!row) return res.status(404).json({ error: 'This link has been exorcised (or never existed).' });
  bumpViews.run(slug);
  const config = JSON.parse(row.config);
  return res.json({ ...config, hasThumbnail: !!row.thumbnail, views: row.views + 1, expiresAt: row.expires_at });
});

shareRouter.post('/:slug/thumbnail', (req: Request, res: Response) => {
  const { slug } = req.params;
  const image = (req.body as { image?: unknown })?.image;
  if (!SLUG_RE.test(slug) || !findLive.get(slug)) return res.status(404).json({ error: 'No demon lives here.' });
  if (typeof image !== 'string') return res.status(400).json({ error: 'Expected { image: base64 PNG }.' });
  const b64 = image.replace(/^data:image\/png;base64,/, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(b64) || b64.length > MAX_THUMB_BYTES) {
    return res.status(413).json({ error: 'Thumbnail too chonky or not a PNG. Keep it under ~500px wide.' });
  }
  const buf = Buffer.from(b64, 'base64');
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    return res.status(400).json({ error: 'That is not a PNG. That is an impostor.' });
  }
  setThumb.run(b64, slug);
  return res.json({ success: true });
});

shareRouter.get('/:slug/thumbnail', (req: Request, res: Response) => {
  const { slug } = req.params;
  const row = SLUG_RE.test(slug) ? findLive.get(slug) : undefined;
  if (!row?.thumbnail) return res.status(404).json({ error: 'No thumbnail. The demon is camera-shy.' });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(Buffer.from(row.thumbnail, 'base64'));
});
