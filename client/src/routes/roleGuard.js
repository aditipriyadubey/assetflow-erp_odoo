import { ROLES } from '../utils/constants';

/**
 * Route-level role access for frontend UX only — backend RBAC is authoritative.
 * Paths follow SDD Part 2 §15.
 */
export const ROUTE_ROLE_ACCESS = {
  '/organization': ['Admin'],
  '/reports': ['Admin', 'AssetManager', 'DepartmentHead'],
  '/audits': ['Admin', 'AssetManager'],
};

export function hasRole(userRole, allowedRoles) {
  if (!userRole || !allowedRoles?.length) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function canAccessRoute(userRole, pathname) {
  const allowedRoles = ROUTE_ROLE_ACCESS[pathname];

  if (!allowedRoles) {
    return true;
  }

  return hasRole(userRole, allowedRoles);
}

export function isValidRole(role) {
  return ROLES.includes(role);
}
