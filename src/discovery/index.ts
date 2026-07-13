import { discoverAdzuna } from "./adzuna.js";
import { preferences } from "../config/preferences.js";
import type { JobPosting } from "../types.js";

export async function discoverAll(): Promise<JobPosting[]> {
  const jobs: JobPosting[] = [];
  try {
    jobs.push(...(await discoverAdzuna()));
  } catch (err) {
    console.error("[discovery] adzuna failed:", (err as Error).message);
  }
  return dedupe(applyFilters(jobs));
}

function applyFilters(jobs: JobPosting[]): JobPosting[] {
  const exclude = preferences.keywordsExclude.map((k) => k.toLowerCase());
  const excludedCompanies = preferences.excludeCompanies.map((c) => c.toLowerCase());
  return jobs.filter((j) => {
    const hay = `${j.title} ${j.description}`.toLowerCase();
    if (exclude.some((k) => hay.includes(k))) return false;
    if (excludedCompanies.some((c) => j.company.toLowerCase().includes(c))) return false;
    return true;
  });
}

function dedupe(jobs: JobPosting[]): JobPosting[] {
  const seen = new Set<string>();
  const out: JobPosting[] = [];
  for (const j of jobs) {
    const key = `${j.company.toLowerCase()}|${j.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}
