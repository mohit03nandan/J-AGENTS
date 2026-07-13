import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import type { ApplicationRecord } from "../types.js";

const DB_PATH = "data/applications.json";

interface DbShape {
  version: 1;
  records: Record<string, ApplicationRecord>;
}

async function load(): Promise<DbShape> {
  if (!existsSync(DB_PATH)) return { version: 1, records: {} };
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DbShape;
}

async function save(db: DbShape): Promise<void> {
  await mkdir(dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
}

export async function hasSeen(jobId: string): Promise<boolean> {
  const db = await load();
  return Boolean(db.records[jobId]);
}

export async function upsert(record: ApplicationRecord): Promise<void> {
  const db = await load();
  db.records[record.jobId] = { ...db.records[record.jobId], ...record };
  await save(db);
}

export async function upsertMany(records: ApplicationRecord[]): Promise<void> {
  const db = await load();
  for (const r of records) {
    db.records[r.jobId] = { ...db.records[r.jobId], ...r };
  }
  await save(db);
}

export async function recentApplications(sinceIso: string): Promise<ApplicationRecord[]> {
  const db = await load();
  return Object.values(db.records).filter(
    (r) => r.appliedAt && r.appliedAt >= sinceIso,
  );
}

export async function allRecords(): Promise<ApplicationRecord[]> {
  const db = await load();
  return Object.values(db.records);
}
