const VARIANT_CLASSES = {
  success: 'bg-green-50 text-success-600',
  warning: 'bg-amber-50 text-warning-600',
  danger: 'bg-red-50 text-danger-600',
  info: 'bg-cyan-50 text-info-600',
  primary: 'bg-primary-50 text-primary-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

const STATUS_VARIANT_MAP = {
  Available: 'success',
  Approved: 'success',
  Resolved: 'success',
  Verified: 'success',
  Active: 'success',

  Reserved: 'warning',
  Pending: 'warning',
  Upcoming: 'warning',
  Draft: 'warning',
  Requested: 'warning',
  High: 'warning',

  Lost: 'danger',
  Rejected: 'danger',
  Overdue: 'danger',
  Missing: 'danger',
  Critical: 'danger',
  Damaged: 'danger',

  'Under Maintenance': 'info',
  InProgress: 'info',
  Ongoing: 'info',
  TechnicianAssigned: 'info',

  Allocated: 'primary',
  Medium: 'primary',

  Retired: 'neutral',
  Disposed: 'neutral',
  Cancelled: 'neutral',
  Completed: 'neutral',
  Returned: 'neutral',
  Closed: 'neutral',
  Low: 'neutral',
};

/**
 * Returns Tailwind classes for a status badge based on centralized semantic mapping.
 */
export function getStatusColorClasses(status) {
  if (status == null || status === '') {
    return VARIANT_CLASSES.neutral;
  }

  const variant = STATUS_VARIANT_MAP[status] ?? 'neutral';
  return VARIANT_CLASSES[variant];
}
