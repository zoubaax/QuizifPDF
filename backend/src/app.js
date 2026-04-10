const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const questionRoutes = require("./routes/questionRoutes");
const healthRoutes = require("./routes/healthRoutes");
const errorHandler = require("./middlewares/errorHandler");
const apiLimiter = require("./middlewares/rateLimiter");

const app = express();

// Security Middlewares
app.use(helmet()); // Basic security headers
app.use(cors()); // Enable CORS
app.use(apiLimiter); // Rate limiting

// Logging Middleware
app.use(morgan("dev"));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", healthRoutes);
app.use("/api", questionRoutes);

// Global Error Handler (should be last)
app.use(errorHandler);

module.exports = app;
