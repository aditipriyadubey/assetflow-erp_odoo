/**
 * server/src/modules/auth/controller.js
 * Owner: Developer 3
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** POST /auth/signup */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await service.signup({ name, email, password });
  return sendSuccess(res, 201, user);
});

/** POST /auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await service.login({ email, password });
  return sendSuccess(res, 200, result);
});

/** POST /auth/forgot-password */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await service.forgotPassword({ email });
  return sendSuccess(res, 200, result, result.message);
});

/** POST /auth/reset-password */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await service.resetPassword({ token, newPassword });
  return sendSuccess(res, 200, {}, result.message);
});

/** POST /auth/refresh-token */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await service.refresh({ refreshToken: token });
  return sendSuccess(res, 200, result);
});

/** GET /auth/me */
const me = asyncHandler(async (req, res) => {
  const user = await service.getMe(req.user.id);
  return sendSuccess(res, 200, user);
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  me,
};