import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("bizflow-offline.db");
    await initTables();
  }
  return db;
}

async function initTables() {
  if (!db) return;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mutation TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cached_clients (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cached_services (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cached_appointments (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export async function addToOfflineQueue(mutation: string) {
  const database = await getDB();
  await database.runAsync(
    "INSERT INTO offline_queue (mutation, created_at) VALUES (?, ?)",
    mutation,
    Date.now()
  );
}

export async function getOfflineQueue() {
  const database = await getDB();
  return await database.getAllAsync<{ id: number; mutation: string; created_at: number }>(
    "SELECT * FROM offline_queue ORDER BY created_at ASC"
  );
}

export async function removeFromQueue(id: number) {
  const database = await getDB();
  await database.runAsync("DELETE FROM offline_queue WHERE id = ?", id);
}

export async function clearQueue() {
  const database = await getDB();
  await database.runAsync("DELETE FROM offline_queue");
}

export async function cacheData(table: string, id: string, data: unknown) {
  const database = await getDB();
  const key = `cached_${table}`;
  await database.runAsync(
    `INSERT OR REPLACE INTO ${key} (id, data, updated_at) VALUES (?, ?, ?)`,
    id,
    JSON.stringify(data),
    Date.now()
  );
}

export async function getCachedData(table: string, id: string) {
  const database = await getDB();
  const key = `cached_${table}`;
  const row = await database.getFirstAsync<{ data: string }>(
    `SELECT data FROM ${key} WHERE id = ?`,
    id
  );
  return row ? JSON.parse(row.data) : null;
}
