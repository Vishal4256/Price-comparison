const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const RefreshTokenRepository = require('../repositories/RefreshTokenRepository');
const UserDTO = require('../dtos/UserDTO');
const { UnauthorizedError, ConflictError, NotFoundError } = require('../errors/AppError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

class AuthService {
  async register(name, email, password) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserRepository.create({
      name,
      email,
      password: hashedPassword
    });

    return this.generateAuthResponse(newUser);
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await RefreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.generateAuthResponse(user);
  }

  async getMe(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      user: UserDTO.toResponse(user)
    };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await RefreshTokenRepository.findByTokenHash(tokenHash);
      if (storedToken) {
        await RefreshTokenRepository.revokeToken(storedToken._id);
      }
    } else {
      // Optional: revoke all tokens for user if specific token isn't provided
      await RefreshTokenRepository.revokeAllForUser(userId);
    }
    return { message: 'Logged out successfully' };
  }

  // --- Helpers ---

  async generateAuthResponse(user) {
    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await RefreshTokenRepository.create({
      user: user._id,
      tokenHash,
      expiresAt
    });

    return {
      accessToken,
      refreshToken,
      user: UserDTO.toResponse(user)
    };
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = new AuthService();
