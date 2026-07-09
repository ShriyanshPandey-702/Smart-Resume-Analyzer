import { jsPDF } from "jspdf";

// Brand palette (RGB)
const FOREST = [45, 70, 54];
const GOLD = [176, 140, 60];
const INK = [28, 26, 21];
const MUTED = [110, 103, 88];
const FAINT = [150, 143, 128];
const HAIR = [223, 216, 201];
const PAPER = [248, 244, 236];
const GREEN = [46, 120, 80];
const AMBER = [168, 120, 31];
const RED = [150, 60, 55];

// Page geometry (A4, mm)
const W = 210;
const H = 297;
const mL = 18;
const mR = 192;
const cW = mR - mL;

export function downloadAnalysisPDF(analysis, meta = {}, returnPdf = false) {
  if (!analysis) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const score = Math.max(0, Math.min(100, Math.round(analysis.matchScore ?? 0)));
  const band = score >= 75 ? GREEN : score >= 50 ? AMBER : RED;
  const verdict = analysis.recommendation || (score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Low Match");
  const interp =
    score >= 75
      ? "Above the 75% threshold most ATS-driven shortlists use - a strong candidate for this role."
      : score >= 50
      ? "A moderate match - competitive with focused improvements to the gaps noted below."
      : "Below the typical shortlist threshold - the gaps below are the priorities to address.";

  let y = 0;
  const footerLine = H - 14;

  const ensure = (space) => {
    if (y + space > footerLine) {
      pdf.addPage();
      y = 22;
    }
  };

  // ── Header band ────────────────────────────────────────────────
  pdf.setFillColor(...FOREST);
  pdf.rect(0, 0, W, 42, "F");
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 42, W, 1.4, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Hirely", mL, 19);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(200, 214, 200);
  pdf.text("PRECISION RECRUITMENT MATCHING", mL, 25, { charSpace: 0.5 });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Resume Analysis Report", mL, 35);

  // Score, right side
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(200, 214, 200);
  pdf.text("MATCH SCORE", mR, 15, { align: "right", charSpace: 0.5 });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.setTextColor(255, 255, 255);
  pdf.text(String(score), mR, 30, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(200, 214, 200);
  pdf.text("/ 100", mR, 37, { align: "right" });

  y = 54;

  // ── Meta line ──────────────────────────────────────────────────
  const metaBits = [
    `Generated ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`,
  ];
  if (meta.jobTitle) metaBits.push(`Role: ${meta.jobTitle}`);
  if (meta.fileName) metaBits.push(`File: ${meta.fileName}`);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...FAINT);
  pdf.text(metaBits.join("     |     "), mL, y);
  y += 8;

  // ── Verdict box ────────────────────────────────────────────────
  const boxH = 30;
  pdf.setFillColor(...PAPER);
  pdf.setDrawColor(...HAIR);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(mL, y, cW, boxH, 2.5, 2.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...band);
  pdf.text(verdict, mL + 6, y + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(pdf.splitTextToSize(interp, cW - 12), mL + 6, y + 16);

  // score bar
  const barY = y + 24;
  const barW = cW - 12;
  pdf.setFillColor(...HAIR);
  pdf.roundedRect(mL + 6, barY, barW, 2.4, 1.2, 1.2, "F");
  pdf.setFillColor(...band);
  pdf.roundedRect(mL + 6, barY, Math.max(2, (barW * score) / 100), 2.4, 1.2, 1.2, "F");
  y += boxH + 8;

  // ── Summary counts (extra info) ────────────────────────────────
  const ms = analysis.matchedSkills?.length || 0;
  const xs = analysis.missingSkills?.length || 0;
  const mk = analysis.matchedKeywords?.length || 0;
  const xk = analysis.missingKeywords?.length || 0;
  const summary = `${ms} of ${ms + xs} listed skills matched     |     ${mk} keywords matched     |     ${xk} keywords to add`;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(summary, mL, y);
  y += 4;
  pdf.setDrawColor(...HAIR);
  pdf.setLineWidth(0.3);
  pdf.line(mL, y, mR, y);
  y += 10;

  // ── Helpers ────────────────────────────────────────────────────
  const heading = (title, sub) => {
    ensure(sub ? 22 : 16);
    pdf.setFillColor(...GOLD);
    pdf.rect(mL, y - 3.4, 1.6, 4.6, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.setTextColor(...INK);
    pdf.text(title.toUpperCase(), mL + 4, y, { charSpace: 0.4 });
    y += 3;
    pdf.setDrawColor(...HAIR);
    pdf.setLineWidth(0.3);
    pdf.line(mL, y, mR, y);
    y += sub ? 5 : 6.5;
    if (sub) {
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...FAINT);
      pdf.text(sub, mL + 4, y);
      y += 6;
    }
  };

  const metricRow = (label, matched, total) => {
    const pct = total ? Math.round((matched / total) * 100) : 0;
    const c = pct >= 75 ? GREEN : pct >= 50 ? AMBER : RED;
    ensure(13);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...INK);
    pdf.text(label, mL, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.text(`${matched} of ${total}   (${pct}%)`, mR, y, { align: "right" });
    y += 3.5;
    pdf.setFillColor(...HAIR);
    pdf.roundedRect(mL, y, cW, 2, 1, 1, "F");
    pdf.setFillColor(...c);
    pdf.roundedRect(mL, y, Math.max(2, (cW * pct) / 100), 2, 1, 1, "F");
    y += 9;
  };

  const bullets = (items, dot = GOLD) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    items.forEach((it) => {
      const lines = pdf.splitTextToSize(String(it), cW - 6);
      ensure(lines.length * 5.2 + 3);
      pdf.setFillColor(...dot);
      pdf.circle(mL + 1.4, y - 1.4, 0.7, "F");
      pdf.setTextColor(...INK);
      pdf.text(lines, mL + 5, y);
      y += lines.length * 5.2 + 2.5;
    });
    y += 5;
  };

  const paragraph = (text) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...INK);
    const lines = pdf.splitTextToSize(String(text), cW);
    ensure(lines.length * 5.2 + 4);
    pdf.text(lines, mL, y);
    y += lines.length * 5.2 + 6;
  };

  const inlineList = (items) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...MUTED);
    const lines = pdf.splitTextToSize(items.join(",   "), cW);
    ensure(lines.length * 5.2 + 4);
    pdf.text(lines, mL, y);
    y += lines.length * 5.2 + 6;
  };

  const numbered = (items) => {
    pdf.setFontSize(10.5);
    items.forEach((it, i) => {
      const lines = pdf.splitTextToSize(String(it), cW - 10);
      ensure(lines.length * 5.2 + 3);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...GOLD);
      pdf.text(String(i + 1).padStart(2, "0"), mL, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...INK);
      pdf.text(lines, mL + 9, y);
      y += lines.length * 5.2 + 3;
    });
    y += 5;
  };

  // ── Match breakdown (extra detail) ─────────────────────────────
  if (ms + xs > 0 || mk + xk > 0) {
    heading("Match Breakdown", "How the score breaks down across skills and keywords.");
    if (ms + xs > 0) metricRow("Skills coverage", ms, ms + xs);
    if (mk + xk > 0) metricRow("Keyword coverage", mk, mk + xk);
    y += 2;
  }

  // ── Body ───────────────────────────────────────────────────────
  if (analysis.matchedSkills?.length) {
    heading("Matched Skills", "Skills from the job description evidenced in the resume.");
    bullets(analysis.matchedSkills, GREEN);
  }
  if (analysis.missingSkills?.length) {
    heading("Missing Skills", "Required skills with no clear evidence in the resume - the key gaps to close.");
    bullets(analysis.missingSkills, RED);
  }
  if (analysis.matchedKeywords?.length) {
    heading("Matched Keywords", "ATS keywords already present in the resume.");
    inlineList(analysis.matchedKeywords);
  }
  if (analysis.missingKeywords?.length) {
    heading("Keywords to Add", "High-signal terms from the posting worth adding where truthful.");
    inlineList(analysis.missingKeywords);
  }
  if (analysis.strengths?.length) {
    heading("Candidate Strengths", "What stands out in this resume for the role.");
    bullets(analysis.strengths, GREEN);
  }
  if (analysis.skillGaps?.length) {
    heading("Skill Gaps", "Areas that would most improve the match if addressed.");
    bullets(analysis.skillGaps, RED);
  }
  if (analysis.reasoning) {
    heading("Recruiter Reasoning", "How the AI arrived at this score.");
    paragraph(analysis.reasoning);
  }
  if (analysis.suggestions?.length) {
    heading("Recommended Next Steps", "Concrete actions to raise the match score.");
    numbered(analysis.suggestions);
  }

  // ── About this report ──────────────────────────────────────────
  ensure(26);
  pdf.setDrawColor(...HAIR);
  pdf.setLineWidth(0.3);
  pdf.line(mL, y, mR, y);
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...INK);
  pdf.text("ABOUT THIS REPORT", mL, y, { charSpace: 0.4 });
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  const about =
    "Generated by Hirely's AI analysis of the resume against the provided job description. Scores reflect ATS keyword and skill alignment and are indicative only - use them alongside human judgement, not as the sole basis for a hiring decision.";
  pdf.text(pdf.splitTextToSize(about, cW), mL, y);

  // ── Footer on every page ───────────────────────────────────────
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(...HAIR);
    pdf.setLineWidth(0.3);
    pdf.line(mL, H - 12, mR, H - 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...FAINT);
    pdf.text("Generated by Hirely  ·  AI-powered ATS analysis", mL, H - 7);
    pdf.text(`Page ${p} of ${pages}`, mR, H - 7, { align: "right" });
  }

  if (returnPdf) return pdf;
  pdf.save("Hirely-Resume-Analysis-Report.pdf");
}
