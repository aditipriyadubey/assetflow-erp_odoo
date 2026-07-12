import Spinner from './Spinner';

const VARIANT_CLASSES = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-600/90 focus:ring-primary-600',
  secondary:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-600',
  danger:
    'bg-danger-600 text-white hover:bg-danger-600/90 focus:ring-danger-600',
};

function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2',
        'text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner size="sm" label="" />}
      {children}
    </button>
  );
}

export default Button;
