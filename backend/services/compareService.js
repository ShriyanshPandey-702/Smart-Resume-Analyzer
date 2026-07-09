const ai = require("../config/gemini");
const extractTextFromPDF = require("../utils/extractText");
const isResume = require("../utils/validateResume");

// Radar axes and category/skill buckets are fixed so the UI can rely on them.
const RADAR_AXES = [
  "Technical Skills",
  "Projects",
  "Experience",
  "Education",
  "Keyword Match",
  "Formatting",
  "Achievements",
  "Communication",
  "Leadership",
  "ATS Compatibility",
];

const CATEGORIES = [
  "Formatting",
  "Projects",
  "Skills",
  "Experience",
  "Education",
  "Achievements",
  "Certifications",
  "Leadership",
  "Summary",
  "Grammar",
  "Readability",
  "ATS Optimization",
];

const SKILL_GROUPS = [
  "Frontend",
  "Backend",
  "Database",
  "Cloud",
  "AI",
  "Programming",
  "Frameworks",
  "DevOps",
  "Testing",
  "Tools",
];

const MODE_LABELS = {
  general: "General ATS best practices",
  swe: "Software Engineer",
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Full Stack Developer",
  datascience: "Data Science",
  ml: "Machine Learning",
  uiux: "UI / UX Designer",
  pm: "Product Manager",
  devops: "DevOps Engineer",
  security: "Cyber Security",
};

const compareResumes = async (fileA, fileB, mode = "general", labelA = "Resume A", labelB = "Resume B") => {
  const [textA, textB] = await Promise.all([
    extractTextFromPDF(fileA.path),
    extractTextFromPDF(fileB.path),
  ]);

  if (!isResume(textA) || !isResume(textB)) {
    return {
      error: true,
      message: "One of the uploaded files does not look like a resume. Please upload valid resumes.",
    };
  }

  const roleContext = MODE_LABELS[mode] || MODE_LABELS.general;

  const prompt = `
You are an expert Technical Recruiter and ATS Resume Screening System.

You are comparing TWO resumes for the role context: "${roleContext}".
Resume A is labelled "${labelA}". Resume B is labelled "${labelB}".

Analyze EACH resume independently, then compare them objectively.

Return ONLY valid JSON in EXACTLY this shape (no markdown, no commentary):

{
  "resumeA": { "candidateName": string, "atsScore": number },
  "resumeB": { "candidateName": string, "atsScore": number },
  "winner": "A" | "B" | "Tie",
  "scoreDifference": number,
  "aiConfidence": number,
  "verdict": string,
  "radar": [ { "axis": string, "a": number, "b": number } ],
  "categories": [ { "name": string, "a": number, "b": number, "winner": "A"|"B"|"Tie", "reason": string } ],
  "keywords": { "matched": string[], "onlyA": string[], "onlyB": string[], "missing": string[] },
  "skills": [ { "group": string, "a": number, "b": number } ],
  "suggestionsA": string[],
  "suggestionsB": string[],
  "recruiter": {
    "strengthsA": string[], "weaknessesA": string[],
    "strengthsB": string[], "weaknessesB": string[],
    "hiringConfidence": string, "interviewRecommendation": string
  },
  "finalVerdict": { "winner": "A"|"B"|"Tie", "confidence": number, "reasoning": string, "suitableRoles": string[], "hiringRecommendation": string }
}

Rules:
- atsScore: 0–100 for each resume, based on alignment with "${roleContext}" and ATS best practices.
- aiConfidence and finalVerdict.confidence: 0–100.
- scoreDifference: absolute difference of the two atsScores.
- winner / finalVerdict.winner: "A" if Resume A is stronger, "B" if Resume B, "Tie" only if truly equal.
- verdict: 2–3 sentence professional explanation of WHY the winner is stronger.
- radar: return EXACTLY these axes in this order, each with a & b as 0–100: ${JSON.stringify(RADAR_AXES)}.
- categories: return EXACTLY these, each with a & b as 0–10 (one decimal ok), a winner, and a 6–14 word reason: ${JSON.stringify(CATEGORIES)}.
- skills: return EXACTLY these groups, each with a & b as 0–100 (coverage of that area): ${JSON.stringify(SKILL_GROUPS)}. Use 0 if a resume shows nothing for that group.
- keywords.matched: strong keywords present in BOTH. onlyA: strong keywords in A but not B. onlyB: in B but not A. missing: important keywords for "${roleContext}" absent from both. 4–12 items each where possible.
- suggestionsA / suggestionsB: 3–6 concrete, specific improvements each.
- recruiter: 2–4 strengths and 2–4 weaknesses per resume; hiringConfidence and interviewRecommendation are 1–2 sentences.
- finalVerdict.suitableRoles: 2–4 roles. reasoning & hiringRecommendation: 1–3 sentences.
- Base EVERYTHING strictly on the resume text. Do NOT invent skills, projects, education, or experience.
- All numbers must be internally consistent (a higher atsScore should reflect stronger radar/category/skill scores).

Resume A (${labelA}):
${textA}

-------------------------------------

Resume B (${labelB}):
${textB}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  let text = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(text);
    // Normalise a couple of derived fields defensively
    const a = Number(parsed.resumeA?.atsScore ?? 0);
    const b = Number(parsed.resumeB?.atsScore ?? 0);
    parsed.scoreDifference = Math.abs(Math.round(a - b));
    if (!parsed.winner) parsed.winner = a === b ? "Tie" : a > b ? "A" : "B";
    return parsed;
  } catch (err) {
    console.error("Invalid JSON returned by Gemini (compare):", text);
    return { error: true, message: "Failed to parse AI response. Please try again." };
  }
};

module.exports = { compareResumes };
