const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

/**
 * Initialize the unified Google GenAI client.
 * Using API Key mode (Google AI Studio).
 * Note: Project/location are not supported when using an API Key.
 */
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = client;
