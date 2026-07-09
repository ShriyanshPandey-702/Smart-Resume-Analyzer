import { jsPDF } from "jspdf";

// Brand palette (RGB) — shared with the analysis report
const FOREST = [45, 70, 54];
const GOLD = [176, 140, 60];
const INK = [28, 26, 21];
const MUTED = [110, 103, 88];
const FAINT = [150, 143, 128];
const HAIR = [223, 216, 201];
const PAPER = [248, 244, 236];
const GREEN = [46, 120, 80];
const RED = [150, 60, 55];

// The two comparison-series colours (A / B)
const CMP_A = [176, 130, 60];
const CMP_B = [63, 111, 107];

const MODE_LABELS = {
  general: "General ATS", swe: "Software Engineer", frontend: "Frontend Developer",
  backend: "Backend Developer", fullstack: "Full Stack", datascience: "Data Science",
  ml: "Machine Learning", uiux: "UI / UX", pm: "Product Manager", devops: "DevOps",
  security: "Cyber Security",
};

// Page geometry (A4, mm)
const W = 210;
const H = 297;
const mL = 18;
const mR = 192;
const cW = mR - mL;

export function downloadComparePDF(data, meta = {}, returnPdf = false) {
  if (!data) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const nameA = data.resumeA?.candidateName || meta.fileA || "Resume A";
  const nameB = data.resumeB?.candidateName || meta.fileB || "Resume B";
  const scoreA = Math.round(Number(data.resumeA?.atsScore ?? 0));
  const scoreB = Math.round(Number(data.resumeB?.atsScore ?? 0));
  const winner = data.winner === "A" ? "A" : data.winner === "B" ? "B" : "Tie";
  const winnerName = winner === "A" ? nameA : winner === "B" ? nameB : "Tie";

  let y = 0;
  const footerLine = H - 14;
  const ensure = (space) => {
    if (y + space > footerLine) { pdf.addPage(); y = 22; }
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
  pdf.text("Resume Comparison Report", mL, 35);

  // Winner, right side
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(200, 214, 200);
  pdf.text("WINNER", mR, 15, { align: "right", charSpace: 0.5 });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text(winner === "Tie" ? "Tie" : `Resume ${winner}`, mR, 27, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(200, 214, 200);
  pdf.text(pdf.splitTextToSize(winnerName, 70), mR, 34, { align: "right" });

  y = 54;

  // ── Meta line ──────────────────────────────────────────────────
  const metaBits = [
    `Generated ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`,
    `Mode: ${MODE_LABELS[meta.mode] || "General ATS"}`,
  ];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...FAINT);
  pdf.text(metaBits.join("     |     "), mL, y);
  y += 8;

  // ── Score face-off box ─────────────────────────────────────────
  const boxH = 40;
  pdf.setFillColor(...PAPER);
  pdf.setDrawColor(...HAIR);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(mL, y, cW, boxH, 2.5, 2.5, "FD");

  const halfW = cW / 2 - 8;
  const drawSide = (x, label, name, score, col) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...col);
    pdf.text(label, x, y + 8, { charSpace: 0.5 });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...INK);
    pdf.text(pdf.splitTextToSize(name, halfW), x, y + 15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(...col);
    pdf.text(`${score}`, x, y + 30);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.text("/ 100 ATS", x + (score >= 100 ? 20 : score >= 10 ? 14 : 8), y + 30);
    // bar
    pdf.setFillColor(...HAIR);
    pdf.roundedRect(x, y + 34, halfW, 2, 1, 1, "F");
    pdf.setFillColor(...col);
    pdf.roundedRect(x, y + 34, Math.max(2, (halfW * score) / 100), 2, 1, 1, "F");
  };
  drawSide(mL + 6, "RESUME A", nameA, scoreA, CMP_A);
  // divider
  pdf.setDrawColor(...HAIR);
  pdf.line(W / 2, y + 6, W / 2, y + boxH - 6);
  drawSide(W / 2 + 6, "RESUME B", nameB, scoreB, CMP_B);
  y += boxH + 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(
    `Score difference: ${data.scoreDifference ?? Math.abs(scoreA - scoreB)} pts     |     AI confidence: ${Math.round(Number(data.aiConfidence ?? 0))}%`,
    mL, y
  );
  y += 5;
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

  const paragraph = (text) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...INK);
    const lines = pdf.splitTextToSize(String(text), cW);
    ensure(lines.length * 5.2 + 4);
    pdf.text(lines, mL, y);
    y += lines.length * 5.2 + 6;
  };

  // Paired 0–10 / 0–100 comparison bar per row
  const compareRow = (label, a, b, max, note) => {
    ensure(note ? 20 : 15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...INK);
    pdf.text(label, mL, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...CMP_A);
    pdf.text(`A ${a}`, mR - 20, y, { align: "right" });
    pdf.setTextColor(...CMP_B);
    pdf.text(`B ${b}`, mR, y, { align: "right" });
    y += 3;
    // two stacked mini bars
    const bw = cW;
    pdf.setFillColor(...HAIR);
    pdf.roundedRect(mL, y, bw, 1.6, 0.8, 0.8, "F");
    pdf.setFillColor(...CMP_A);
    pdf.roundedRect(mL, y, Math.max(1, (bw * a) / max), 1.6, 0.8, 0.8, "F");
    y += 2.6;
    pdf.setFillColor(...HAIR);
    pdf.roundedRect(mL, y, bw, 1.6, 0.8, 0.8, "F");
    pdf.setFillColor(...CMP_B);
    pdf.roundedRect(mL, y, Math.max(1, (bw * b) / max), 1.6, 0.8, 0.8, "F");
    y += 3.5;
    if (note) {
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(...FAINT);
      const lines = pdf.splitTextToSize(note, cW);
      pdf.text(lines, mL, y);
      y += lines.length * 4 + 2;
    }
    y += 3;
  };

  const numbered = (items, col = GOLD) => {
    pdf.setFontSize(10);
    items.forEach((it, i) => {
      const lines = pdf.splitTextToSize(String(it), cW - 10);
      ensure(lines.length * 5 + 3);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...col);
      pdf.text(String(i + 1).padStart(2, "0"), mL, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...INK);
      pdf.text(lines, mL + 9, y);
      y += lines.length * 5 + 3;
    });
    y += 4;
  };

  const bullets = (items, dot = GOLD) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    items.forEach((it) => {
      const lines = pdf.splitTextToSize(String(it), cW - 6);
      ensure(lines.length * 5 + 3);
      pdf.setFillColor(...dot);
      pdf.circle(mL + 1.4, y - 1.4, 0.7, "F");
      pdf.setTextColor(...INK);
      pdf.text(lines, mL + 5, y);
      y += lines.length * 5 + 2.5;
    });
    y += 4;
  };

  const inlineList = (items) => {
    if (!items?.length) return;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...MUTED);
    const lines = pdf.splitTextToSize(items.join(",   "), cW);
    ensure(lines.length * 5 + 4);
    pdf.text(lines, mL, y);
    y += lines.length * 5 + 5;
  };

  // ── Overall verdict ────────────────────────────────────────────
  if (data.verdict) {
    heading("Overall Verdict", "Why the AI judged one resume stronger.");
    paragraph(data.verdict);
  }

  // ── Category comparison ────────────────────────────────────────
  if (Array.isArray(data.categories) && data.categories.length) {
    heading("Category Comparison", "Scored 0–10 per category. Top bar = A, bottom bar = B.");
    data.categories.forEach((c) => {
      const w = c.winner === "A" ? "  · edge: A" : c.winner === "B" ? "  · edge: B" : "  · even";
      compareRow(`${c.name}${w}`, Number(c.a ?? 0), Number(c.b ?? 0), 10, c.reason);
    });
  }

  // ── Skills comparison ──────────────────────────────────────────
  if (Array.isArray(data.skills) && data.skills.length) {
    heading("Skills Coverage", "Area coverage, 0–100. Top bar = A, bottom bar = B.");
    data.skills.forEach((s) => compareRow(s.group, Number(s.a ?? 0), Number(s.b ?? 0), 100));
  }

  // ── Keyword analysis ───────────────────────────────────────────
  const kw = data.keywords || {};
  if (kw.matched?.length || kw.onlyA?.length || kw.onlyB?.length || kw.missing?.length) {
    heading("Keyword Analysis", "Where the two resumes overlap and diverge.");
    if (kw.matched?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...GREEN);
      ensure(8); pdf.text("In both resumes", mL, y); y += 5; inlineList(kw.matched);
    }
    if (kw.onlyA?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_A);
      ensure(8); pdf.text("Only in Resume A", mL, y); y += 5; inlineList(kw.onlyA);
    }
    if (kw.onlyB?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_B);
      ensure(8); pdf.text("Only in Resume B", mL, y); y += 5; inlineList(kw.onlyB);
    }
    if (kw.missing?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...RED);
      ensure(8); pdf.text("Missing from both", mL, y); y += 5; inlineList(kw.missing);
    }
  }

  // ── Suggestions ────────────────────────────────────────────────
  if (data.suggestionsA?.length) {
    heading(`Suggestions — ${nameA}`, "How Resume A could improve.");
    numbered(data.suggestionsA, CMP_A);
  }
  if (data.suggestionsB?.length) {
    heading(`Suggestions — ${nameB}`, "How Resume B could improve.");
    numbered(data.suggestionsB, CMP_B);
  }

  // ── Recruiter opinion ──────────────────────────────────────────
  const rec = data.recruiter || {};
  if (rec.strengthsA?.length || rec.strengthsB?.length || rec.hiringConfidence) {
    heading("Recruiter Opinion", "A recruiter's read on each candidate.");
    if (rec.strengthsA?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_A);
      ensure(8); pdf.text(`${nameA} — strengths`, mL, y); y += 5; bullets(rec.strengthsA, GREEN);
    }
    if (rec.weaknessesA?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_A);
      ensure(8); pdf.text(`${nameA} — weaknesses`, mL, y); y += 5; bullets(rec.weaknessesA, RED);
    }
    if (rec.strengthsB?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_B);
      ensure(8); pdf.text(`${nameB} — strengths`, mL, y); y += 5; bullets(rec.strengthsB, GREEN);
    }
    if (rec.weaknessesB?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...CMP_B);
      ensure(8); pdf.text(`${nameB} — weaknesses`, mL, y); y += 5; bullets(rec.weaknessesB, RED);
    }
    if (rec.hiringConfidence) paragraph(`Hiring confidence: ${rec.hiringConfidence}`);
    if (rec.interviewRecommendation) paragraph(`Interview recommendation: ${rec.interviewRecommendation}`);
  }

  // ── Final verdict ──────────────────────────────────────────────
  const fv = data.finalVerdict || {};
  if (fv.reasoning || fv.winner) {
    heading("AI Final Verdict", null);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...FOREST);
    const fvWinner = fv.winner === "A" ? nameA : fv.winner === "B" ? nameB : "Tie";
    ensure(10);
    pdf.text(`Recommended: ${fvWinner}`, mL, y);
    if (fv.confidence != null) {
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...MUTED);
      pdf.text(`Confidence ${Math.round(Number(fv.confidence))}%`, mR, y, { align: "right" });
    }
    y += 7;
    if (fv.reasoning) paragraph(fv.reasoning);
    if (fv.suitableRoles?.length) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5); pdf.setTextColor(...INK);
      ensure(8); pdf.text("Suitable roles", mL, y); y += 5; inlineList(fv.suitableRoles);
    }
    if (fv.hiringRecommendation) paragraph(fv.hiringRecommendation);
  }

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
    pdf.text("Generated by Hirely  ·  AI-powered resume comparison", mL, H - 7);
    pdf.text(`Page ${p} of ${pages}`, mR, H - 7, { align: "right" });
  }

  if (returnPdf) return pdf;
  pdf.save("Hirely-Resume-Comparison-Report.pdf");
}
