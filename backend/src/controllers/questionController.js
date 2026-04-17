const { extractTextFromPDF } = require("../services/pdfService");
const { generateQuestionsWithNvidia: generateQuestions } = require("../services/nvidiaService");

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

    // 2. Generate quiz via Gemini (returns { quiz_title, questions })
    const quizData = await generateQuestions(text);

    // 3. Return response
    return res.status(200).json({
      success: true,
      quizTitle: quizData.quiz_title,
      questions: quizData.questions,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

module.exports = {
  handleGenerateQuestions,
};
