const express = require("express");
const router = express.Router();

const {
  getResume,
  getHistory,
  deleteHistoryItem,
  clearHistory,
} = require("../controllers/resumeController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Analyze a resume against a job description (saved to the user's history)
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  getResume
);

// History
router.get("/history", authMiddleware, getHistory);
router.delete("/history/:id", authMiddleware, deleteHistoryItem);
router.delete("/history", authMiddleware, clearHistory);

module.exports = router;