import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { createTransferDraft } from '../../../utils/mockAllocationData';

function TransferFormModal({ isOpen, onClose, onSubmit, assets = [], employees = [], initialValue }) {
  const [form, setForm] = useState(() => (initialValue ? { ...createTransferDraft(), ...initialValue } : createTransferDraft()));
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setForm(initialValue ? { ...createTransferDraft(), ...initialValue } : createTransferDraft());
    setErrors({});
  };

  const assetOptions = useMemo(
    () => assets.map((asset) => ({ value: asset.id, label: `${asset.asset_tag} — ${asset.name}` })),
    [assets]
  );

  const employeeOptions = useMemo(
    () => employees.map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.role})` })),
    [employees]
  );

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.asset_id) nextErrors.asset_id = 'Asset is required.';
    if (!form.to_user_id) nextErrors.to_user_id = 'Destination employee is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      asset_id: Number(form.asset_id),
      to_user_id: Number(form.to_user_id),
      requested_by: 2,
      status: 'Requested',
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Transfer"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="transfer-form">Submit Request</Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Asset"
          name="asset_id"
          value={form.asset_id}
          onChange={handleChange}
          options={assetOptions}
          placeholder="Select an asset"
          required
          error={errors.asset_id}
        />
        <Select
          label="Transfer to"
          name="to_user_id"
          value={form.to_user_id}
          onChange={handleChange}
          options={employeeOptions}
          placeholder="Select an employee"
          required
          error={errors.to_user_id}
        />
      </form>
    </Modal>
  );
}

export default TransferFormModal;
