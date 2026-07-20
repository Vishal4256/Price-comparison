const express = require('express');
const router = express.Router();
const AuthService = require('../../services/AuthService');
const { successResponse } = require('../../utils/response');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/authValidation');
const { requireAuth } = require('../../middlewares/auth');

router.post('/register', validate(authValidation.register), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    successResponse(res, result, req.id, 201);
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(authValidation.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    // Refresh token typically sent in a cookie or body. We'll check body for MVP.
    const { refreshToken } = req.body;
    const result = await AuthService.refresh(refreshToken);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await AuthService.getMe(userId);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { refreshToken } = req.body;
    const result = await AuthService.logout(userId, refreshToken);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

// Mock forgot-password (since it typically requires email service)
router.post('/forgot-password', async (req, res, next) => {
  try {
    successResponse(res, { message: 'Password reset link sent' }, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
