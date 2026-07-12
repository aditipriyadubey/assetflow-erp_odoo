import { useMemo } from 'react';
import {
  AlertTriangle,
  Calendar,
  Package,
  PackageCheck,
  PackageOpen,
  Wrench,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getDashboardMockData } from '../utils/mockDashboardData';
import ErrorBanner from '../components/common/ErrorBanner';
import Spinner from '../components/common/Spinner';
import AssetStatusOverview from '../components/feature/dashboard/AssetStatusOverview';
import AttentionSection from '../components/feature/dashboard/AttentionSection';
import KpiCard from '../components/feature/dashboard/KpiCard';
import QuickActionsBar from '../components/feature/dashboard/QuickActionsBar';
import RecentActivityList from '../components/feature/dashboard/RecentActivityList';

function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useMemo(() => {
    try {
      return {
        data: getDashboardMockData(),
        isLoading: false,
        error: null,
      };
    } catch {
      return {
        data: null,
        isLoading: false,
        error: 'Unable to load dashboard data. Please try again later.',
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner error={error} />;
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-neutral-900">Dashboard</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Welcome back, {user?.name ?? 'User'}. Here is your asset management overview.
        </p>
      </header>

      <QuickActionsBar userRole={user?.role} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard icon={Package} label="Total Assets" value={kpis.totalAssets} subtext="Registered in system" />
        <KpiCard icon={PackageOpen} label="Available Assets" value={kpis.availableAssets} subtext="Ready for use" accentClass="text-success-600" />
        <KpiCard icon={PackageCheck} label="Allocated Assets" value={kpis.allocatedAssets} subtext="Currently assigned" accentClass="text-primary-600" />
        <KpiCard icon={Wrench} label="Under Maintenance" value={kpis.underMaintenance} subtext={`${kpis.maintenanceToday} in progress today`} accentClass="text-info-600" />
        <KpiCard icon={AlertTriangle} label="Overdue Returns" value={kpis.overdueReturns} subtext="Past expected return date" accentClass="text-danger-600" />
        <KpiCard icon={Calendar} label="Upcoming Bookings" value={kpis.upcomingBookings} subtext={`${kpis.pendingTransfers} pending transfers`} accentClass="text-warning-600" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AssetStatusOverview statusCounts={data.assetStatusCounts} />
        <RecentActivityList activities={data.recentActivity} />
      </section>

      <AttentionSection
        overdueReturns={data.overdueReturns}
        upcomingBookings={data.upcomingBookings}
        maintenanceAttention={data.maintenanceAttention}
      />
    </div>
  );
}

export default DashboardPage;
