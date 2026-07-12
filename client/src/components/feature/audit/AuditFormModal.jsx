import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { createAuditDraft } from '../../../utils/mockAuditData';

function AuditFormModal({ isOpen, onClose, onSubmit, departments = [], initialValue }) {
  const [form, setForm] = useState(() => (initialValue ? { ...createAuditDraft(), ...initialValue } : createAuditDraft()));
  const [errors, setErrors] = useState({});

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: String(department.id), label: department.name })),
    [departments],
  );

  const resetForm = () => {
    setForm(initialValue ? { ...createAuditDraft(), ...initialValue } : createAuditDraft());
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

    if (!form.name.trim()) {
      nextErrors.name = 'Audit name is required.';
    }

    if (!form.location.trim()) {
      nextErrors.location = 'Location is required.';
    }

    if (!form.start_date) {
      nextErrors.start_date = 'Start date is required.';
    }

    if (!form.end_date) {
      nextErrors.end_date = 'End date is required.';
    }

    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      nextErrors.end_date = 'End date cannot be before the start date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      department_id: form.department_id ? Number(form.department_id) : null,
      start_date: form.start_date,
      end_date: form.end_date,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create audit"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="audit-form">Create audit</Button>
        </>
      }
    >
      <form id="audit-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Audit name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Select
          label="Department"
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          options={[{ value: '', label: 'Select department' }, ...departmentOptions]}
          error={errors.department_id}
        />
        <Input
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          error={errors.location}
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
          />
          <Input
            label="End date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default AuditFormModal;
