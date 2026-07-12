import Card from '../../common/Card';
import { formatDateTime } from '../../../utils/formatDate';

function RecentActivityList({ activities = [] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
      <p className="mt-1 text-sm text-neutral-500">Latest events across the organization</p>

      <ul className="mt-4 divide-y divide-neutral-200">
        {activities.map((item) => (
          <li key={item.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium text-neutral-900">{item.action}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{item.detail}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {item.actor} · {formatDateTime(item.timestamp)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default RecentActivityList;
