/**
 * Utility functions for generating standardized API responses.
 * Supports both functional (sendSuccess/sendError) and static method (Response.success/Response.error) calling styles.
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode = 500, message = 'Error occurred', error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: typeof error === 'string' ? { message: error } : error
  });
};

/**
 * Static-style response builder used by adminController.
 * Returns a plain object (not a response — caller must pass to res.json()).
 */
const success = (message = 'Success', data = {}) => ({
  success: true,
  message,
  data
});

const error = (message = 'Error occurred', errorDetails = {}) => ({
  success: false,
  message,
  error: typeof errorDetails === 'string' ? { message: errorDetails } : errorDetails
});

module.exports = {
  sendSuccess,
  sendError,
  success,
  error
};
