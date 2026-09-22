import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySchema } from './schema.js';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ?? join(here, '../../data/facedoodle.db');

mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
applySchema(db);

export interface ShareRow {
  slug: string;
  config: string;
  thumbnail: string | null;
  created_at: string;
  expires_at: string | null;
  views: number;
}
