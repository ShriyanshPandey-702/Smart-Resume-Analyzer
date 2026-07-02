const { analyzeResume } = require("../services/resumeService");

const getResume = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded"
            });
        }

        const { jobDescription } = req.body;
        // console.log(jobDescription);

        const result = await analyzeResume(req.file, jobDescription);

        if (result.error) {

            return res.status(400).json({
                success: false,
                message: result.message
            });

        }

        res.json({
            success: true,
            analysis: result
        });

    } catch (error) {

    console.error(error);

    if (error.status === 429) {
        return res.status(429).json({
            success: false,
            message: "Gemini API quota exceeded. Please try again later."
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

    }

};

module.exports = {
    getResume
};