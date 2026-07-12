import Badge from '../../common/Badge';
import Card from '../../common/Card';
import Table from '../../common/Table';
import { formatDate, formatDateTime } from '../../../utils/formatDate';

function AttentionSection({
  overdueReturns = [],
  upcomingBookings = [],
  maintenanceAttention = [],
}) {
  const overdueColumns = [
    { key: 'assetTag', header: 'Asset Tag' },
    { key: 'assetName', header: 'Asset' },
    { key: 'holder', header: 'Holder' },
    {
      key: 'expectedReturnDate',
      header: 'Due Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
  ];

  const bookingColumns = [
    { key: 'resource', header: 'Resource' },
    { key: 'bookedBy', header: 'Booked By' },
    {
      key: 'startTime',
      header: 'Start',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
  ];

  const maintenanceColumns = [
    { key: 'assetTag', header: 'Asset Tag' },
    { key: 'assetName', header: 'Asset' },
    {
      key: 'priority',
      header: 'Priority',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
    { key: 'raisedBy', header: 'Raised By' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">Requires Attention</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Overdue returns, upcoming bookings, and maintenance items
        </p>
      </div>

      <Card className="border-danger-200 bg-red-50/30">
        <h4 className="text-sm font-semibold text-danger-600">Overdue Returns</h4>
        <p className="mt-1 text-xs text-neutral-500">
          Allocations past expected return date
        </p>
        <div className="mt-4">
          <Table columns={overdueColumns} data={overdueReturns} emptyMessage="No overdue returns." />
        </div>
      </Card>

      <Card>
        <h4 className="text-sm font-semibold text-neutral-900">Upcoming Bookings</h4>
        <div className="mt-4">
          <Table columns={bookingColumns} data={upcomingBookings} emptyMessage="No upcoming bookings." />
        </div>
      </Card>

      <Card>
        <h4 className="text-sm font-semibold text-neutral-900">Maintenance Requiring Attention</h4>
        <div className="mt-4">
          <Table
            columns={maintenanceColumns}
            data={maintenanceAttention}
            emptyMessage="No maintenance items require attention."
          />
        </div>
      </Card>
    </div>
  );
}

export default AttentionSection;
