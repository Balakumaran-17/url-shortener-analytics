const { verifyAccessToken } = require('../utils/token');
const { sendError } = require('../utils/response');

/**
 * Authentication check middleware.
 * Verifies JWT access token in Authorization header.
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return sendError(res, 401, 'Token expired or invalid.');
  }

  // Bind token payload details to request
  req.user = decoded;
  next();
};

module.exports = authenticateJWT;
