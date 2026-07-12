/**
 * server/src/modules/auth/service.js
 * Owner: Developer 3
 *
 * Pure business logic for authentication (SDD §8 layering). Never
 * touches req/res. Every failure path throws a typed AppError
 * (SDD §28); the central error-handling middleware converts that into
 * the standard error envelope (SDD Shared Contracts §A.1/A.2).
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const repository = require('./repository');
const AppError = require('../../utils/AppError');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES,
  BCRYPT_SALT_ROUNDS,
  NODE_ENV,
} = require('../../config/env');

const SALT_ROUNDS = Number(BCRYPT_SALT_ROUNDS) || 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Strips sensitive/internal fields before a user object leaves this
 * module. Passwords are never returned in any API response (SDD §31).
 * @param {object} user
 * @returns {{id:number,name:string,email:string,role:string,department_id:number|null,status:string}|null}
 */
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department_id: user.department_id,
    status: user.status,
  };
}

/**
 * @param {{id:number, role:string, department_id:number|null, email:string, name:string}} user
 */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, department_id: user.department_id, email: user.email, name: user.name },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES }
  );
}

/**
 * @param {{id:number, role:string, department_id:number|null, email:string, name:string}} user
 */
function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, department_id: user.department_id, email: user.email, name: user.name },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );
}

/**
 * FR-1.1: signup always creates an Employee-role account. There is no
 * role field accepted here — validators.js already rejects a `role`
 * key on the request body before this ever runs.
 * @param {{name:string, email:string, password:string}} input
 * @returns {Promise<object>} sanitized user
 */
async function signup({ name, email, password }) {
  const existing = await repository.findByEmail(email);
  if (existing) {
    throw new AppError('DUPLICATE_EMAIL', 'An account with this email already exists.', 409, {
      email: 'An account with this email already exists.',
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = await repository.createUser({ name, email, passwordHash, role: 'Employee' });
  const user = await repository.findById(userId);

  return sanitizeUser(user);
}

/**
 * @param {{email:string, password:string}} input
 * @returns {Promise<{user:object, accessToken:string, refreshToken:string}>}
 */
async function login({ email, password }) {
  const user = await repository.findByEmail(email);

  // Same generic error whether the email doesn't exist, the account
  // is inactive, or the password is wrong — never reveal which.
  if (!user || user.status !== 'Active') {
    throw new AppError('INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
  }

  const safeUser = sanitizeUser(user);
  const accessToken = signAccessToken(safeUser);
  const refreshToken = signRefreshToken(safeUser);

  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Always resolves with a generic success message regardless of
 * whether the email exists, to prevent user enumeration
 * (SDD §26 edge cases). Per the offline-friendly constraint (SDD §34)
 * there is no real mail provider: the reset token is logged
 * server-side and, outside production only, also returned in the
 * response body so the local/offline demo can complete the flow
 * without an SMTP server.
 * @param {{email:string}} input
 */
async function forgotPassword({ email }) {
  const genericMessage = 'If an account with that email exists, a password reset link has been sent.';
  const user = await repository.findByEmail(email);

  if (!user || user.status !== 'Active') {
    return { message: genericMessage };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await repository.setResetToken(user.id, token, expiresAt);

  // eslint-disable-next-line no-console -- intentional: offline/local
  // demo substitute for a real mail provider (SDD §34).
  console.log(
    `[AssetFlow] Password reset token for ${user.email}: ${token} (expires ${expiresAt.toISOString()})`
  );

  const result = { message: genericMessage };
  if (NODE_ENV !== 'production') {
    result.resetToken = token; // local/demo convenience only
  }
  return result;
}

/**
 * @param {{token:string, newPassword:string}} input
 */
async function resetPassword({ token, newPassword }) {
  const genericError = 'This reset link is invalid or has expired.';
  const user = await repository.findByResetToken(token);

  if (!user || user.status !== 'Active') {
    throw new AppError('VALIDATION_ERROR', genericError, 400);
  }

  if (!user.reset_token_expires || new Date(user.reset_token_expires).getTime() < Date.now()) {
    throw new AppError('VALIDATION_ERROR', genericError, 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await repository.updatePasswordHash(user.id, passwordHash);

  return { message: 'Your password has been reset. You can now log in with your new password.' };
}

/**
 * Issues a new access token from a valid, non-expired refresh token.
 * Per SDD §14.1, only a new accessToken is returned (the refresh
 * token itself is not rotated in this flow).
 * @param {{refreshToken:string}} input
 */
async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('TOKEN_EXPIRED', 'Your session has expired. Please log in again.', 401);
    }
    throw new AppError('UNAUTHENTICATED', 'Invalid refresh token.', 401);
  }

  const user = await repository.findById(payload.sub);
  if (!user || user.status !== 'Active') {
    throw new AppError('UNAUTHENTICATED', 'Invalid refresh token.', 401);
  }

  const accessToken = signAccessToken(sanitizeUser(user));

  return { accessToken };
}

/**
 * @param {number} userId
 * @returns {Promise<object>} sanitized current user profile
 */
async function getMe(userId) {
  const user = await repository.findById(userId);
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found.', 404);
  }
  return sanitizeUser(user);
}

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  getMe,
};