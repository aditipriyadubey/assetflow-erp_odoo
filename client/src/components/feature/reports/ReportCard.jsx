function ReportCard({ label, value, trend, accent = 'primary' }) {
  const accentClasses = {
    primary: 'border-primary-200 bg-primary-50 text-primary-700',
    success: 'border-success-200 bg-success-50 text-success-700',
    warning: 'border-warning-200 bg-warning-50 text-warning-700',
    danger: 'border-danger-200 bg-danger-50 text-danger-700',
  };

  return (
    <div className={['rounded-lg border p-4', accentClasses[accent] ?? accentClasses.primary].join(' ')}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm opacity-80">{trend}</p>
    </div>
  );
}

export default ReportCard;
