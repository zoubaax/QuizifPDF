/**
 * Global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  console.error("DEBUG ERROR:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
