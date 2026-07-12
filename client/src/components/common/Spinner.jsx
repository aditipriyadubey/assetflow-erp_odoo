import { Loader2 } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

function Spinner({ size = 'md', label = 'Loading...', className = '' }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      className={['inline-flex items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2 className={`animate-spin text-primary-600 ${sizeClass}`} />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export default Spinner;
