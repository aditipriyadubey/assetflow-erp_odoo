import { formatCurrency } from '../../../utils/mockAssetData';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

function AssetDetailsModal({ isOpen, onClose, asset, categoryName, onEdit }) {
  if (!asset) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={asset.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(asset)}>Edit</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-neutral-900">{asset.asset_tag}</span>
          <Badge status={asset.status} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Category</p>
            <p className="mt-1">{categoryName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Condition</p>
            <p className="mt-1">{asset.condition}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Serial number</p>
            <p className="mt-1">{asset.serial_number || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Location</p>
            <p className="mt-1">{asset.location || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Acquisition date</p>
            <p className="mt-1">{asset.acquisition_date || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Acquisition cost</p>
            <p className="mt-1">{formatCurrency(asset.acquisition_cost)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Bookable</p>
            <p className="mt-1">{asset.is_bookable ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">QR code</p>
            <p className="mt-1">{asset.qr_code_value || '—'}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AssetDetailsModal;
