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
import AllocationFormModal from '../components/feature/allocations/AllocationFormModal';
import TransferFormModal from '../components/feature/allocations/TransferFormModal';
import useAuth from '../hooks/useAuth';
import { getAllocationMockData } from '../utils/mockAllocationData';

function AllocationsPage() {
  const { user } = useAuth();
  const initialState = getAllocationMockData();
  const [allocations, setAllocations] = useState(initialState.allocations);
  const [transfers, setTransfers] = useState(initialState.transfers);
  const [assets] = useState(initialState.assets);
  const [employees] = useState(initialState.employees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('allocations');
  const [loading] = useState(false);
  const [error] = useState('');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const canManage = ['Admin', 'AssetManager'].includes(user?.role);
  const canApproveTransfer = ['Admin', 'AssetManager'].includes(user?.role);

  const filteredAllocations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return allocations.filter((allocation) => {
      const asset = assets.find((item) => item.id === allocation.asset_id);
      const employee = employees.find((item) => item.id === allocation.employee_id);
      const matchesSearch =
        !normalizedSearch ||
        asset?.name?.toLowerCase().includes(normalizedSearch) ||
        employee?.name?.toLowerCase().includes(normalizedSearch) ||
        allocation.status.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || allocation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allocations, assets, employees, search, statusFilter]);

  const filteredTransfers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return transfers.filter((transfer) => {
      const asset = assets.find((item) => item.id === transfer.asset_id);
      const toUser = employees.find((item) => item.id === transfer.to_user_id);
      const matchesSearch =
        !normalizedSearch ||
        asset?.name?.toLowerCase().includes(normalizedSearch) ||
        toUser?.name?.toLowerCase().includes(normalizedSearch) ||
        transfer.status.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || transfer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, employees, search, statusFilter, transfers]);

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.allocationStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.allocationStatuses],
  );

  const transferStatusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.transferStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.transferStatuses],
  );

  const handleCreateAllocation = (payload) => {
    const nextAllocation = {
      ...payload,
      id: Date.now(),
      status: payload.status ?? 'Active',
    };
    setAllocations((prev) => [nextAllocation, ...prev]);
  };

  const handleCreateTransfer = (payload) => {
    const nextTransfer = {
      ...payload,
      id: Date.now(),
      requested_at: new Date().toISOString().slice(0, 10),
      approved_by: null,
      resolved_at: null,
    };
    setTransfers((prev) => [nextTransfer, ...prev]);
  };

  const handleReturn = (allocationId) => {
    setAllocations((prev) => prev.map((allocation) => (allocation.id === allocationId ? { ...allocation, status: 'Returned' } : allocation)));
  };

  const handleTransferDecision = (transferId, status) => {
    setTransfers((prev) => prev.map((transfer) => (transfer.id === transferId ? { ...transfer, status, approved_by: 2, resolved_at: new Date().toISOString().slice(0, 10) } : transfer)));
  };

  const allocationColumns = [
    { key: 'id', header: 'ID' },
    {
      key: 'asset_id',
      header: 'Asset',
      render: (_value, row) => assets.find((asset) => asset.id === row.asset_id)?.name ?? '—',
    },
    {
      key: 'employee_id',
      header: 'Holder',
      render: (_value, row) => employees.find((employee) => employee.id === row.employee_id)?.name ?? '—',
    },
    { key: 'allocated_date', header: 'Allocated' },
    { key: 'expected_return_date', header: 'Expected Return' },
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
          {canManage && row.status === 'Active' && (
            <Button variant="secondary" onClick={() => handleReturn(row.id)}>
              Return
            </Button>
          )}
        </div>
      ),
    },
  ];

  const transferColumns = [
    { key: 'id', header: 'ID' },
    {
      key: 'asset_id',
      header: 'Asset',
      render: (_value, row) => assets.find((asset) => asset.id === row.asset_id)?.name ?? '—',
    },
    {
      key: 'to_user_id',
      header: 'Transfer To',
      render: (_value, row) => employees.find((employee) => employee.id === row.to_user_id)?.name ?? '—',
    },
    { key: 'requested_at', header: 'Requested' },
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
          {canApproveTransfer && row.status === 'Requested' && (
            <>
              <Button variant="secondary" onClick={() => handleTransferDecision(row.id, 'Approved')}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => handleTransferDecision(row.id, 'Rejected')}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Asset Allocation & Transfers</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Review current allocations, manage returns, and handle transfer requests.
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button onClick={() => setIsAllocationOpen(true)}>Allocate Asset</Button>
          )}
          {canManage && (
            <Button variant="secondary" onClick={() => setIsTransferOpen(true)}>Request Transfer</Button>
          )}
        </div>
      </header>

      <ErrorBanner error={error} />

      <Card>
        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === 'allocations' ? 'primary' : 'secondary'} onClick={() => setActiveTab('allocations')}>
            Allocations
          </Button>
          <Button variant={activeTab === 'transfers' ? 'primary' : 'secondary'} onClick={() => setActiveTab('transfers')}>
            Transfers
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by asset, holder, or status"
          />
          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={activeTab === 'allocations' ? statusOptions : transferStatusOptions}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading allocations" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load records" description={error} />
      ) : activeTab === 'allocations' ? (
        filteredAllocations.length ? (
          <Table columns={allocationColumns} data={filteredAllocations} emptyMessage="No allocations found." />
        ) : (
          <EmptyState title="No allocations found" description="Try adjusting your filters or create a new allocation." />
        )
      ) : filteredTransfers.length ? (
        <Table columns={transferColumns} data={filteredTransfers} emptyMessage="No transfer requests found." />
      ) : (
        <EmptyState title="No transfer requests found" description="Create a transfer request to get started." />
      )}

      <AllocationFormModal
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
        onSubmit={handleCreateAllocation}
        assets={assets}
        employees={employees}
      />

      <TransferFormModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSubmit={handleCreateTransfer}
        assets={assets}
        employees={employees}
      />
    </div>
  );
}

export default AllocationsPage;
