import { useMemo, useState } from 'react';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Table from '../components/common/Table';
import ReportCard from '../components/feature/reports/ReportCard';
import { getReportsMockData } from '../utils/mockReportsData';

function ReportsPage() {
  const initialState = getReportsMockData();
  const [range, setRange] = useState('quarter');
  const [loading] = useState(false);
  const [error] = useState('');

  const summaryCards = useMemo(() => {
    if (range === 'month') {
      return [
        { key: 'assets', label: 'Registered assets', value: '22', trend: '+2 this month' },
        { key: 'allocations', label: 'Active allocations', value: '7', trend: '+1 this month' },
        { key: 'maintenance', label: 'Open maintenance', value: '3', trend: '1 high priority' },
        { key: 'bookings', label: 'Upcoming bookings', value: '5', trend: 'No conflicts' },
      ];
    }

    return initialState.summaryCards;
  }, [initialState.summaryCards, range]);

  const rangeOptions = [
    { value: 'quarter', label: 'Quarterly' },
    { value: 'month', label: 'Monthly' },
  ];

  const analyticsSections = [
    {
      title: 'Asset lifecycle',
      data: initialState.lifecycleBreakdown,
    },
    {
      title: 'Allocation mix',
      data: initialState.utilizationBreakdown,
    },
    {
      title: 'Maintenance load',
      data: initialState.maintenanceBreakdown,
    },
    {
      title: 'Booking activity',
      data: initialState.bookingsBreakdown,
    },
  ];

  const tableColumns = [
    { key: 'label', header: 'Category' },
    { key: 'value', header: 'Count' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Review portfolio health, utilization, and service trends with lightweight mock analytics.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Select
            label="Period"
            name="range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            options={rangeOptions}
          />
        </div>
      </header>

      <ErrorBanner error={error} />

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading reports" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load reports" description={error} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <ReportCard key={card.key} label={card.label} value={card.value} trend={card.trend} accent={card.key === 'maintenance' ? 'warning' : card.key === 'bookings' ? 'success' : 'primary'} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {analyticsSections.map((section) => (
              <Card key={section.title}>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{section.title}</h3>
                  <div className="space-y-3">
                    {section.data.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-sm text-neutral-700">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100">
                          <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.min(100, item.value * 8)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Detail table</h3>
              <Table columns={tableColumns} data={initialState.lifecycleBreakdown.map((item) => ({ label: item.label, value: item.value }))} emptyMessage="No report rows available." />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
