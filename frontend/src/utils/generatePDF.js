import jsPDF from "jspdf";

// Generates and downloads the AI Resume Analysis PDF report.
export function downloadAnalysisPDF(analysis) {
  if (!analysis) return;

  const pdf = new jsPDF();

  let y = 20;
  pdf.setTextColor(63, 81, 181);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("SMART RESUME ANALYZER", 20, y);

  y += 10;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("AI Resume Analysis Report", 20, y);

  y += 8;

  pdf.setDrawColor(180);
  pdf.line(20, y, 190, y);

  y += 10;

  // Generated Date
  const currentDate = new Date().toLocaleString();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100);

  pdf.text(`Generated: ${currentDate}`, 20, y);

  y += 12;

  // Back to normal black text
  pdf.setTextColor(0);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Candidate Match Score", 20, y);

  y += 12;

  pdf.setTextColor(30, 64, 175);
  pdf.setFontSize(26);
  pdf.text(`${analysis.matchScore} / 100`, 20, y);

  y += 15;

  pdf.setTextColor(0);
  pdf.setFontSize(15);
  pdf.setFont("helvetica", "bold");
  pdf.text("Recommendation", 20, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.text(analysis.recommendation, 20, y);

  y += 12;

  const addSection = (title, items) => {
    if (!items || items.length === 0) return;

    if (y > 240) {
      pdf.addPage();
      y = 20;
    }

    pdf.setDrawColor(180);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);

    pdf.text(title, 20, y);

    y += 6;

    pdf.setDrawColor(220);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    items.forEach((item) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(`• ${item}`, 25, y);
      y += 8;
    });

    y += 10;
  };

  addSection("Matched Skills", analysis.matchedSkills);
  addSection("Missing Skills", analysis.missingSkills);
  addSection("Matched Keywords", analysis.matchedKeywords);
  addSection("Missing Keywords", analysis.missingKeywords);
  addSection("Candidate Strengths", analysis.strengths);
  addSection("Skill Gaps", analysis.skillGaps);

  if (analysis.reasoning) {
    pdf.setDrawColor(180);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Reasoning", 20, y);

    y += 8;

    pdf.setDrawColor(220);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const reasoning = pdf.splitTextToSize(analysis.reasoning, 170);

    if (y + reasoning.length * 7 > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(reasoning, 20, y);

    y += reasoning.length * 7 + 8;
  }

  addSection("Suggestions", analysis.suggestions);

  pdf.save("Resume-Analysis-Report.pdf");
}