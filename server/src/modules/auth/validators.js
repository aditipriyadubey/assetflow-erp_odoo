/**
 * server/src/modules/auth/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Messages match
 * SDD §26 Validation Rules verbatim. Controllers never trust raw
 * req.body directly (SDD §28).
 */

const { body } = require('express-validator');

const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include a letter and a number.';

const signupValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Name is required (2–150 characters).'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage(PASSWORD_MESSAGE)
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage(PASSWORD_MESSAGE)
    .matches(/[0-9]/)
    .withMessage(PASSWORD_MESSAGE),
  // FR-1.1: signup has no role field — reject if the client sends one
  // rather than silently ignoring it.
  body('role').not().exists().withMessage('Role cannot be set at signup.'),
];

const loginValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotPasswordValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
];

const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage(PASSWORD_MESSAGE)
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage(PASSWORD_MESSAGE)
    .matches(/[0-9]/)
    .withMessage(PASSWORD_MESSAGE),
];

const refreshTokenValidators = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.'),
];

module.exports = {
  signupValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  refreshTokenValidators,
};