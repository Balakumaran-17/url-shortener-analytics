const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ username, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      const error = new Error(`${field} is already in use`);
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Log in user and generate token pair
   */
  async loginUser({ email, password }) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user model
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Rotate refresh token and issue new access token
   */
  async rotateTokens(token) {
    if (!token) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      throw error;
    }

    // Verify token structure
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      const error = new Error('Token rotation mismatch or user not found');
      error.statusCode = 403;
      throw error;
    }

    // Generate new tokens (Token Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Revoke/logout token session
   */
  async logoutUser(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return true;
  }

  /**
   * Get user details
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
