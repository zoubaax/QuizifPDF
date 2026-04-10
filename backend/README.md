# PDF to Questions Generator API

A production-ready Node.js/Express backend that extracts text from uploaded PDF files and uses Google Gemini AI to generate study questions.

## Features
- **PDF Extractions**: Uses `pdf-parse` for fast text extraction.
- **AI Powered**: Integrates with Google Gemini Pro.
- **Secure**: Uses `helmet`, `cors`, and `express-rate-limit`.
- **Memory Storage**: PDF files are processed in memory and never saved to disk.
- **Modular Design**: Clean separation of routes, controllers, and services.

## Prerequisites
- Node.js (v16 or higher)
- A Google Gemini API Key. [Get one here](https://aistudio.google.com/app/apikey).

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

## Running the Application

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### 1. Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: `200 OK`

### 2. Generate Questions
- **URL**: `/api/generate-questions`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `pdf`: The PDF file (max 5MB)
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "questions": [
      {
        "question": "What is the main topic of the text?",
        "answer": "The main topic is..."
      }
    ]
  }
  ```

## Project Structure
```text
src/
├── config/       # Configuration (Gemini API)
├── controllers/  # Request handlers
├── middlewares/  # Express middlewares (Upload, Error, Rate Limit)
├── routes/       # API route definitions
├── services/     # Business logic (PDF extraction, Gemini AI)
├── app.js        # Express app setup
└── server.js     # Server entry point
```
