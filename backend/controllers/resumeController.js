const { analyzeResume } = require("../services/resumeService");
const Analysis = require("../models/Analysis");

const getResume = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded"
            });
        }

        const { jobDescription, jobTitle } = req.body;
        // console.log(jobDescription);

        const result = await analyzeResume(req.file, jobDescription);

        if (result.error) {

            return res.status(400).json({
                success: false,
                message: result.message
            });

        }

        // Save analysis to MongoDB (scoped to the authenticated user)
        await Analysis.create({
            user: req.user.id,
            jobTitle: jobTitle || "Custom Job Description",
            jobDescription,
            fileName: req.file.originalname,
            matchScore: result.matchScore,
            recommendation: result.recommendation,
            analysis: result
        });

        res.json({
            success: true,
            analysis: result
        });

    } catch (error) {

    console.error(error);

    // Gemini server busy
    if (error.status === 503) {
        return res.status(503).json({
            success: false,
            message:
                "Gemini AI is currently experiencing high demand. Please wait a few seconds and try again."
        });
    }

    // Gemini rate limit exceeded
    if (error.status === 429) {
        return res.status(429).json({
            success: false,
            message:
                "Rate limit exceeded. Please wait a minute and try again."
        });
    }

    return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again."
    });

    }

};

// Get the authenticated user's analysis history (most recent first)
const getHistory = async (req, res) => {
    try {
        const history = await Analysis.find({ user: req.user.id }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            history,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to load history",
        });
    }
};

// Delete a single analysis (only if it belongs to the user)
const deleteHistoryItem = async (req, res) => {
    try {
        const deleted = await Analysis.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Analysis not found",
            });
        }

        res.json({
            success: true,
            message: "Analysis deleted",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete analysis",
        });
    }
};

// Clear all analyses for the authenticated user
const clearHistory = async (req, res) => {
    try {
        await Analysis.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: "History cleared",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to clear history",
        });
    }
};

module.exports = {
    getResume,
    getHistory,
    deleteHistoryItem,
    clearHistory,
};