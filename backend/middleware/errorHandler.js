/**
 * Centralized Error Handler Middleware
 * Catches all errors thrown by controllers and sends a consistent JSON response.
 */
const config = require('../config');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log non-operational (unexpected) errors with full stack
  if (!isOperational) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: isOperational ? err.message : 'Internal server error',
  });
}

module.exports = errorHandler;
