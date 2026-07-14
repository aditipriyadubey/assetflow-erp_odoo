/**
 * server/src/app.js
 * Owner: Developer 3 (mounts everyone's routes)
 *
 * MISSING FILE. There was no app.js or server.js anywhere in the ZIP,
 * so despite every module having routes/controllers/services, the
 * backend has no entry point and cannot be started at all.
 *
 * Global middleware order per SDD §16:
 *   helmet → cors → express.json → morgan(dev) → rateLimiter → routes
 *   → 404 handler → centralized errorHandler
 *
 * IMPORTANT — folder-name mismatch (see audit report §Phase 3):
 * the `maintenance` and `audits` modules were delivered as
 * `modules/Maintenance` and `modules/Audits` (capitalized), and
 * `notifications` was delivered at `src/notifications` instead of
 * `src/modules/notifications`. The requires below point at the
 * ACTUAL paths that exist in the ZIP so the app boots today. Renaming
 * those two folders to lowercase and moving notifications under
 * modules/ (see integration plan) is recommended cleanup, not a
 * blocker — just update the three require paths below if you do it.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { CLIENT_ORIGIN, NODE_ENV } = require('./config/env');
const { sendError } = require('./utils/responseEnvelope');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./modules/auth/routes');
const usersRoutes = require('./modules/users/routes');
const departmentsRoutes = require('./modules/departments/routes');
const categoriesRoutes = require('./modules/categories/routes');
const assetsRoutes = require('./modules/assets/routes');
const allocationsRoutes = require('./modules/allocations/routes');
const transfersRoutes = require('./modules/transfers/routes');
const bookingsRoutes = require('./modules/bookings/routes');
const maintenanceRoutes = require('./modules/Maintenance/routes'); // TODO: rename folder to lowercase `maintenance`
const auditsRoutes = require('./modules/Audits/routes'); // TODO: rename folder to lowercase `audits`
const reportsRoutes = require('./modules/reports/routes');
const dashboardRoutes = require('./modules/dashboard/routes');
const notificationsRoutes = require('./notifications/routes'); // TODO: move to modules/notifications
const activityLogsRoutes = require('./modules/activityLogs/routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General API-wide rate limit (per-route limiters, e.g. /auth/login,
// are stricter and defined in their own routes.js per SDD §31).
app.use(
  '/api/v1',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/departments', departmentsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/v1/allocations', allocationsRoutes);
app.use('/api/v1/transfers', transfersRoutes);
app.use('/api/v1/bookings', bookingsRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/audits', auditsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/activity-logs', activityLogsRoutes);

// 404 handler (must come after all routes, before errorHandler)
app.use((req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} does not exist.`);
});

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
