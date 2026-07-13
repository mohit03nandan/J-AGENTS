import "dotenv/config";
import { discoverAll } from "./discovery/index.js";
import { scoreAll } from "./matching/score.js";
import { hasSeen, upsertMany } from "./storage/db.js";
import { writeMarkdownDigest, sendEmailDigest } from "./notifications/digest.js";
import { preferences } from "./config/preferences.js";
import type { ApplicationRecord } from "./types.js";

async function main() {
  console.log(`[agent] starting`);

  // === DISCOVER ===
  const rawJobs = await discoverAll();
  const fresh = [];
  for (const j of rawJobs) {
    if (!(await hasSeen(j.id))) fresh.push(j);
  }
  console.log(`[agent] discovered ${rawJobs.length}, ${fresh.length} new`);

  await upsertMany(
    fresh.map<ApplicationRecord>((j) => ({
      jobId: j.id,
      status: "discovered",
      url: j.url,
      title: j.title,
      company: j.company,
      board: j.board,
    })),
  );

  if (fresh.length === 0) {
    console.log("[agent] nothing new; done");
    return;
  }

  // === SCORE + TAILOR ===
  const scored = await scoreAll(fresh);

  await upsertMany(
    scored.map<ApplicationRecord>((s) => ({
      jobId: s.id,
      status: s.fitScore >= preferences.runtime.minFitScoreToApply ? "manual_review" : "skipped_lowfit",
      fitScore: s.fitScore,
      reasoning: s.reasoning,
      url: s.url,
      title: s.title,
      company: s.company,
      board: s.board,
    })),
  );

  // === DIGEST ===
  const surface = scored.filter((s) => s.fitScore >= preferences.runtime.minFitScoreToSurface);
  const path = await writeMarkdownDigest(surface);
  await sendEmailDigest(surface, path);

  console.log("[agent] done");
}

main().catch((err) => {
  console.error("[agent] fatal:", err);
  process.exit(1);
});
