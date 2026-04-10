const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF buffer and cleans it.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} - The extracted and cleaned text.
 */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    
    // Clean and normalize text
    let text = data.text;
    
    // Replace multiple newlines or spaces with a single space to save tokens
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = {
  extractTextFromPDF,
};
