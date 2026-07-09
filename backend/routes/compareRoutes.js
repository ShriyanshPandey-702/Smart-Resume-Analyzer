const express = require("express");
const router = express.Router();

const {
  createComparison,
  getComparisons,
  getComparison,
  deleteComparison,
} = require("../controllers/compareController");
const upload = require("../middleware/uploadMiddleware");
const requireUser = require("../middleware/requireUser");

// Compare two resumes (reuses the same disk-upload middleware as /resume)
router.post(
  "/",
  requireUser,
  upload.fields([
    { name: "resumeA", maxCount: 1 },
    { name: "resumeB", maxCount: 1 },
  ]),
  createComparison
);

router.get("/history", requireUser, getComparisons);
router.get("/:id", requireUser, getComparison);
router.delete("/:id", requireUser, deleteComparison);

module.exports = router;
