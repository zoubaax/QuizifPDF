const { extractTextFromPDF } = require("../services/pdfService");
const { generateQuestions } = require("../services/geminiService");

/**
 * Controller to handle PDF upload and question generation.
 */
const handleGenerateQuestions = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file." });
    }

    // 1. Extract text from PDF buffer
    const text = await extractTextFromPDF(req.file.buffer);

    if (!text || text.length < 50) {
      return res.status(400).json({ 
        error: "The PDF does not contain enough extractable text." 
      });
    }

    // 2. Generate questions via Gemini
    const questions = await generateQuestions(text);

    // 3. Return response
    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

module.exports = {
  handleGenerateQuestions,
};
