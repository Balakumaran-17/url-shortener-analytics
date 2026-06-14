const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await authService.registerUser({ username, email, password });
      return sendSuccess(res, 201, 'User registered successfully', { user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Log in user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

      // Set Refresh Token as HTTP-Only Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, 200, 'Login successful', {
        user,
        accessToken,
        refreshToken // Returned in body as fallback
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Rotate Token Pair
   */
  async refresh(req, res, next) {
    try {
      // Check cookies or authorization header body
      let token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        // Fallback checks for Auth headers if needed
        const authHeader = req.headers['x-refresh-token'];
        if (authHeader) token = authHeader;
      }

      const { accessToken, refreshToken } = await authService.rotateTokens(token);

      // Reset HTTP-Only Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, 200, 'Token rotated successfully', {
        accessToken,
        refreshToken
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Secure Logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.userId;
      await authService.logoutUser(userId);

      // Clear refresh token cookies
      res.clearCookie('refreshToken');

      return sendSuccess(res, 200, 'Logout successful');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Current Authenticated User Info
   */
  async me(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await authService.getUserById(userId);
      return sendSuccess(res, 200, 'User profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
