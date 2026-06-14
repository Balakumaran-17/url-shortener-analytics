const { sendError } = require('../utils/response');

/**
 * Admin role check middleware.
 * Must be used AFTER authenticateJWT so req.user is populated.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return sendError(res, 403, 'Access denied. Admin privileges required.', {
    code: 'FORBIDDEN'
  });
};

module.exports = { isAdmin };
