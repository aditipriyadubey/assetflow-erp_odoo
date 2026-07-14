/**
 * server/src/server.js
 * Owner: Developer 3
 *
 * MISSING FILE. The actual process entry point (what `node server.js`
 * / `nodemon` / the `dev` npm script runs). app.js only builds the
 * Express app object; this is what binds it to a port.
 */

const app = require('./app');
const { PORT } = require('./config/env');

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[AssetFlow] API server listening on http://localhost:${PORT}/api/v1`);
});

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('[AssetFlow] Unhandled rejection:', err);
  server.close(() => process.exit(1));
});
