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
import AuditDetailsModal from '../components/feature/audit/AuditDetailsModal';
import AuditFormModal from '../components/feature/audit/AuditFormModal';
import useAuth from '../hooks/useAuth';
import { getAuditMockData } from '../utils/mockAuditData';

function AuditsPage() {
  const { user } = useAuth();
  const initialState = getAuditMockData();
  const [audits, setAudits] = useState(initialState.audits);
  const [assets] = useState(initialState.assets);
  const [departments] = useState(initialState.departments);
  const [employees] = useState(initialState.employees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading] = useState(false);
  const [error] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const canCreate = ['Admin', 'AssetManager'].includes(user?.role);
  const canManageItems = ['Admin', 'AssetManager'].includes(user?.role);
  const canClose = ['Admin', 'AssetManager'].includes(user?.role) && selectedAudit?.status === 'InProgress';

  const filteredAudits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return audits.filter((audit) => {
      const department = departments.find((item) => item.id === audit.department_id);
      const matchesSearch =
        !normalizedSearch ||
        audit.name.toLowerCase().includes(normalizedSearch) ||
        audit.location.toLowerCase().includes(normalizedSearch) ||
        department?.name?.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || audit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [audits, departments, search, statusFilter]);

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.auditStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.auditStatuses],
  );

  const handleCreateAudit = (payload) => {
    const nextAudit = {
      ...payload,
      id: Date.now(),
      status: 'Draft',
      created_by: user?.id ?? 1,
      items: [],
    };
    setAudits((prev) => [nextAudit, ...prev]);
  };

  const handleOpenDetails = (audit) => {
    setSelectedAudit(audit);
    setIsDetailsOpen(true);
  };

  const handleItemStatusChange = (itemId, nextStatus) => {
    setAudits((prev) => prev.map((audit) => (audit.id === selectedAudit?.id ? {
      ...audit,
      items: audit.items.map((item) => (item.id === itemId ? { ...item, verification_status: nextStatus, verified_by: user?.id ?? 1, verified_at: new Date().toISOString().slice(0, 10) } : item)),
    } : audit)));
  };

  const handleCloseAudit = () => {
    setAudits((prev) => prev.map((audit) => (audit.id === selectedAudit?.id ? { ...audit, status: 'Closed' } : audit)));
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Audit Name' },
    {
      key: 'department_id',
      header: 'Department',
      render: (_value, row) => departments.find((department) => department.id === row.department_id)?.name ?? '—',
    },
    { key: 'location', header: 'Location' },
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
          <Button variant="secondary" onClick={() => handleOpenDetails(row)}>
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
          <h2 className="text-2xl font-semibold text-neutral-900">Asset Audits</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create audits, verify assets, and track audit completion.
          </p>
        </div>
        {canCreate && <Button onClick={() => setIsFormOpen(true)}>Start Audit</Button>}
      </header>

      <ErrorBanner error={error} />

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by audit, location, or department"
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
          <Spinner size="lg" label="Loading audits" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load audits" description={error} />
      ) : filteredAudits.length ? (
        <Table columns={columns} data={filteredAudits} emptyMessage="No audits found." />
      ) : (
        <EmptyState title="No audits found" description="Create a new audit to get started." />
      )}

      <AuditFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateAudit}
        departments={departments}
      />

      <AuditDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAudit(null);
        }}
        audit={selectedAudit}
        assets={assets}
        employees={employees}
        onItemStatusChange={handleItemStatusChange}
        onCloseAudit={handleCloseAudit}
        canClose={canClose}
        canManageItems={canManageItems}
      />
    </div>
  );
}

export default AuditsPage;
