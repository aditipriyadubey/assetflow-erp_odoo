const INVALID_DATE = '—';

function toDate(value) {
  if (value == null || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Formats a date as a human-readable locale date string (e.g. Jan 15, 2026).
 */
export function formatDate(value) {
  const date = toDate(value);

  if (!date) {
    return INVALID_DATE;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date with time as a human-readable locale string.
 */
export function formatDateTime(value) {
  const date = toDate(value);

  if (!date) {
    return INVALID_DATE;
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
