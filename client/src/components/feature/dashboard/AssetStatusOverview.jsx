import Card from '../../common/Card';
import { getStatusColorClasses } from '../../../utils/statusColors';

function AssetStatusOverview({ statusCounts = [] }) {
  const total = statusCounts.reduce((sum, item) => sum + item.count, 0) || 1;

  if (!statusCounts.length) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900">Asset Status Overview</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Distribution of assets across lifecycle statuses
      </p>

      <div className="mt-6 space-y-4">
        {statusCounts.map((item) => {
          const percentage = Math.round((item.count / total) * 100);
          const colorClasses = getStatusColorClasses(item.status);
          const barColor = colorClasses.includes('success')
            ? 'bg-success-600'
            : colorClasses.includes('warning')
              ? 'bg-warning-600'
              : colorClasses.includes('danger')
                ? 'bg-danger-600'
                : colorClasses.includes('info')
                  ? 'bg-info-600'
                  : colorClasses.includes('primary')
                    ? 'bg-primary-600'
                    : 'bg-neutral-400';

          return (
            <div key={item.status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">{item.status}</span>
                <span className="text-neutral-500">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AssetStatusOverview;
