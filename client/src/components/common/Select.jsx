function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  id,
  ...rest
}) {
  const selectId = id ?? name;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-danger-600"> *</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={[
          'block w-full rounded-md border px-3 py-2 text-sm text-neutral-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-600',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
          error ? 'border-danger-600' : 'border-neutral-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${selectId}-error`} className="text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
