import initSqlJs, { Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'dev.db');

let db: Database | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQL: any = null;

async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SqlJs = await initSQL();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SqlJs.Database(buffer);
  } else {
    const newDb = new SqlJs.Database();
    initializeSchema(newDb);
    db = newDb;
    saveDb();
  }

  return db!;
}

function initializeSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      building TEXT NOT NULL,
      floor INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      equipment TEXT NOT NULL,
      description TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      roomId TEXT NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (roomId) REFERENCES rooms(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

export function generateId(): string {
  return 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}
