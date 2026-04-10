# Quizify PDF - AI Question Generator

A full-stack application to transform PDF study materials into interactive questions using Google Gemini AI.

## Project Structure
- **/backend**: Node.js/Express API with Gemini AI integration.
- **/frontend**: React/Vite/Tailwind CSS with premium UI.

## Getting Started

### 1. Prerequisites
- Node.js (v16+)
- Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### 2. Installation
Install dependencies for both projects:
```bash
npm run install:all
```

### 3. Environment Setup
- **Backend**: In `backend/.env`, add your `GEMINI_API_KEY`.
- **Frontend**: Default `VITE_API_URL` is set to `http://localhost:5000/api`.

## Development vs Production

### 🚀 Development Mode
Run both backend and frontend simultaneously with hot-reload:
```bash
npm run dev
```

### 🏗️ Production Mode

1. **Build the Frontend**:
   ```bash
   npm run build:frontend
   ```

2. **Start the Backend**:
   ```bash
   npm start
   ```

*Note: In production, you would typically serve the `frontend/dist` folder using the backend (via `express.static`) or via a CDN/Nginx.*

## Features
- **Premium UI**: Sleek dark mode with glassmorphism and smooth animations.
- **Drag & Drop**: Direct PDF upload support.
- **Instant Generation**: 5-10 structured questions/answers via Gemini Pro.
- **Security First**: Files processed in memory; no storage used.
