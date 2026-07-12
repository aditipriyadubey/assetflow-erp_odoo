import { getStatusColorClasses } from '../../utils/statusColors';

function Badge({ status, className = '' }) {
  const displayValue = status == null || status === '' ? 'Unknown' : String(status);
  const colorClasses = getStatusColorClasses(displayValue === 'Unknown' ? null : status);

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayValue}
    </span>
  );
}

export default Badge;
