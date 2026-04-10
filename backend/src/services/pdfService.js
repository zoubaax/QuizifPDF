const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF buffer and cleans it.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} - The extracted and cleaned text.
 */
const extractTextFromPDF = async (buffer) => {
  try {
    console.log("Analyzing PDF buffer, size:", buffer ? buffer.length : 0, "bytes");
    
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty buffer provided");
    }

    // Handle cases where pdf-parse might be exported as an object with a default property
    const pdfParser = typeof pdf === 'function' ? pdf : pdf.default;
    
    if (typeof pdfParser !== 'function') {
      console.log("DEBUG: pdf-parse type is", typeof pdf);
      console.log("DEBUG: pdf-parse keys are", Object.keys(pdf));
      throw new Error("pdf-parse is not correctly imported as a function");
    }

    const data = await pdfParser(buffer);
    
    if (!data || !data.text) {
      throw new Error("No text content found in PDF");
    }

    // Clean and normalize text
    let text = data.text;
    text = text.replace(/\s+/g, ' ').trim();
    
    console.log("Extraction successful, text length:", text.length);
    return text;
  } catch (error) {
    console.error("Detailed PDF Extraction Error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
};
