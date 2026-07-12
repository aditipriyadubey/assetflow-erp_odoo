import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import { formatMaintenanceDate } from '../../../utils/mockMaintenanceData';

function MaintenanceDetailsModal({
  isOpen,
  onClose,
  maintenance,
  assetName = '—',
  raisedByName = '—',
  technicianName,
  onTechnicianNameChange,
  onApprove,
  onReject,
  onAssignTechnician,
  onMarkInProgress,
  onResolve,
  canApprove = false,
  canReject = false,
  canAssign = false,
  canProgress = false,
  canResolve = false,
}) {
  if (!maintenance) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maintenance request details">
      <div className="space-y-4 text-sm text-neutral-700">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Asset</p>
            <p className="mt-1 font-medium text-neutral-900">{assetName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Raised by</p>
            <p className="mt-1 font-medium text-neutral-900">{raisedByName}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Issue</p>
          <p className="mt-1 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-neutral-800">
            {maintenance.issue_description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Priority</p>
            <p className="mt-1 font-medium text-neutral-900">{maintenance.priority}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
            <p className="mt-1 font-medium text-neutral-900">{maintenance.status}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Technician</p>
            <p className="mt-1 font-medium text-neutral-900">{maintenance.technician_name || 'Not assigned yet'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Created</p>
            <p className="mt-1 font-medium text-neutral-900">{formatMaintenanceDate(maintenance.created_at)}</p>
          </div>
        </div>

        {canAssign && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <Input
              label="Technician name"
              name="technicianName"
              value={technicianName}
              onChange={(event) => onTechnicianNameChange(event.target.value)}
              placeholder="Assign technician"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={onAssignTechnician}>Assign technician</Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <Button variant="secondary" onClick={onApprove}>
              Approve
            </Button>
          )}
          {canReject && (
            <Button variant="danger" onClick={onReject}>
              Reject
            </Button>
          )}
          {canProgress && (
            <Button variant="secondary" onClick={onMarkInProgress}>
              Mark in progress
            </Button>
          )}
          {canResolve && (
            <Button onClick={onResolve}>
              Resolve request
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default MaintenanceDetailsModal;
