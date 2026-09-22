import type Database from 'better-sqlite3';

export function applySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shares (
      slug TEXT PRIMARY KEY,
      config TEXT NOT NULL,          -- JSON string of { effects, intensity, faceData }
      thumbnail TEXT,                -- base64-encoded PNG thumbnail (nullable)
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT,               -- optional expiry timestamp
      views INTEGER NOT NULL DEFAULT 0
    );
  `);
}
