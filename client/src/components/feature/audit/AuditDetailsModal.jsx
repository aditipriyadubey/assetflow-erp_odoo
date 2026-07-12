import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import Table from '../../common/Table';

function AuditDetailsModal({ isOpen, onClose, audit, assets = [], employees = [], onItemStatusChange, onCloseAudit, canClose = false, canManageItems = false }) {
  if (!audit) {
    return null;
  }

  const itemColumns = [
    { key: 'id', header: 'Item ID' },
    {
      key: 'asset_id',
      header: 'Asset',
      render: (_value, row) => assets.find((asset) => asset.id === row.asset_id)?.name ?? '—',
    },
    {
      key: 'verification_status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'notes',
      header: 'Notes',
    },
    {
      key: 'verified_by',
      header: 'Verified by',
      render: (_value, row) => employees.find((employee) => employee.id === row.verified_by)?.name ?? '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_value, row) => (
        <div className="flex justify-end gap-2">
          {canManageItems && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onItemStatusChange(row.id, 'Verified')}>
                Verified
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onItemStatusChange(row.id, 'Missing')}>
                Missing
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onItemStatusChange(row.id, 'Damaged')}>
                Damaged
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Audit details: ${audit.name}`}>
      <div className="space-y-4 text-sm text-neutral-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Location</p>
            <p className="mt-1 font-medium text-neutral-900">{audit.location}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
            <p className="mt-1 font-medium text-neutral-900">{audit.status}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Start date</p>
            <p className="mt-1 font-medium text-neutral-900">{audit.start_date}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">End date</p>
            <p className="mt-1 font-medium text-neutral-900">{audit.end_date}</p>
          </div>
        </div>

        {canClose && (
          <div className="flex justify-end">
            <Button onClick={onCloseAudit}>Close audit</Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table columns={itemColumns} data={audit.items ?? []} emptyMessage="No audit items found." />
        </div>
      </div>
    </Modal>
  );
}

export default AuditDetailsModal;
