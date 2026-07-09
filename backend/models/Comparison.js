const mongoose = require("mongoose");

const comparisonSchema = new mongoose.Schema(
  {
    // Clerk user id
    user: {
      type: String,
      required: true,
      index: true,
    },
    fileA: { type: String, required: true },
    fileB: { type: String, required: true },
    mode: { type: String, default: "general" },
    type: { type: String, default: "resume-vs-resume" },
    winner: { type: String, default: "Tie" },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    result: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comparison", comparisonSchema);
