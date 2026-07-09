const { compareResumes } = require("../services/compareService");
const { getAuth } = require("@clerk/express");
const Comparison = require("../models/Comparison");

// POST /api/compare — analyze & compare two resumes
const createComparison = async (req, res) => {
  try {
    const fileA = req.files?.resumeA?.[0];
    const fileB = req.files?.resumeB?.[0];

    if (!fileA || !fileB) {
      return res.status(400).json({
        success: false,
        message: "Please upload both resumes (Resume A and Resume B).",
      });
    }

    const { mode = "general", type = "resume-vs-resume" } = req.body;
    const labelA = fileA.originalname;
    const labelB = fileB.originalname;

    const result = await compareResumes(fileA, fileB, mode, labelA, labelB);

    if (result.error) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const doc = await Comparison.create({
      user: getAuth(req).userId,
      fileA: labelA,
      fileB: labelB,
      mode,
      type,
      winner: result.winner || "Tie",
      scoreA: Number(result.resumeA?.atsScore ?? 0),
      scoreB: Number(result.resumeB?.atsScore ?? 0),
      result,
    });

    return res.json({ success: true, id: doc._id, comparison: result, fileA: labelA, fileB: labelB, mode });
  } catch (error) {
    console.error(error);

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: "Gemini AI is currently busy. Please wait a few seconds and try again.",
      });
    }
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please wait a minute and try again.",
      });
    }
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/compare/history — the user's past comparisons
const getComparisons = async (req, res) => {
  try {
    const history = await Comparison.find({ user: getAuth(req).userId })
      .sort({ createdAt: -1 })
      .select("fileA fileB mode type winner scoreA scoreB createdAt");
    return res.json({ success: true, history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load comparisons" });
  }
};

// GET /api/compare/:id — reopen a full comparison
const getComparison = async (req, res) => {
  try {
    const doc = await Comparison.findOne({ _id: req.params.id, user: getAuth(req).userId });
    if (!doc) return res.status(404).json({ success: false, message: "Comparison not found" });
    return res.json({ success: true, comparison: doc.result, fileA: doc.fileA, fileB: doc.fileB, mode: doc.mode });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load comparison" });
  }
};

// DELETE /api/compare/:id
const deleteComparison = async (req, res) => {
  try {
    const deleted = await Comparison.findOneAndDelete({ _id: req.params.id, user: getAuth(req).userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Comparison not found" });
    return res.json({ success: true, message: "Comparison deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete comparison" });
  }
};

module.exports = { createComparison, getComparisons, getComparison, deleteComparison };
