/**
 * server/src/modules/auth/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/auth (SDD §14). All routes here are public
 * except GET /me, which requires a valid access token.
 * Rate limiting on /login and /forgot-password per SDD §31 Security
 * Practices ("Rate limiting on /auth/login and /auth/forgot-password
 * to blunt brute force").
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

const { authenticate } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  signupValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  refreshTokenValidators,
} = require('./validators');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Too many login attempts. Please try again later.' },
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Too many password reset requests. Please try again later.',
    },
  },
});

router.post('/signup', signupValidators, validate, controller.signup);
router.post('/login', loginLimiter, loginValidators, validate, controller.login);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  forgotPasswordValidators,
  validate,
  controller.forgotPassword
);
router.post('/reset-password', resetPasswordValidators, validate, controller.resetPassword);
router.post('/refresh-token', refreshTokenValidators, validate, controller.refreshToken);
router.get('/me', authenticate, controller.me);

module.exports = router;