function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  ...rest
}) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-danger-600"> *</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        className={[
          'block w-full rounded-md border px-3 py-2 text-sm text-neutral-900',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-600',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
          error ? 'border-danger-600' : 'border-neutral-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-danger-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
