import { preferences } from "../config/preferences.js";
import type { JobPosting } from "../types.js";

// Adzuna API — https://developer.adzuna.com/
// Free tier: 250 calls/month, 50 results per call. No subscription trap.

const BASE = "https://api.adzuna.com/v1/api/jobs/in/search"; // "in" = India country code

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  created?: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_time?: string;
  category?: { label?: string };
}

interface AdzunaResponse {
  count: number;
  results: AdzunaJob[];
}

export async function discoverAdzuna(): Promise<JobPosting[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    console.warn("[adzuna] ADZUNA_APP_ID/ADZUNA_APP_KEY not set");
    return [];
  }

  const collected = new Map<string, JobPosting>();

  for (const title of preferences.targetTitles.slice(0, 6)) {
    const url =
      `${BASE}/1?app_id=${appId}&app_key=${appKey}` +
      `&results_per_page=25` +
      `&what=${encodeURIComponent(title)}` +
      `&max_days_old=14` +
      `&sort_by=date`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn(`[adzuna] "${title}" HTTP ${res.status}: ${body.slice(0, 150)}`);
        continue;
      }
      const body = (await res.json()) as AdzunaResponse;
      for (const j of body.results ?? []) {
        if (collected.has(j.id)) continue;
        collected.set(j.id, {
          id: `adzuna:${j.id}`,
          board: "indeed", // Adzuna aggregates — treat as generic
          url: j.redirect_url,
          title: j.title,
          company: j.company?.display_name ?? "Unknown",
          location: j.location?.display_name ?? "India",
          postedAt: j.created,
          description: j.description ?? "",
          easyApply: false,
          discoveredAt: new Date().toISOString(),
        });
      }
      console.log(`[adzuna] "${title}" → ${body.results?.length ?? 0} results (cumulative ${collected.size})`);
    } catch (err) {
      console.warn(`[adzuna] "${title}" failed:`, (err as Error).message);
    }
  }

  return [...collected.values()];
}
