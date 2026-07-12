/**
 * server/src/utils/asyncHandler.js
 * Owner: Developer 3
 *
 * Wraps an async Express route handler so any rejected promise (e.g.
 * an AppError thrown from a service.js function, or an unexpected
 * driver error) is forwarded to next(err) automatically (SDD §28:
 * "every controller wrapped in a shared asyncHandler so errors funnel
 * to the central error middleware — no repeated try/catch
 * boilerplate"). Every controller.js in every module wraps its
 * handlers with this exact function — there is no per-module variant.
 */

/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 * @returns {import('express').RequestHandler}
 */
function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;