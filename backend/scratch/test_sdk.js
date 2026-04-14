const { GoogleGenAI } = require('@google/genai');
const client = new GoogleGenAI({ apiKey: 'dummy' });
console.log('Models object:', Object.keys(client.models));
