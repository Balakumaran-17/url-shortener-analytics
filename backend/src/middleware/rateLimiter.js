const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const limitHandler = (message) => {
  return (req, res, next, options) => {
    return sendError(res, 429, message, {
      retryAfter: res.getHeader('Retry-After') || 'Please wait'
    });
  };
};

/**
 * Login Limiter: 5 requests / 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: limitHandler('Too many login attempts. Please try again after 15 minutes.')
});

/**
 * Register Limiter: 10 requests / hour
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  handler: limitHandler('Too many account registrations. Please try again after an hour.')
});

/**
 * URL Creation Limiter: 100 requests / hour
 */
const urlCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  handler: limitHandler('URL shortening rate limit exceeded. Max 100 links per hour.')
});

module.exports = {
  loginLimiter,
  registerLimiter,
  urlCreationLimiter
};
