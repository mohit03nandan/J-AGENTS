import { mkdir, writeFile } from "node:fs/promises";
import { Resend } from "resend";
import type { ScoredJob } from "../types.js";

function scoreEmoji(score: number): string {
  if (score >= 80) return "🟢";
  if (score >= 65) return "🟡";
  if (score >= 45) return "🟠";
  return "🔴";
}

function fmtSalary(min?: number, max?: number, currency?: string): string {
  if (!min && !max) return "";
  const c = currency ?? "INR";
  if (min && max) return `${c} ${min.toLocaleString()}–${max.toLocaleString()}`;
  return `${c} ${(min ?? max)?.toLocaleString()}`;
}

function jobMarkdown(job: ScoredJob): string {
  return `## ${scoreEmoji(job.fitScore)} ${job.fitScore}/100 — ${job.title}

**Company:** ${job.company}
**Location:** ${job.location}
**Board:** ${job.board}
**Posted:** ${job.postedAt ? new Date(job.postedAt).toDateString() : "recent"}

**Why it fits:** ${job.reasoning}

**Strengths to highlight:**
${job.strengths.map((s) => `- ${s}`).join("\n")}

${job.gaps.length ? `**Gaps to address:**\n${job.gaps.map((g) => `- ${g}`).join("\n")}\n` : ""}

<details>
<summary><strong>📝 Tailored cover letter</strong> (click to expand & copy)</summary>

\`\`\`
${job.coverLetter ?? ""}
\`\`\`

</details>

### 👉 [Apply now](${job.url})

---
`;
}

export async function writeMarkdownDigest(scored: ScoredJob[]): Promise<string> {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 16);
  const dir = "digests";
  await mkdir(dir, { recursive: true });
  const path = `${dir}/${stamp}.md`;

  const hot = scored.filter((j) => j.fitScore >= 65);
  const warm = scored.filter((j) => j.fitScore >= 45 && j.fitScore < 65);

  const body = `# Job Digest — ${now.toUTCString()}

Total scored: **${scored.length}** · 🟢🟡 Apply-worthy: **${hot.length}** · 🟠 Worth a look: **${warm.length}**

---

${hot.length ? `# 🎯 Top matches (score ≥ 65)\n\n${hot.map(jobMarkdown).join("\n")}` : "_No matches above the apply threshold this run._\n"}

${warm.length ? `# 👀 Worth a look (45–64)\n\n${warm.map(jobMarkdown).join("\n")}` : ""}
`;

  await writeFile(path, body, "utf8");
  console.log(`[digest] wrote ${path}`);
  return path;
}

export async function sendEmailDigest(scored: ScoredJob[], markdownPath: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.DIGEST_TO_EMAIL;
  const from = process.env.DIGEST_FROM_EMAIL;
  if (!key || !to || !from) {
    console.warn("[digest] Resend not configured, skipping email");
    return;
  }
  const hot = scored.filter((j) => j.fitScore >= 65);
  if (hot.length === 0 && scored.length === 0) {
    console.log("[digest] nothing to email");
    return;
  }

  const rows = scored
    .slice()
    .sort((a, b) => b.fitScore - a.fitScore)
    .map(
      (j) => `
        <tr>
          <td style="padding:8px;">${j.fitScore}</td>
          <td style="padding:8px;"><strong>${escape(j.title)}</strong><br><span style="color:#666;">${escape(j.company)} · ${escape(j.location)}</span></td>
          <td style="padding:8px;">${escape(j.reasoning.slice(0, 200))}…</td>
          <td style="padding:8px;"><a href="${j.url}" style="background:#0066cc;color:#fff;padding:6px 12px;border-radius:4px;text-decoration:none;">Apply</a></td>
        </tr>`,
    )
    .join("");

  const html = `
    <h2>Job Agent Digest</h2>
    <p><strong>${hot.length}</strong> apply-worthy · <strong>${scored.length}</strong> total. Full details + cover letters in the committed digest file: <code>${markdownPath}</code></p>
    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;">
      <thead style="background:#f4f4f4;"><tr><th>Fit</th><th>Role</th><th>Why</th><th>Apply</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#666;font-size:12px;">Cover letters and full JD reasoning are in the Markdown digest committed to the repo.</p>
  `;

  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to,
    subject: `Job Agent: ${hot.length} top matches, ${scored.length} total`,
    html,
  });
  console.log(`[digest] email sent to ${to}`);
}

function escape(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
