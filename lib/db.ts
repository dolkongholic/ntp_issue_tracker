import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const EMPTY_DB: Database = { projects: [], notes: [] };

// Serializes reads/writes so concurrent requests from the 3 shared users
// can't interleave and corrupt the JSON file.
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

async function ensureDb(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      projects: parsed.projects ?? [],
      notes: parsed.notes ?? [],
    };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function withDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  return enqueue(async () => fn(await readDb()));
}

export function mutateDb<T>(
  fn: (db: Database) => T | Promise<T>
): Promise<T> {
  return enqueue(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
}
