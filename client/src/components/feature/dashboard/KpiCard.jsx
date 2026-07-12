import Card from '../../common/Card';

function KpiCard({ icon: Icon, label, value, subtext, accentClass = 'text-primary-600' }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-semibold ${accentClass}`}>{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-neutral-500">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary-50 p-2">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default KpiCard;
