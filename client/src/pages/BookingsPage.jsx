import { useMemo, useState } from 'react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Table from '../components/common/Table';
import BookingFormModal from '../components/feature/booking/BookingFormModal';
import useAuth from '../hooks/useAuth';
import { getBookingMockData, formatBookingDateTime } from '../utils/mockBookingData';

function BookingsPage() {
  const { user } = useAuth();
  const initialState = getBookingMockData();
  const [bookings, setBookings] = useState(initialState.bookings);
  const [assets] = useState(initialState.assets);
  const [departments] = useState(initialState.departments);
  const [employees] = useState(initialState.employees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading] = useState(false);
  const [error] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const canBook = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'].includes(user?.role);
  const canCancel = ['Admin', 'AssetManager', 'DepartmentHead'].includes(user?.role);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const asset = assets.find((item) => item.id === booking.asset_id);
      const employee = employees.find((item) => item.id === booking.booked_by);
      const matchesSearch =
        !normalizedSearch ||
        asset?.name?.toLowerCase().includes(normalizedSearch) ||
        employee?.name?.toLowerCase().includes(normalizedSearch) ||
        booking.purpose.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, bookings, employees, search, statusFilter]);

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.bookingStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.bookingStatuses],
  );

  const handleCreateBooking = (payload) => {
    setBookings((prev) => [{
      ...payload,
      id: Date.now(),
      booked_by: payload.booked_by ?? user?.id ?? 1,
    }, ...prev]);
  };

  const handleCancel = (bookingId) => {
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking)));
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'asset_id',
      header: 'Resource',
      render: (_value, row) => assets.find((asset) => asset.id === row.asset_id)?.name ?? '—',
    },
    {
      key: 'purpose',
      header: 'Purpose',
    },
    {
      key: 'start_time',
      header: 'Start',
      render: (value) => formatBookingDateTime(value),
    },
    {
      key: 'end_time',
      header: 'End',
      render: (value) => formatBookingDateTime(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_value, row) => (
        <div className="flex justify-end gap-2">
          {canCancel && row.status !== 'Cancelled' && (
            <Button variant="secondary" onClick={() => handleCancel(row.id)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Resource Booking</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Book shared resources, review upcoming reservations, and manage cancellations.
          </p>
        </div>
        {canBook && <Button onClick={() => setIsBookingOpen(true)}>Book Resource</Button>}
      </header>

      <ErrorBanner error={error} />

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by resource, person, or purpose"
          />
          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading bookings" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load bookings" description={error} />
      ) : filteredBookings.length ? (
        <Table columns={columns} data={filteredBookings} emptyMessage="No bookings found." />
      ) : (
        <EmptyState title="No bookings found" description="Try adjusting your filters or create a new booking." />
      )}

      <BookingFormModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSubmit={handleCreateBooking}
        assets={assets}
        departments={departments}
        existingBookings={bookings}
        currentUserId={user?.id}
      />
    </div>
  );
}

export default BookingsPage;
