function normalizeErrorMessage(error) {
  if (error == null || error === '') {
    return null;
  }

  if (typeof error === 'string') {
    return error.trim() || null;
  }

  if (typeof error === 'object' && typeof error.message === 'string') {
    return error.message.trim() || null;
  }

  return 'Something went wrong. Please try again.';
}

function ErrorBanner({ error, className = '' }) {
  const message = normalizeErrorMessage(error);

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={[
        'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger-600',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {message}
    </div>
  );
}

export default ErrorBanner;
