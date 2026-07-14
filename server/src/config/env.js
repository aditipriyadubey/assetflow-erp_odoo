/**
 * server/src/config/env.js
 * Owner: Developer 3
 *
 * MISSING FILE — required by server/src/middlewares/auth.js and
 * server/src/modules/auth/service.js (both already `require('../config/env')`
 * / `require('../../config/env')`), but the file did not exist anywhere in
 * the submitted ZIP. Without it, the server crashes immediately on boot
 * with `Cannot find module '../config/env'` the moment the auth module
 * is loaded.
 *
 * Single place that reads and validates process.env (SDD Part 3 §30).
 * Every other file should import named values from here instead of
 * reading process.env directly, so a missing/misconfigured var fails
 * loudly at startup rather than silently (e.g. `undefined` JWT secret).
 */

require('dotenv').config();

const REQUIRED_VARS = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Fail loudly at boot rather than limping along with undefined secrets.
  // eslint-disable-next-line no-console
  console.error(
    `[AssetFlow] Missing required environment variables: ${missing.join(', ')}. ` +
      'Copy server/.env.example to server/.env and fill in real values.'
  );
  process.exit(1);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
