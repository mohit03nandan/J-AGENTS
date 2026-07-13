import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { profile } from "../config/profile.js";
import { preferences } from "../config/preferences.js";
import type { JobPosting, ScoredJob } from "../types.js";

const scoreSchema = z.object({
  fitScore: z.number().min(0).max(100),
  reasoning: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  coverLetter: z.string(),
});

const MODEL_ID = process.env.AI_MODEL ?? "claude-sonnet-4-5";
const model = anthropic(MODEL_ID);

function buildPrompt(job: JobPosting): string {
  return `You are a hiring-matching assistant. Score how well a candidate fits a job posting.

CANDIDATE PROFILE:
Name: ${profile.fullName}
Role: ${profile.currentRole.title} at ${profile.currentRole.company}
Experience: ${profile.yearsOfExperience} years
Education: ${profile.education.degree}, ${profile.education.institute} (${profile.education.graduationYear}, CGPA ${profile.education.cgpa})
Skills:
  Languages: ${profile.skills.languages.join(", ")}
  Automation: ${profile.skills.automation.join(", ")}
  API/Load: ${profile.skills.api.join(", ")}
  CI/CD: ${profile.skills.cicd.join(", ")}
Strengths: ${profile.strengths.join(" | ")}

TARGET ROLES: ${preferences.targetTitles.join(", ")}
COMPENSATION: current ${preferences.compensation.currentLpa} LPA, expecting ${preferences.compensation.minExpectedLpa}-${preferences.compensation.idealExpectedLpa}+ LPA.

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description:
${job.description.slice(0, 4000)}

TASK:
1. fitScore (0-100): How well does the candidate match? Weight core skill overlap, seniority match, and role type.
2. reasoning: One tight paragraph explaining the score.
3. strengths: 3-5 bullet points of what makes the candidate a strong match.
4. gaps: 1-3 bullet points of gaps or risks.
5. coverLetter: A concise 120-180 word cover letter tailored to this JD. First person, professional, no fluff, mention 1-2 concrete achievements from the profile.

If the JD requires 5+ years experience or is clearly senior/staff/principal, score below 40.
If the JD is a different function (sales, marketing, hardware), score below 20.`;
}

export async function scoreJob(job: JobPosting): Promise<ScoredJob> {
  const { object } = await generateObject({
    model,
    schema: scoreSchema,
    prompt: buildPrompt(job),
  });

  return {
    ...job,
    fitScore: object.fitScore,
    reasoning: object.reasoning,
    strengths: object.strengths,
    gaps: object.gaps,
    coverLetter: object.coverLetter,
  };
}

export async function scoreAll(jobs: JobPosting[]): Promise<ScoredJob[]> {
  const results: ScoredJob[] = [];
  for (const job of jobs) {
    try {
      const scored = await scoreJob(job);
      results.push(scored);
      console.log(`[score] ${scored.fitScore}/100 — ${scored.title} @ ${scored.company}`);
    } catch (err) {
      console.warn(`[score] failed for ${job.title}: ${(err as Error).message}`);
    }
  }
  return results.sort((a, b) => b.fitScore - a.fitScore);
}
