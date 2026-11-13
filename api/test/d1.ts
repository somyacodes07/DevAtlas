import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

/**
 * A stand-in for Cloudflare D1 built on Node's own SQLite.
 * D1 is SQLite, so the API's real SQL (FTS5, json_each, upserts) runs here
 * unchanged, against the real migration files, with no network and no emulator.
 */
class Statement {
  constructor(private db: DatabaseSync, private sql: string, private args: unknown[] = []) {}

  bind(...args: unknown[]) {
    return new Statement(this.db, this.sql, args);
  }

  private params() {
    return this.args.map((a) => (typeof a === 'boolean' ? Number(a) : a === undefined ? null : a)) as never[];
  }

  async all<T>() {
    const stmt = this.db.prepare(this.sql);
    if (/^\s*(select|with)/i.test(this.sql)) {
      return { results: stmt.all(...this.params()).map((r) => ({ ...r })) as T[], success: true, meta: { changes: 0 } };
    }
    const info = stmt.run(...this.params());
    return { results: [] as T[], success: true, meta: { changes: Number(info.changes) } };
  }

  async first<T>() {
    return ((await this.all<T>()).results[0] ?? null) as T | null;
  }

  async run() {
    return this.all();
  }
}

export function createD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations');
  for (const file of fs.readdirSync(dir).sort()) db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
  return {
    prepare: (sql: string) => new Statement(db, sql),
    // Like D1, a batch is a transaction: all of it lands or none of it does.
    batch: async (statements: Statement[]) => {
      db.exec('BEGIN');
      try {
        const out = [];
        for (const s of statements) out.push(await s.all());
        db.exec('COMMIT');
        return out;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },
  } as unknown as D1Database;
}
