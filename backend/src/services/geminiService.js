const genAI = require("../config/gemini");

/**
 * Generates questions from the provided text using Gemini API.
 * @param {string} text - The text to generate questions from.
 * @returns {Promise<Object[]>} - A list of generated questions.
 */
const generateQuestions = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Limit text length to avoid token limits (approximate)
    // For a real production app, you might want more complex chunking
    const maxChars = 30000; 
    const truncatedText = text.substring(0, maxChars);

    const prompt = `
      You are an expert educator. Based on the following text, generate 5 to 10 high-quality questions to test understanding.
      Provide the output strictly in JSON format as an array of objects.
      Each object should have "question" and "answer" fields.
      
      Text:
      ${truncatedText}
      
      Output format:
      [
        { "question": "...", "answer": "..." },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Find the JSON part in case Gemini adds markdown backticks
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Gemini returned invalid JSON format");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    throw new Error("Failed to generate questions using AI");
  }
};

module.exports = {
  generateQuestions,
};
