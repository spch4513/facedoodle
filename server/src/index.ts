import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shareRouter } from './routes/share.js';
import { db, type ShareRow } from './db/index.js';

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT ?? 3001);
const here = dirname(fileURLToPath(import.meta.url));
const clientDist = join(here, '../../client/dist');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
if (!isProd) app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, mood: 'mischievous' }));
app.use('/api/share', shareRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'That API route went to the shadow realm.' }));

if (isProd && existsSync(clientDist)) {
  const indexHtml = readFileSync(join(clientDist, 'index.html'), 'utf8');
  const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const findThumb = db.prepare<[string], Pick<ShareRow, 'slug'>>(
    `SELECT slug FROM shares WHERE slug = ? AND thumbnail IS NOT NULL`,
  );

  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  // Share links get OG tags so they preview nicely when pasted into a group chat.
  app.get('/s/:slug', (req, res) => {
    const base = process.env.PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;
    const hasThumb = /^[a-z0-9]{6}$/.test(req.params.slug) && !!findThumb.get(req.params.slug);
    const og = [
      `<meta property="og:title" content="Someone got FaceDoodled 😈" />`,
      `<meta property="og:description" content="${escape('Horns, fangs, a snot bubble. Make your own.')}" />`,
      hasThumb ? `<meta property="og:image" content="${base}/api/share/${req.params.slug}/thumbnail" />` : '',
      `<meta name="twitter:card" content="summary_large_image" />`,
    ].join('\n    ');
    res.type('html').send(indexHtml.replace('</head>', `    ${og}\n  </head>`));
  });
  app.get('*', (_req, res) => res.type('html').send(indexHtml));
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if ((err as { type?: string }).type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too thicc.' });
  }
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'That JSON is possessed. Could not parse it.' });
  console.error('[facedoodle] unhandled error:', err);
  return res.status(500).json({ error: 'Something went demonically wrong on our end.' });
});

app.listen(PORT, () => {
  console.log(`😈 FaceDoodle server lurking on http://localhost:${PORT}${isProd ? ' (production)' : ''}`);
});
