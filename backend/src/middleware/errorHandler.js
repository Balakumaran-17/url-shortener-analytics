const { sendError } = require('../utils/response');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Exclude stack trace in production
  const errorDetails = process.env.NODE_ENV === 'production' 
    ? {} 
    : { stack: err.stack, details: err.details };

  return sendError(res, statusCode, message, errorDetails);
};

module.exports = errorHandler;
