# Project: PDF to Questions Generator

## Project Overview
This application allows users to upload a PDF file, extract its content, and automatically generate questions using an AI model (Gemini API). The goal is to help students learn faster by turning study materials into questions.

## Architecture
- **Frontend**: React (with Tailwind CSS)
- **Backend**: Node.js with Express
- **AI**: Gemini API (Google Generative AI)

## Core Workflow
1. User uploads a PDF file from the frontend.
2. The file is sent to the backend via a POST request.
3. The backend processes the PDF in memory (without saving it to disk or database).
4. Text is extracted from the PDF using a library like `pdf-parse`.
5. The extracted text is cleaned and optionally split into chunks if too large.
6. The processed text is sent to the Gemini API.
7. Gemini generates structured questions (and optionally answers).
8. The backend returns the generated questions as JSON.
9. The frontend displays the questions to the user.

## Important Constraints
- **Zero-Storage Policy**: Do NOT store the PDF file (no disk storage, no database storage).
- **Memory Storage**: Use `multer` with `memoryStorage` only.
- **Security**: The system must be secure (no API key exposure).
- **Large PDF Handling**: Handle large PDFs carefully (chunking if needed).
- **Upload Limit**: Limit upload size (e.g., 5MB).

## Features
- Upload PDF
- Generate questions (5–10)
- Support different difficulty levels (optional)
- Display questions clearly in UI

## Code Requirements
- Clean and modular structure (routes, controllers, services).
- Use `async/await`.
- Proper error handling.
- Use environment variables for secrets.
- Follow best practices for Express apps.

## Goal
Build a scalable, clean, and production-ready backend that can later evolve into a SaaS product.
