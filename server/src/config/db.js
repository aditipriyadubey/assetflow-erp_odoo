/**
 * server/src/config/db.js
 * Owner: Developer 3
 *
 * Single shared mysql2/promise connection pool used by every
 * repository.js across every module (SDD §8 layering, §32 Performance:
 * "Connection pooling via mysql2/promise createPool — not a new
 * connection per request"). Every module imports this same pool
 * instance; nothing should ever call `createPool` a second time.
 *
 * Config is read from environment variables (SDD §30): DB_HOST,
 * DB_PORT, DB_USER, DB_PASSWORD, DB_NAME. `.env` is gitignored;
 * `.env.example` documents the expected keys with placeholders.
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

/**
 * The pool itself. mysql2/promise handles connection reuse/queuing
 * internally — callers just `await pool.query(...)` and never manage
 * individual connections (except transactional flows, which check out
 * a connection explicitly via pool.getConnection()).
 */
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  namedPlaceholders: false,
  dateStrings: false,
});

/**
 * Idle connections in the pool can still throw asynchronously (e.g.
 * the MySQL server restarts, or drops a stale connection). Without a
 * handler here, that becomes an uncaught exception and crashes the
 * whole process — so we log it and let the pool recover on the next
 * query instead of taking the server down.
 */
pool.on('error', (err) => {
  // eslint-disable-next-line no-console -- intentional: this is the
  // last line of defense for an unexpected pool-level failure.
  console.error('[AssetFlow] Unexpected MySQL pool error:', err.message);
});

/**
 * One-time startup connectivity check. Failures are logged, not
 * thrown — a transient DB outage at boot shouldn't crash the process;
 * every subsequent request will simply fail with a clear SERVER_ERROR
 * via the central error handler until the database is reachable.
 */
async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    // eslint-disable-next-line no-console -- intentional startup log.
    console.log(`[AssetFlow] Connected to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}.`);
  } catch (err) {
    // eslint-disable-next-line no-console -- intentional: surfaces a
    // misconfigured/offline DB clearly at startup without crashing.
    console.error('[AssetFlow] Failed to connect to MySQL:', err.message);
  }
}

verifyConnection();

module.exports = pool;