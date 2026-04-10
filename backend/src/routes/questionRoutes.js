const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { handleGenerateQuestions } = require("../controllers/questionController");

// POST /api/generate-questions
// Middleware: upload.single('pdf') handles the multipart/form-data
router.post("/generate-questions", upload.single("pdf"), handleGenerateQuestions);

module.exports = router;
