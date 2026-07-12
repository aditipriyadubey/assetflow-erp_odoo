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
import MaintenanceDetailsModal from '../components/feature/maintenance/MaintenanceDetailsModal';
import MaintenanceFormModal from '../components/feature/maintenance/MaintenanceFormModal';
import useAuth from '../hooks/useAuth';
import { getMaintenanceMockData, formatMaintenanceDate } from '../utils/mockMaintenanceData';

function MaintenancePage() {
  const { user } = useAuth();
  const initialState = getMaintenanceMockData();
  const [maintenanceRequests, setMaintenanceRequests] = useState(initialState.maintenance);
  const [assets] = useState(initialState.assets);
  const [employees] = useState(initialState.employees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading] = useState(false);
  const [error] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  const canRaise = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'].includes(user?.role);
  const canApprove = ['Admin', 'AssetManager'].includes(user?.role);
  const canAssign = ['Admin', 'AssetManager'].includes(user?.role);
  const canProgress = ['Admin', 'AssetManager'].includes(user?.role);
  const canResolve = ['Admin', 'AssetManager'].includes(user?.role);

  const filteredMaintenance = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return maintenanceRequests.filter((request) => {
      const asset = assets.find((item) => item.id === request.asset_id);
      const employee = employees.find((item) => item.id === request.raised_by);
      const matchesSearch =
        !normalizedSearch ||
        asset?.name?.toLowerCase().includes(normalizedSearch) ||
        employee?.name?.toLowerCase().includes(normalizedSearch) ||
        request.issue_description.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || request.status === statusFilter;
      const matchesPriority = !priorityFilter || request.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assets, employees, maintenanceRequests, priorityFilter, search, statusFilter]);

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.maintenanceStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.maintenanceStatuses],
  );

  const priorityOptions = useMemo(
    () => [{ value: '', label: 'All priorities' }, ...initialState.maintenancePriorities.map((priority) => ({ value: priority, label: priority }))],
    [initialState.maintenancePriorities],
  );

  const handleCreate = (payload) => {
    setMaintenanceRequests((prev) => [{
      ...payload,
      id: Date.now(),
      raised_by: payload.raised_by ?? user?.id ?? 1,
      created_at: new Date().toISOString().slice(0, 10),
    }, ...prev]);
  };

  const handleApprove = (requestId) => {
    setMaintenanceRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: 'Approved' } : request)));
  };

  const handleReject = (requestId) => {
    setMaintenanceRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: 'Rejected' } : request)));
  };

  const handleAssignTechnician = (requestId) => {
    if (!technicianName.trim()) {
      return;
    }
    setMaintenanceRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: 'TechnicianAssigned', technician_name: technicianName.trim() } : request)));
    setTechnicianName('');
  };

  const handleMarkInProgress = (requestId) => {
    setMaintenanceRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: 'InProgress' } : request)));
  };

  const handleResolve = (requestId) => {
    setMaintenanceRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: 'Resolved', resolved_at: new Date().toISOString().slice(0, 10) } : request)));
  };

  const openDetails = (request) => {
    setSelectedMaintenance(request);
    setTechnicianName(request.technician_name ?? '');
    setIsDetailsOpen(true);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'asset_id',
      header: 'Asset',
      render: (_value, row) => assets.find((asset) => asset.id === row.asset_id)?.name ?? '—',
    },
    {
      key: 'issue_description',
      header: 'Issue',
    },
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
    {
      key: 'created_at',
      header: 'Raised',
      render: (value) => formatMaintenanceDate(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_value, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openDetails(row)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Maintenance Management</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Review maintenance requests, assign technicians, and track resolution progress.
          </p>
        </div>
        {canRaise && <Button onClick={() => setIsFormOpen(true)}>Raise Maintenance Request</Button>}
      </header>

      <ErrorBanner error={error} />

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by asset, person, or issue"
          />
          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            name="priorityFilter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            options={priorityOptions}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading maintenance requests" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load maintenance requests" description={error} />
      ) : filteredMaintenance.length ? (
        <Table columns={columns} data={filteredMaintenance} emptyMessage="No maintenance requests found." />
      ) : (
        <EmptyState title="No maintenance requests found" description="Try changing your filters or raise a new request." />
      )}

      <MaintenanceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        assets={assets}
        priorities={initialState.maintenancePriorities}
        currentUserId={user?.id}
      />

      <MaintenanceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedMaintenance(null);
          setTechnicianName('');
        }}
        maintenance={selectedMaintenance}
        assetName={selectedMaintenance ? assets.find((asset) => asset.id === selectedMaintenance.asset_id)?.name ?? '—' : '—'}
        raisedByName={selectedMaintenance ? employees.find((employee) => employee.id === selectedMaintenance.raised_by)?.name ?? '—' : '—'}
        technicianName={technicianName}
        onTechnicianNameChange={setTechnicianName}
        onApprove={() => selectedMaintenance && handleApprove(selectedMaintenance.id)}
        onReject={() => selectedMaintenance && handleReject(selectedMaintenance.id)}
        onAssignTechnician={() => selectedMaintenance && handleAssignTechnician(selectedMaintenance.id)}
        onMarkInProgress={() => selectedMaintenance && handleMarkInProgress(selectedMaintenance.id)}
        onResolve={() => selectedMaintenance && handleResolve(selectedMaintenance.id)}
        canApprove={canApprove && selectedMaintenance?.status === 'Pending'}
        canReject={canApprove && selectedMaintenance?.status === 'Pending'}
        canAssign={canAssign && selectedMaintenance?.status === 'Approved'}
        canProgress={canProgress && selectedMaintenance?.status === 'TechnicianAssigned'}
        canResolve={canResolve && selectedMaintenance?.status === 'InProgress'}
      />
    </div>
  );
}

export default MaintenancePage;
