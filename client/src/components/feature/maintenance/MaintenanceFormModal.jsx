import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { createMaintenanceDraft } from '../../../utils/mockMaintenanceData';

function MaintenanceFormModal({ isOpen, onClose, onSubmit, assets = [], priorities = [], currentUserId, initialValue }) {
  const [form, setForm] = useState(() => (initialValue ? { ...createMaintenanceDraft(), ...initialValue } : createMaintenanceDraft()));
  const [errors, setErrors] = useState({});

  const assetOptions = useMemo(
    () => assets.map((asset) => ({ value: String(asset.id), label: asset.name })),
    [assets],
  );

  const priorityOptions = useMemo(
    () => priorities.map((priority) => ({ value: priority, label: priority })),
    [priorities],
  );

  const resetForm = () => {
    setForm(initialValue ? { ...createMaintenanceDraft(), ...initialValue } : createMaintenanceDraft());
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.asset_id) {
      nextErrors.asset_id = 'Please select the affected asset.';
    }

    if (!form.issue_description.trim()) {
      nextErrors.issue_description = 'Please describe the issue.';
    }

    if (!form.priority) {
      nextErrors.priority = 'Please select a priority.';
    }

    if (form.issue_description.trim().length < 10) {
      nextErrors.issue_description = 'Please provide a more detailed issue description.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...form,
      asset_id: Number(form.asset_id),
      issue_description: form.issue_description.trim(),
      priority: form.priority,
      photo_url: form.photo_url.trim(),
      raised_by: currentUserId ?? 1,
      status: 'Pending',
      approved_by: null,
      technician_name: '',
      resolved_at: null,
    };

    onSubmit(payload);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Raise maintenance request"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="maintenance-form">Submit request</Button>
        </>
      }
    >
      <form id="maintenance-form" className="space-y-4" onSubmit={handleSubmit}>
        <Select
          label="Asset"
          name="asset_id"
          value={form.asset_id}
          onChange={handleChange}
          options={[{ value: '', label: 'Select asset' }, ...assetOptions]}
          error={errors.asset_id}
          required
        />

        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={[{ value: '', label: 'Select priority' }, ...priorityOptions]}
          error={errors.priority}
          required
        />

        <Input
          label="Issue description"
          name="issue_description"
          value={form.issue_description}
          onChange={handleChange}
          placeholder="Describe the issue in detail"
          error={errors.issue_description}
          required
        />

        <Input
          label="Photo URL"
          name="photo_url"
          value={form.photo_url}
          onChange={handleChange}
          placeholder="Optional image reference"
          error={errors.photo_url}
        />
      </form>
    </Modal>
  );
}

export default MaintenanceFormModal;
