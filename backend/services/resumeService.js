const ai = require("../config/gemini");
const extractTextFromPDF = require("../utils/extractText");
const isResume = require("../utils/validateResume");

const analyzeResume = async (file, jobDescription) => {

    const resumeText = await extractTextFromPDF(file.path);

    if (!isResume(resumeText)) {

        return {
            error: true,
            message: "The uploaded file is not a resume. Please upload a valid resume."
        };

    }

    const prompt = `
    You are an expert Technical Recruiter and ATS Resume Screening System.

    Your task is to compare the candidate's resume against the provided job description.

    Evaluate how well the candidate matches the role.

    Return ONLY valid JSON.

    Response format:

    {
    "matchScore": number,
    "recommendation": "",
    "matchedSkills": [],
    "missingSkills": [],
    "strengths": [],
    "skillGaps": [],
    "reasoning": "",
    "suggestions": []
    }

    Rules:

    - Compare the resume ONLY against the provided job description.
    - Do NOT invent skills, education, certifications, or experience.
    - Base every conclusion strictly on the resume.
    - Never assume or infer a skill.
    - Only include skills, technologies, achievements, or experience that are explicitly mentioned in the resume.
    - If something is not written in the resume, treat it as missing.

    Treat the Job Description as the hiring requirements and the Resume as the candidate profile.
    Compare both documents objectively and explain only observable matches and gaps.

    Scoring Guidelines:

    90–100
    Candidate satisfies almost every required skill and experience.

    75–89
    Candidate satisfies most required skills with only minor gaps.

    60–74
    Candidate has several relevant skills but notable missing requirements.

    40–59
    Candidate has limited alignment with the job requirements.

    0–39
    Candidate lacks most required skills or experience.

    Return:

    - matchScore (0–100)

    Recommendation must be exactly one of:

    - Excellent Match
    - Good Match
    - Average Match
    - Poor Match

    Requirements:

    - matchedSkills: 3–8 items.
    - missingSkills: 3–8 items.
    - strengths: 3–8 items.
    - skillGaps: 3–8 items.
    - suggestions: 3–8 items.

    Only include items that are genuinely supported by the resume and job description.
    Do not fabricate additional points to satisfy a fixed count.

    Each bullet:
    - 3–10 words
    - Professional
    - ATS-focused
    - No paragraphs

    Reasoning:
    Write 2–3 concise sentences explaining why the score was assigned.

    The matchScore MUST be consistent with:
    - matchedSkills
    - missingSkills
    - strengths
    - skillGaps
    - reasoning

    The recommendation, reasoning, and matchScore must all agree with each other.

    Return valid JSON only.

    Resume:

    ${resumeText}

    -------------------------------------

    Job Description:

    ${jobDescription}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    let text = response.text;

    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "").trim();

    // console.log(text);

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Invalid JSON returned by Gemini:", text);

        return {
            error: true,
            message: "Failed to parse AI response. Please try again."
        };
    }
};

module.exports = {
    analyzeResume,
};